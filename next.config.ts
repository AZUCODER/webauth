import { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  // Enable TypeScript type checking during builds
  typescript: {
    ignoreBuildErrors: false,
  },
  // Enable ESLint during builds
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Set the entire application to dynamic rendering mode
  // to avoid issues with cookies and session
  output: 'standalone',
  // Disable static optimization to always use Server-Side Rendering
  staticPageGenerationTimeout: 0,
  // Configure allowed image sources with remotePatterns (more secure than domains)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tony-buymeacoffee.oss-cn-chengdu.aliyuncs.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Prevent client-side bundling of problematic packages
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        // Packages that should only run on server-side
        'proxy-agent': false,
        'urllib': false,
        // Other Node.js specific modules that might cause issues
        'fs': false,
        'net': false,
        'tls': false,
        'child_process': false,
      };
    }
    
    return config;
  },
  // Transpile specific packages that might include server-side code
  transpilePackages: ['urllib', 'proxy-agent'],
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb' // Increase the limit to 50MB
    }
  },
};

export default config;
