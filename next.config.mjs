import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "25mb",
    },
    allowedDevOrigins: ["172.19.208.1", "172.19.208.1:3000", "localhost", "127.0.0.1"],
  },
  outputFileTracingRoot: __dirname,
  serverExternalPackages: ["puppeteer", "docx", "image-size"],
};

export default nextConfig;
