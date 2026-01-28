import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/erp",      // Diz ao Next.js que o endereço oficial é /erp/
  trailingSlash: true,   // Mantém a compatibilidade com as rotas do Nginx
  output: "standalone",  // NECESSÁRIO para o seu Dockerfile não dar erro de pasta
};

export default nextConfig;