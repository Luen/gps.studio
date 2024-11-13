# Use an official Node.js image as a base
FROM node:18 AS builder

# Set the working directory for the GPX project
WORKDIR /app/gpx

# Copy the GPX project files
COPY gpx/ .

# Run the build command explicitly after install
RUN npm install && npm run build

# Set up the website project in a new working directory
WORKDIR /app/website

# Copy the remaining website files
COPY website/ .

# Install the website project dependencies
RUN npx ci

# Build the Vite app
RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Expose the port Vite's preview server will run on
EXPOSE 4173

# Start the Vite app in preview mode
CMD ["npm", "run", "preview", "--", "--host"]