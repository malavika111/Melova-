/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: false,
    },
    experimental: {
        serverComponentsExternalPackages: [
            'youtube-transcript',
            '@distube/ytdl-core',
        ],
    },
};

export default nextConfig;
