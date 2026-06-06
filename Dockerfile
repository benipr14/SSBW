# Use Node 24 alpine as base image
FROM node:24-alpine AS base

# Change the working directory to /build
WORKDIR /build

# Copy the package.json and package-lock.json files to the /build directory
COPY package*.json ./

# Install all dependencies
RUN npm ci

# Copy the entire source code into the container
COPY . .

# Create logs directory for winston
RUN mkdir -p logs

RUN npx prisma generate

# For debugging: keep all dependencies to avoid ERR_MODULE_NOT_FOUND
# RUN npm prune --omit=dev && npm cache clean --force

ENV NODE_ENV=production
ENV LOG_LEVEL=production
ENV POSTGRES_PASSWORD=una_clave_muy_segura_123
ENV POSTGRES_USER=yo
ENV POSTGRES_DB=ssbw
ENV IN=production
ENV SECRET_KEY="clave_supersegura_12345"
ENV PORT=3000
ENV POSTGRES_HOST=db
ENV DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:5432/${POSTGRES_DB}?schema=public


# Document the port that may need to be published
EXPOSE 3000

# Start the application
CMD ["node", "index.ts"]
