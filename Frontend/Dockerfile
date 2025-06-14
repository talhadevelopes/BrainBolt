# Use Node.js 18 Alpine as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Remove node_modules and package-lock.json to avoid conflicts
RUN rm -rf node_modules package-lock.json

# Install ALL dependencies (including devDependencies) for build
RUN npm install

# Copy source code
COPY . .

# Create secrets directory
RUN mkdir -p /app/secrets

# Build the application
RUN npm run build

# Install a lightweight server for serving static files
RUN npm install -g serve

# Expose port 5173
EXPOSE 5173

# Install curl for healthcheck
RUN apk add --no-cache curl

# Start the application (serve the built files)
CMD ["serve", "-s", "dist", "-l", "5173"]