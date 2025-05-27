/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  
  webpack: (config, { isServer }) => {
    // Handle Node.js specific modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        __dirname: false,
        buffer: require.resolve('buffer/'),
      };
    }

    // Exclude problematic packages from client bundle
    config.module = {
      ...config.module,
      exprContextCritical: false,
      rules: [
        ...config.module.rules,
        {
          test: /\.(pdf|node)$/,
          use: 'null-loader'
        }
      ]
    };

    return config;
  },

  // Exclude certain packages from the client bundle
  experimental: {
    serverComponentsExternalPackages: [
      'pdf-parse',
      'pdf-text-extract',
      'pdfjs',
      'pdfkit',
      'fs-extra'
    ]
  }
};

module.exports = nextConfig; 