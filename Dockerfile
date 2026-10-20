FROM registry.access.redhat.com/hi/nodejs:latest-builder AS builder
WORKDIR /app
COPY package.json package-lock.json .
RUN npm ci
COPY . .
RUN npm run astro:build

FROM registry.access.redhat.com/hi/nodejs:latest
WORKDIR /app
COPY --from=builder /app .
ENV HOST=0.0.0.0
EXPOSE 4321
CMD ["node", "dist/server/entry.mjs"]
