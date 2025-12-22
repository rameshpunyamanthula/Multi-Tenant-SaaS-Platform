# -------------------------------
# Backend Dockerfile
# -------------------------------

FROM node:20-alpine

# Install PostgreSQL client (for psql & pg_isready)
RUN apk add --no-cache postgresql-client

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source
COPY src ./src
COPY migrations ./migrations
COPY seeds ./seeds
COPY scripts ./scripts

# Make init script executable
RUN chmod +x /app/scripts/init-db.sh

# Expose backend port
EXPOSE 5000

# Run DB init script, then start backend
CMD ["/bin/sh", "-c", "/app/scripts/init-db.sh && npm start"]
