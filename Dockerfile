FROM node:lts-alpine AS build-stage

# Set the working directory inside the container
WORKDIR /app

# inject all vars we'll need
ARG BUILD_MODE=production

# Copy package.json and package-lock.json into the container
COPY package*.json package-lock.json ./

# Install dependencies using npm
RUN npm install

# Copy the project files into the working directory
COPY ./ ./

# Build the app for production
RUN npm run build -- --mode $BUILD_MODE

################################
#### PRODUCTION ENVIRONMENT ####
################################

# Use the official NGINX image for production
FROM nginx:stable-alpine AS production-stage

LABEL org.opencontainers.image.source=https://github.com/Mosquito-Alert/mosquito_alert_frontend

HEALTHCHECK --interval=30s --retries=3 --timeout=5s CMD curl --fail http://localhost || exit 1

WORKDIR /app
COPY --from=build-stage /app/dist /app
COPY nginx.conf /etc/nginx/nginx.conf