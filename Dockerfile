# ─── Stage 1: Build ────────────────────────────────────────────────────────────
FROM oven/bun:1 AS builder

WORKDIR /app

# Install dependencies (frozen for reproducible builds)
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy all source files (.env.local is gitignored and will NOT be copied)
COPY . .

# Accept demo token at build time so standalone mode works without a host app.
# In the future, when the host app is ready, simply stop passing this arg
# and the URL ?token=... flow in useAuth will take over automatically.
ARG VITE_DEV_TOKEN
ENV VITE_DEV_TOKEN=$VITE_DEV_TOKEN

# Bake .env values (VITE_API_URL, VITE_DEV_TOKEN) into the static bundle
RUN bun run build

# ─── Stage 2: Serve ────────────────────────────────────────────────────────────
FROM nginx:alpine

# Remove the default nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy the Vite build output from stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy our custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
