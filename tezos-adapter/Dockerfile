# Build stage
FROM node:11-slim as build

WORKDIR /adapter
COPY package* /adapter/
# install packages
RUN npm install
COPY . /adapter

# Production Stage
FROM node:11-slim

COPY --from=build /adapter /

# Expose ports
EXPOSE 3000
EXPOSE 8732

# Copy sources and build
RUN npm run build

ENTRYPOINT ["npm"]
CMD ["run", "serve"]