import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Allow accessing Next.js dev resource HMR from local network IPs
  allowedDevOrigins: ["192.168.40.133", "localhost:3000"],
};

export default nextConfig;
