#! /usr/bin/env bash

usage() {
    echo "Usage: $0 <command>"
    echo "  Main commands:"
    echo "    $0 alpha"
    echo "       Stop the alpanet node"
    echo "    $0 main"
    echo "       Stop the mainnet node"
    echo "    $0 sandbox"
    echo "       Stop the sandbox node"
}

if [ "$#" -eq 0 ] ; then usage ; exit 1; fi

if [ "$1" == "alpha" ] || [ "$1" == "main" ]; then
    ./nodes/"$1"net.sh stop
elif [ "$1" == "sandbox" ]; then
    granary node stop
    docker network rm granary
    docker rm --force granary-tezos-node-sandbox
else
    echo "Unknown version: $1"
    exit 1
fi

# Stop blockchain adapter
docker stop tezos-adapter