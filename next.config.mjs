/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        '**/pagefile.sys',
        '**/dumpstack.log.tmp',
        '**/swapfile.sys',
        '**/.git/**',
        '**/node_modules/**',
      ],
    };
    return config;
  },
};

export default nextConfig;

