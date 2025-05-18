/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)", // apply to all routes
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors https://www.grandoaksburlington.com;", // ✅ allow only this domain
          },
          // ❌ DO NOT SET X-Frame-Options at all
        ],
      },
    ];
  },
};

module.exports = nextConfig;
