import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // 允许通过局域网 IP 访问 dev server 的 HMR（Next 16 安全特性，默认阻止非 localhost 源）
  allowedDevOrigins: ["192.168.1.4"],
  turbopack: {
    // 消除多 lockfile 时的 workspace root 推断警告
    root: __dirname,
  },
};

export default nextConfig;
