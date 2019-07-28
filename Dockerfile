FROM bptlab/mantichor-tezos-node:latest

##### TEZOS ADAPTER #####

# Install Node.js
RUN curl -sL https://deb.nodesource.com/setup_11.x | bash

WORKDIR /adapter
COPY ./tezos-adapter/package* /adapter/
# install packages
RUN npm install
COPY ./tezos-adapter /adapter
RUN npm run build

WORKDIR /
# Copy start script
COPY ./start-tezos-sandbox.sh .

ENTRYPOINT ["./start-tezos-sandbox.sh"]
