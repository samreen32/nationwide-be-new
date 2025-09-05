# Use a modern LTS version of Node.js (v18 or v20 are stable choices)
FROM node:20-alpine

# Create and use the app directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 8080

# Define the command to run the application
CMD ["node", "index.js"]