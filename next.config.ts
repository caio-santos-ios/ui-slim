// Local: ~/www/qa-slim/app-slim-frontend/next.config.js (ou .ts)
const nextConfig = {
  basePath: '/erp',        // Define que o app agora vive em /erp
  trailingSlash: true,     // Garante compatibilidade com a barra final do Nginx
  // ... mantenha suas outras configs
};

module.exports = nextConfig;