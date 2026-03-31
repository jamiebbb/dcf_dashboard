/** @type {import('next').NextConfig} */
const nextConfig = {
  // Revalidate company pages every hour — balances freshness vs build cost
  experimental: {},
};

module.exports = nextConfig;
