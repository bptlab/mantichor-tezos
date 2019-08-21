# Mantichor Tezos

Tezos Blockchain Choreography Converter and Backend based on the Tezos Blockchain.
The Adapter is listening for the Mantichor Frontend on Port 7320.

## Dependencies

Make sure that the latest versions of [`docker`](https://docs.docker.com/install/) is installed.

## Starting

Start the adapter using `docker run -p 7320:7320 --name mantichor-tezos-adapter -d bptlab/mantichor-tezos-adapter:latest`.
Alternatively, execute `start.sh` to build and run the local version of the adapter instead of the prebuilt one.
You can follow the container output using `docker logs -f mantichor-tezos-adapter`

## Stopping

Stop the tool using `docker stop mantichor-tezos-adapter && docker rm mantichor-tezos-adapter` or `stop.sh`.

After stopping, use `docker volume rm ...` to remove the volumes belonging to the adapter and to reset the state of the node.

The tezos node is a single sandbox node for now, not connected to either the tezos `alphanet` nor the `mainnet`.

---
For more in-depth information, e.g. on how to change the adapter to use a full alphanet, see [this](DOCUMENTATION.md).
