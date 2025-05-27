/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static file serving for widget.min.js
  output: 'standalone',
  
  // Allow CORS for widget embedding
  async headers() {
    return [
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
};

module.exports = nextConfig; 