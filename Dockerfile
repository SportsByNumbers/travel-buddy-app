# Stage 1: Build the React application
# Uses a Node.js 18 base image with Alpine Linux for a smaller final image size.
FROM node:18-alpine AS builder

# Set the working directory inside the container for the build process.
WORKDIR /app

# Copy only package.json.
# This allows Docker to cache the 'npm install' step. If only code changes (not dependencies),
# npm install can be skipped on subsequent builds.
# Running 'npm install' here will also generate a package-lock.json inside the container.
COPY package.json ./
RUN npm install

# Copy the rest of the application code into the working directory.
# This includes your 'src' folder, 'public' folder, etc., which are needed for the build.
COPY . .

# Build the React app for production.
# This command runs the the 'build' script defined in your package.json,
# typically creating an optimized 'build' folder.
RUN npm run build

# Stage 2: Serve the React application with Nginx
# Uses a lightweight Nginx base image with Alpine Linux for serving static files.
FROM nginx:alpine

# Copy the custom Nginx configuration file into the Nginx configuration directory.
# This file dictates how Nginx serves your React app and where it stores temporary files.
# Make sure your nginx.conf has the 'client_body_temp_path', 'proxy_temp_path' etc. directives
# pointing to a writable location like /var/tmp/nginx_client_temp.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Remove Nginx's default static HTML files to avoid conflicts with your React app.
RUN rm -rf /usr/share/nginx/html/*

# Copy the optimized production build of your React app from the 'builder' stage
# into Nginx's default web root directory.
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port 80, which Nginx will listen on for incoming HTTP requests.
# Hugging Face Spaces will map this port to their public URL.
EXPOSE 80

# Command to start Nginx when the Docker container runs.
# 'daemon off;' keeps Nginx running in the foreground, which is essential for Docker containers.
CMD ["nginx", "-g", "daemon off;"]