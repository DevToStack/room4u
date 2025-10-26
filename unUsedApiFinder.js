// find-api-usage.js
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuration
const SEARCH_DIRS = ['./app', './components', './lib', './src', './pages'];
const IGNORE_DIRS = ['node_modules', '.next', '.git', 'build', 'dist', '.cache'];
const FILE_EXTENSIONS = ['.js', '.ts', '.jsx', '.tsx', '.vue', '.svelte'];

// Create readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function extractAPIRouteFromFile(filePath) {
    // Convert file path to API route
    let route = filePath
        .replace(/\\/g, '/')
        .replace(/^.*\/api\//, '') // Remove everything before /api/
        .replace(/\/route\.(js|ts|jsx|tsx)$/, '') // Remove /route.js
        .replace(/\/page\.(js|ts|jsx|tsx)$/, '') // Remove /page.js
        .replace(/\.(js|ts|jsx|tsx)$/, ''); // Remove file extension

    // Handle dynamic routes [id] -> :id for search
    route = route.replace(/\[([^\]]+)\]/g, ':$1');

    // Handle index routes
    if (route.endsWith('/index')) {
        route = route.replace(/\/index$/, '');
    }

    return route ? `/${route}` : '/';
}

function findAllAPIRoutes() {
    const apiRoutes = new Map();

    function scanAPIDirectory(dir = './app/api') {
        if (!fs.existsSync(dir)) return;

        const files = fs.readdirSync(dir);

        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                scanAPIDirectory(filePath);
            } else if (file.match(/route\.(js|ts|jsx|tsx)$/) || file.match(/page\.(js|ts|jsx|tsx)$/)) {
                const apiRoute = extractAPIRouteFromFile(filePath);
                apiRoutes.set(apiRoute, filePath);
            }
        }
    }

    // Scan both app/api and pages/api if they exist
    scanAPIDirectory('./app/api');
    if (fs.existsSync('./pages/api')) {
        scanAPIDirectory('./pages/api');
    }

    return apiRoutes;
}

function searchForAPIUsage(apiRoute, apiFilePath) {
    const results = [];
    const searchPatterns = generateSearchPatterns(apiRoute);

    function searchDirectory(dir) {
        if (!fs.existsSync(dir) || IGNORE_DIRS.some(ignore => dir.includes(ignore))) {
            return;
        }

        const files = fs.readdirSync(dir);

        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                searchDirectory(filePath);
            } else if (shouldSearchFile(filePath) && filePath !== apiFilePath) {
                searchFile(filePath, searchPatterns, apiRoute, results);
            }
        }
    }

    SEARCH_DIRS.forEach(dir => {
        if (fs.existsSync(dir)) {
            searchDirectory(dir);
        }
    });

    return results;
}

function generateSearchPatterns(apiRoute) {
    const patterns = [];

    // Remove leading slash for some patterns
    const routeWithoutSlash = apiRoute.substring(1);

    // Exact match patterns
    patterns.push(`/api${apiRoute}`);
    patterns.push(`"/api${apiRoute}"`);
    patterns.push(`'/api${apiRoute}'`);
    patterns.push(`\`/api${apiRoute}\``);

    // For dynamic routes, create patterns with and without colon
    if (apiRoute.includes(':')) {
        const bracketRoute = apiRoute.replace(/:([^/]+)/g, '[$1]');
        patterns.push(`/api${bracketRoute}`);
        patterns.push(`"/api${bracketRoute}"`);
        patterns.push(`'/api${bracketRoute}'`);

        // Also search for the dynamic part in use
        const dynamicParts = apiRoute.match(/:([^/]+)/g);
        if (dynamicParts) {
            dynamicParts.forEach(part => {
                patterns.push(part.replace(':', ''));
            });
        }
    }

    // Partial matches for nested routes
    const routeParts = apiRoute.split('/').filter(Boolean);
    if (routeParts.length > 1) {
        // Add the main resource name
        patterns.push(routeParts[0]);

        // Add combinations for nested routes
        if (routeParts.length > 2) {
            patterns.push(routeParts.slice(0, 2).join('/'));
        }
    }

    return patterns.filter((pattern, index, self) =>
        pattern && pattern.length > 1 && self.indexOf(pattern) === index
    );
}

function shouldSearchFile(filePath) {
    const ext = path.extname(filePath);
    return FILE_EXTENSIONS.includes(ext) && !filePath.includes('node_modules');
}

function searchFile(filePath, searchPatterns, apiRoute, results) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');

        lines.forEach((line, lineNumber) => {
            const trimmedLine = line.trim();

            // Skip comments
            if (trimmedLine.startsWith('//') || trimmedLine.startsWith('/*') || trimmedLine.startsWith('*')) {
                return;
            }

            searchPatterns.forEach(pattern => {
                if (line.includes(pattern)) {
                    // Check if this is a meaningful match (not in comments)
                    const isMeaningful = !trimmedLine.startsWith('//') &&
                        !trimmedLine.startsWith('/*') &&
                        !trimmedLine.startsWith('*');

                    results.push({
                        file: filePath,
                        line: lineNumber + 1,
                        content: trimmedLine,
                        pattern: pattern,
                        apiRoute: apiRoute,
                        isMeaningful: isMeaningful
                    });
                }
            });
        });
    } catch (error) {
        // Skip files that can't be read
    }
}

