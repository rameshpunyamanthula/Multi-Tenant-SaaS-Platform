# Use Node.js
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the frontend code
COPY . .

# Expose frontend port
EXPOSE 3000

# Start webpack dev server
CMD ["npm", "start", "--", "--port", "3000", "--host", "0.0.0.0"]
