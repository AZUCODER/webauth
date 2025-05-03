/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  staticGeneration: {
    // Set to false to disable all static generation, forcing dynamic rendering
    enabled: false,
  },
};

module.exports = nextConfig; 