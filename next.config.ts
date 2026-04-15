import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/erp",      
  trailingSlash: true,  
  output: "standalone", 
};

export default nextConfig;