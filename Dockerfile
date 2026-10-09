# Production image for the 東吳 LinkIn MVP.
FROM node:24-alpine AS dependencies
WORKDIR /app
COPY web/package.json web/package-lock.json* ./
RUN npm ci

FROM dependencies AS builder
COPY web/ ./
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next-build ./.next-build
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/src ./src
RUN mkdir -p /app/data
EXPOSE 3000
CMD ["npm", "run", "start"]
