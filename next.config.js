// next.config.js
module.exports = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'res.cloudinary.com',
          pathname: '/**', // Allows all paths under res.cloudinary.com
        },
      ],
    },
  };