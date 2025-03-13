/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import('./src/env.mjs');
import withBundleAnalyzer from '@next/bundle-analyzer';
import withPWA from 'next-pwa';

// Only run bundle analyzer when ANALYZE is set to true
const bundleAnalyzerConfig = {
  enabled: process.env.ANALYZE === 'true',
};

// PWA Configuration
const pwaConfig = {
  dest: 'public', // Directory where the service worker will be generated
  disable: process.env.NODE_ENV === 'development', // Disable PWA in development
};

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  output: 'standalone',
  // Prevent TypeScript errors.
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['github.com', '127.0.0.1', 'localhost', 'oaidalleapiprodscus.blob.core.windows.net'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'oaidalleapiprodscus.blob.core.windows.net',
        port: '',
        pathname: '/**',
      },
    ],
  },
  /**
   * If you have `experimental: { appDir: true }` set, then you must comment the below `i18n` config
   * out.
   *
   * @see https://github.com/vercel/next.js/issues/41980
   */
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
  rewrites: async () => [
    { source: '/health', destination: '/api/health' },
    { source: '/healthz', destination: '/api/health' },
    { source: '/api/healthz', destination: '/api/health' },
    { source: '/ping', destination: '/api/health' },
  ],
};
// Combine both withBundleAnalyzer and withPWA
export default withBundleAnalyzer(bundleAnalyzerConfig)(withPWA(pwaConfig)(config));
