/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  env: {
    RAZORPAY_KEY_PRODUCTION: process.env.RAZORPAY_KEY_PRODUCTION,
    RAZORPAY_SECRET_KEY_PRODUCTION: process.env.RAZORPAY_SECRET_KEY_PRODUCTION,
    RAZORPAY_KEY: process.env.RAZORPAY_KEY,
    RAZORPAY_SECRET_KEY: process.env.RAZORPAY_SECRET_KEY,
  },
};

module.exports = nextConfig;
