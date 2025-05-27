/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static file serving for widget.min.js
  output: 'standalone',
  
  // Allow CORS and set security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors https://www.grandoaksburlington.com; default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' blob:; style-src 'self' 'unsafe-inline'; connect-src *; img-src 'self' data: blob:; font-src 'self' data:;"
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ],
      },
      {
        source: '/widget.min.js',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },

  // Ensure proper module resolution
  experimental: {
    esmExternals: true,
  },
};

module.exports = nextConfig; 