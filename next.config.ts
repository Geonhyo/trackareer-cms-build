import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Cloud Run 이미지용: 실행에 필요한 파일만 .next/standalone에 모은다 (Dockerfile)
  output: 'standalone',
};

export default nextConfig;
