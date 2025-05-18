
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.coingecko.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'coin-images.coingecko.com', // Already present
        port: '',
        pathname: '/**',
      }
      // assets.coingecko.com is used for `thumb` images in the trending API
      // No need to add it again if it's already covered by a broader rule.
      // It is already present and covered by the existing entry.
    ],
  },
};

export default nextConfig;
