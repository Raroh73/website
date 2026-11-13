FROM registry.access.redhat.com/hi/nodejs:latest-builder AS deps
WORKDIR /app
COPY package.json package-lock.json .
RUN npm ci --omit=dev

FROM registry.access.redhat.com/hi/nodejs:latest-builder AS build
WORKDIR /app
COPY package.json package-lock.json .
RUN npm ci
COPY . .
RUN npm run astro:build

FROM registry.access.redhat.com/hi/nodejs:latest
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
EXPOSE 4321
CMD ["node", "dist/server/entry.mjs"]
