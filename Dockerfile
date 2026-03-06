# Use official Node.js LTS image as the base
FROM node:20-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the frontend (Vite) and backend (if needed)
RUN npm run build

# Use a smaller, production-ready image for the final stage
FROM node:20-alpine

WORKDIR /app

# Copy only the necessary files from the builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Install tsx globally to run the TypeScript server directly
RUN npm install -g tsx

# Expose the port the app runs on
EXPOSE 3000

# Start the server
CMD ["tsx", "server.ts"]
