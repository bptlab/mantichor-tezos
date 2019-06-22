# Mantichor Tezos

Tezos Blockchain Choreography Converter and Backend

Make sure that the latest versions of `docker` and `docker-compose` are installed.

Start the adapter using `docker-compose up --build` or `start.sh`.

Stop the tool using `docker-compose down` or `stop.sh`.

After stopping, execute `reset.sh` to reset the state of the tezos node.

The tezos node is a single sandbox node for now, not connected to either the tezos `alphanet` nor the `mainnet`.
