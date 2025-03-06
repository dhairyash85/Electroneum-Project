import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env:{
    ENVIRONMENT: process.env.ENVIRONMENT
  }
};

export default nextConfig;
