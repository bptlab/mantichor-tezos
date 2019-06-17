# Build stage
FROM node:11 as build
RUN apt update && apt install libsystemd-dev libudev-dev libusb-1.0-0-dev -y

WORKDIR /adapter
COPY package* /adapter/
# install packages
RUN npm install
COPY . /adapter

# Production Stage
FROM node:11-stretch-slim
RUN apt update && apt install libsystemd-dev libudev-dev libusb-1.0-0-dev -y

COPY --from=build /adapter /

# Expose ports
EXPOSE 3000
EXPOSE 8732

# Copy sources and build
RUN npm run build

ENTRYPOINT ["npm"]
CMD ["run", "serve"]
