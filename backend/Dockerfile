FROM node:20-alpine AS builder
WORKDIR /app
# Install OpenSSL – required by Prisma's query engine on Alpine
RUN apk add --no-cache openssl
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Install OpenSSL at runtime as well (Prisma query engine needs it)
RUN apk add --no-cache openssl
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma
EXPOSE 5000
CMD ["node", "dist/server.js"]
