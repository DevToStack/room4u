/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "res.cloudinary.com",
                pathname: "/**",
            },
        ],

        // ➤ Add this
        qualities: [60, 65, 70, 75, 80],
    },
};

export default nextConfig;