function displayResults(apiRoute, apiFilePath, results) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🔍 API Route: /api${apiRoute}`);
    console.log(`📁 Source: ${path.relative('.', apiFilePath)}`);
    console.log(`${'='.repeat(80)}\n`);

    const meaningfulResults = results.filter(r => r.isMeaningful);
    const commentResults = results.filter(r => !r.isMeaningful);

    if (meaningfulResults.length === 0) {
        console.log('❌ No meaningful usage found in code (might be unused)');

        if (commentResults.length > 0) {
            console.log(`\n💬 Found ${commentResults.length} references in comments:`);
            commentResults.slice(0, 3).forEach(result => {
                console.log(`   ${path.relative('.', result.file)}:${result.line}`);
            });
        }
        return;
    }

    console.log(`✅ Found ${meaningfulResults.length} meaningful references:\n`);

    // Group by file
    const files = {};
    meaningfulResults.forEach(result => {
        if (!files[result.file]) {
            files[result.file] = [];
        }
        files[result.file].push(result);
    });

    // Display results by file
    Object.keys(files).forEach(file => {
        console.log(`📄 ${path.relative('.', file)}:`);

        files[file].forEach(result => {
            // Truncate long lines
            const content = result.content.length > 100
                ? result.content.substring(0, 100) + '...'
                : result.content;
            console.log(`   Line ${result.line}: ${content}`);
        });
        console.log('');
    });

    if (commentResults.length > 0) {
        console.log(`💬 Additional ${commentResults.length} references found in comments`);
    }
}

function interactiveSearch() {
    const apiRoutes = findAllAPIRoutes();

    console.log('📋 Available API Routes:\n');
    const routesArray = Array.from(apiRoutes.keys());
    routesArray.forEach((route, index) => {
        console.log(`${index + 1}. /api${route}`);
    });

    console.log(`\nFound ${routesArray.length} API routes\n`);

    rl.question('Enter API route to search (e.g., /users, /bookings/[id], or number from list): ', (input) => {
        let apiRoute;

        // Check if input is a number from the list
        const number = parseInt(input);
        if (!isNaN(number) && number >= 1 && number <= routesArray.length) {
            apiRoute = routesArray[number - 1];
        } else {
            // Remove /api prefix if present and ensure it starts with /
            apiRoute = input.startsWith('/api') ? input.substring(4) : input;
            if (!apiRoute.startsWith('/')) apiRoute = '/' + apiRoute;

            // Convert [id] to :id format for matching
            apiRoute = apiRoute.replace(/\[([^\]]+)\]/g, ':$1');
        }

        if (!apiRoutes.has(apiRoute)) {
            console.log(`❌ API route "/api${apiRoute}" not found`);
            rl.close();
            return;
        }

        const apiFilePath = apiRoutes.get(apiRoute);
        console.log(`\n🔄 Searching for usage of "/api${apiRoute}"...`);

        const startTime = Date.now();
        const results = searchForAPIUsage(apiRoute, apiFilePath);
        const endTime = Date.now();

        displayResults(apiRoute, apiFilePath, results);
        console.log(`⏱️  Search completed in ${endTime - startTime}ms`);

        rl.close();
    });
}

// Command line version
function commandLineSearch(apiRouteInput) {
    const apiRoutes = findAllAPIRoutes();

    let apiRoute = apiRouteInput;

    // Remove /api prefix if present and ensure it starts with /
    apiRoute = apiRoute.startsWith('/api') ? apiRoute.substring(4) : apiRoute;
    if (!apiRoute.startsWith('/')) apiRoute = '/' + apiRoute;

    // Convert [id] to :id format for matching
    apiRoute = apiRoute.replace(/\[([^\]]+)\]/g, ':$1');

    if (!apiRoutes.has(apiRoute)) {
        console.log(`❌ API route "/api${apiRoute}" not found`);
        console.log('\nAvailable routes:');
        apiRoutes.forEach((file, route) => {
            console.log(`  /api${route}`);
        });
        return;
    }

    const apiFilePath = apiRoutes.get(apiRoute);
    console.log(`🔄 Searching for usage of "/api${apiRoute}"...`);

    const startTime = Date.now();
    const results = searchForAPIUsage(apiRoute, apiFilePath);
    const endTime = Date.now();

    displayResults(apiRoute, apiFilePath, results);
    console.log(`⏱️  Search completed in ${endTime - startTime}ms`);
}

// Main execution
if (process.argv.length > 2) {
    // Command line mode
    const apiRoute = process.argv[2];
    commandLineSearch(apiRoute);
} else {
    // Interactive mode
    interactiveSearch();
}