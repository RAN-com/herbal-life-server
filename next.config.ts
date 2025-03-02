/** @type {import('next').NextConfig} */
module.exports = {
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === "production", // Only skip linting during production builds
  },
  images: {
    unoptimized: process.env.NODE_ENV !== "production", // Unoptimized only in dev mode, otherwise use default optimization,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s3.amazonaws.com",
        port: "",
        pathname: "/my-bucket/**",
        search: "",
      },
    ],
  },
  env: {
    RAZORPAY_KEY_PRODUCTION: process.env.RAZORPAY_KEY_PRODUCTION,
    RAZORPAY_SECRET_KEY_PRODUCTION: process.env.RAZORPAY_SECRET_KEY_PRODUCTION,
    RAZORPAY_KEY: process.env.RAZORPAY_KEY,
    RAZORPAY_SECRET_KEY: process.env.RAZORPAY_SECRET_KEY,
  },
  reactStrictMode: true, // Ensures strict mode in React during development
};
