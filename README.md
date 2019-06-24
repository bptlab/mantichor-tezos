# Mantichor Tezos

Tezos Blockchain Choreography Converter and Backend based on the Tezos Blockchain.

## Dependencies

Make sure that the latest versions of [`docker`](https://docs.docker.com/install/) and [`docker-compose`](https://docs.docker.com/compose/install/) are installed.

## Starting

Start the adapter using `docker-compose up --build` or `start.sh`.

## Stopping

Stop the tool using `docker-compose down` or `stop.sh`.

After stopping, execute `reset.sh` to reset the state of the tezos node.

The tezos node is a single sandbox node for now, not connected to either the tezos `alphanet` nor the `mainnet`.
