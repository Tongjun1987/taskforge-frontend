/** @type {import('next').NextConfig} */
const isGitHubPages = !!process.env.GITHUB_REPOSITORY;
const staticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true' || isGitHubPages;

const nextConfig = {
  output: staticExport ? 'export' : undefined,
  distDir: process.env.NEXT_DIST_DIR || '.next',
  basePath: isGitHubPages ? '/taskforge-frontend' : '',
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000",
    NEXT_PUBLIC_BASE_PATH: isGitHubPages ? '/taskforge-frontend' : '',
  },
};

module.exports = nextConfig;
