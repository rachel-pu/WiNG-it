/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Add this back
  trailingSlash: true,
  images: {
    unoptimized: true
  }
};

export default nextConfig;