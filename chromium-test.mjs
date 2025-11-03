import chromium from "@sparticuz/chromium";

const path = await chromium.executablePath();
console.log("Chromium path:", path);
console.log("Headless:", chromium.headless);
console.log("Args:", chromium.args.slice(0, 5));
