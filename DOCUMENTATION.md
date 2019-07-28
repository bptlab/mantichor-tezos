# Documentation

## Architecture

## Examples

## How to change to a tezos alphanet node

Right now, the tezos node is a sandboxed alphanet node, built and run inside a custom docker image. However, for blockchain-based choreography execution to make sense, more than a single sandboxed node is needed. Connecting this adapter to the alphanet has not been done, since it was faster to simply use the sandboxed node. To change this, several steps have to be taken:

- The dockerfile has to be changed, so that a tezos alphanet node is started (and fully bootstrapped!), after the adapter is started
- Also, baking manually should no longer be necessary
- The supplied bootstrap accounts have to be changed to real accounts, requiring a rewrite on how the role --> account mapping is done
- See `Accounts.ts`, `getAccountForAddress()` can be used to activate and use an Alphanet account supplied as a JSON file. This won't work in the sandboxed mode, however, as new accounts can't be activated there. To use an account from file, pass the environment variable `USE_ACCOUNT_FILE="true"`.
- The way the adapter interacts with the tezos chain could potentially be changed, making use of libraries like [sotez](https://github.com/AndrewKishino/sotez) or [eztz](https://github.com/TezTech/eztz)

## Building and publishing the tezos node

The tezos node and the adapter are built using two different files (`tezos-docker-node.yaml` and `Dockerfile`), where the tezos node is published to the `bptlab` docker hub, as to keep build times low. Should changes be made to the adapter, you can rebuild the image by calling

```shell
    docker build . -f docker-tezos-node.yaml -t bptlab/mantichor-tezos-node:latest
    docker push bptlab/mantichor-tezos-node:latest
```

## Running the tezos adapter

The tezos adapter, consisting of the adapter itself and the tezos node, is run using docker-compose. The dockerfile used in the compose file adds the container to a docker image where the tezos node has already been built.
So you can either call `docker-compose up --build` or `./start.sh` to start the tezos adapter.

Similarly, call `docker-compose down` or `./stop.sh` to stop the adapter.

Use `reset.sh` to reset the tezos chain and the data stored on the node.
