import { NextConfig } from 'next';

const config: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tony-buymeacoffee.oss-cn-chengdu.aliyuncs.com',
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
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb' // Increase the limit to 50MB
    }
  },
  async redirects() {
    return [
      {
        source: '/register/verification-pending',
        destination: '/verify-email/pending',
        permanent: true,
      },
      {
        source: '/resend-verification',
        destination: '/verify-email/resend',
        permanent: true,
      },
      {
        source: '/forgot-password',
        destination: '/reset-password/request',
        permanent: true,
      }
    ]
  },
};

export default config;
