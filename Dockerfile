# Frontend Dockerfile for React/Vite Application
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for building)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Install envsubst for environment variable substitution
RUN apk add --no-cache gettext

# Copy built app to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx template configuration
COPY nginx-template.conf /etc/nginx/nginx.conf.template

# Set default PORT if not provided
ENV PORT=80

# Expose the port (will be dynamic based on PORT env var)
EXPOSE $PORT

# Start script that substitutes environment variables and starts nginx
CMD envsubst '${PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf && nginx -g 'daemon off;'