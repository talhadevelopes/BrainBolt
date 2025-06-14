# Use Node.js 18 Alpine as base image
FROM node:18-alpine

# Install build tools for potential native dependencies
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code and .env
COPY . .

# Debug: List files to verify index.js and .env
RUN ls -la /app/src && ls -la /app

# Create secrets directory
RUN mkdir -p /app/secrets

# Expose port 3000
EXPOSE 3000

# Install curl for healthcheck
RUN apk add --no-cache curl

# Start the application
CMD ["npm", "start"]