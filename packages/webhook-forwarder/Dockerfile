FROM node:22-alpine AS builder

WORKDIR /build

# Copy root tsconfig (extended by the package tsconfig)
COPY tsconfig.json ./

WORKDIR /build/packages/webhook-forwarder

COPY packages/webhook-forwarder/package.json ./
RUN npm install

COPY packages/webhook-forwarder/tsconfig.json packages/webhook-forwarder/tsconfig.build.json ./
COPY packages/webhook-forwarder/src/ src/
RUN npm run build

FROM node:22-alpine

WORKDIR /app

COPY --from=builder /build/packages/webhook-forwarder/package.json ./
RUN npm install --omit=dev
COPY --from=builder /build/packages/webhook-forwarder/dist/ dist/

EXPOSE 8080

ENV WEBHOOK_FORWARDER_PORT=8080

ENTRYPOINT ["node", "dist/cli.js"]
