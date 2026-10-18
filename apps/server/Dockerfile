FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY apps/server/package*.json ./apps/server/
RUN npm install --workspace=@kagazai/server

COPY apps/server ./apps/server
RUN npm run build --workspace=@kagazai/server

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY apps/server/package*.json ./apps/server/
RUN npm install --omit=dev --workspace=@kagazai/server

COPY --from=builder /app/apps/server/dist ./apps/server/dist

EXPOSE 5001 1234
CMD ["node", "apps/server/dist/index.js"]
