/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  compress: true,
  poweredByHeader: false,

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error']
    } : false,
  },

  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@material-ui/core', '@material-ui/icons'],
  },
  poweredByHeader: false,
  generateEtags: false,

  images: {
    unoptimized: true,
    domains: [
      'source.unsplash.com',
      'images.unsplash.com',
      'lh3.googleusercontent.com',
      'firebasestorage.googleapis.com'
    ]
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  swcMinify: true,

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' data: https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com wss://*.firebaseio.com",
              "frame-src 'self'",
            ].join('; ')
          },
        ]
      }
    ];
  },

  // Environment variables validation
  env: {
    CUSTOM_KEY: process.env.NODE_ENV,
  }
}

module.exports = nextConfig