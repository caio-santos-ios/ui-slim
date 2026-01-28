// ~/www/qa-slim/ui-slim/next.config.ts
const nextConfig = {
  basePath: '/erp',
  trailingSlash: true,
  output: 'standalone', // <--- ESSA LINHA PRECISA ESTAR AQUI
  // ... outras configs
};

export default nextConfig;