# Production Dockerfile for Astro Site
FROM node:24-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the static site
RUN npm run build

# Use Caddy as a lightweight server for the static files
FROM caddy:alpine

# Copy the built files from the build stage
COPY --from=build /app/dist /usr/share/caddy

# Set up a simple Caddyfile for port 4321
RUN printf ":4321 {\n  root * /usr/share/caddy\n  file_server\n}\n" > /etc/caddy/Caddyfile

EXPOSE 4321

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
