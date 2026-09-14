import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

const nextConfig = (phase: string): NextConfig => {
  const config: NextConfig = {};

  if (process.env.BUILD_STANDALONE === "true") {
    config.output = "standalone";
  }

  if (phase === PHASE_DEVELOPMENT_SERVER) {
    config.webpack = (webpackConfig) => {
      webpackConfig.watchOptions = {
        ...webpackConfig.watchOptions,
        poll: 1000,
        aggregateTimeout: 300,
      };

      return webpackConfig;
    };
  }

  return config;
};

export default nextConfig;
