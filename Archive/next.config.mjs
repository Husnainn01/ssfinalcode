/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  env: {
    MONGODB_USER: process.env.MONGODB_USER,
    MONGODB_PASSWORD: process.env.MONGODB_PASSWORD,
    MONGODB_HOST: process.env.MONGODB_HOST,
  }
};

export default nextConfig;