# syntax=docker/dockerfile:1
#
# Vendor-neutral container for statewave-web.
#
# Two stages:
#   1. builder — installs dependencies and builds the Vite frontend
#      (`dist/`) plus the Node-side server (`dist-server/`).
#   2. runtime — copies just the build outputs + production dependencies
#      and runs the standalone Node HTTP server on PORT (default 8080).
#
# This is the canonical run path. There is NO Vercel-specific magic in
# the container — anywhere Docker runs, this runs. The only Vercel-shaped
# file in the repo is `api/[[...slug]].ts`, an optional adapter for the
# Vercel deploy.
#
# Required env at runtime:
#   STATEWAVE_URL       — base URL of the Statewave backend
#   STATEWAVE_API_KEY   — API key for that backend
# Optional:
#   PORT                — listen port (default 8080)
#   HOST                — listen host (default 0.0.0.0)
#   WEB_STATIC_DIR      — built SPA dir (default ./dist; pre-set in image)
#
# Quickstart:
#   docker build -t statewave-web .
#   docker run --rm -p 8080:8080 \
#     -e STATEWAVE_URL=http://host.docker.internal:8100 \
#     -e STATEWAVE_API_KEY=$YOUR_KEY \
#     statewave-web

# ─── Stage 1: builder ────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Install deps with the lockfile so the build is reproducible. Doing this
# in a separate layer lets Docker cache `node_modules` between builds when
# package.json + package-lock.json haven't changed.
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the source tree and build both the SPA and the server.
COPY . .
RUN npm run build

# Prune devDependencies for the runtime stage. `npm ci --omit=dev` reinstalls
# from scratch with only production deps, which is more reliable than `npm
# prune` across npm versions.
RUN npm ci --omit=dev

# ─── Stage 2: runtime ────────────────────────────────────────────────────
FROM node:22-alpine AS runtime

WORKDIR /app

# Production env defaults. Overridable at `docker run` time.
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=8080 \
    WEB_STATIC_DIR=/app/dist

# Drop privileges — Node's official alpine image already creates a
# `node:node` user; use it.
USER node

# Copy production node_modules + build outputs + package.json (for "type":
# "module" so Node treats .js as ESM). Nothing else from the source tree
# leaks into the runtime image.
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/dist-server ./dist-server
COPY --from=builder --chown=node:node /app/package.json ./package.json

EXPOSE 8080

# Healthcheck hits the SPA index — if the static-serve path is broken the
# container is unhealthy. The /api routes need a configured Statewave
# backend to actually return 200, so we don't probe them here.
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:${PORT:-8080}/ || exit 1

CMD ["node", "dist-server/server/index.js"]
