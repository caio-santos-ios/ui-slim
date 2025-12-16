# Estágio de Build
FROM node:20-alpine AS builder
WORKDIR /app

# Adicione estas linhas para aceitar a variável durante o build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=http://72.62.11.203:3001/api

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Estágio de Execução
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

# Garante que a variável também exista em runtime se necessário
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=http://72.62.11.203:3001/api

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]