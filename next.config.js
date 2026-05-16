/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: process.env.GITHUB_REPOSITORY ? '/taskforge-frontend' : '',
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000",
    NEXT_PUBLIC_BASE_PATH: process.env.GITHUB_REPOSITORY ? '/taskforge-frontend' : '',
  },
};

module.exports = nextConfig;
