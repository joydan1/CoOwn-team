import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  turbopack: { root: __dirname },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  async headers() {
    return [{
      source: "/(.*)",
      headers: [{
        key: "Content-Security-Policy",
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://newwebpay.interswitchng.com https://newwebpay.qa.interswitchng.com",
          "connect-src 'self' https://coown-team.onrender.com https://newwebpay.interswitchng.com https://newwebpay.qa.interswitchng.com",
          "frame-src 'self' https://newwebpay.interswitchng.com https://newwebpay.qa.interswitchng.com",
          "img-src 'self' data: https:",
          "style-src 'self' 'unsafe-inline'",
        ].join("; "),
      }],
    }]
  },

  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig