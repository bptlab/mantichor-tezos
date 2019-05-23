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

version=""
if [  "$1" == "alpha" ]; then
  version="alphanet"
elif  [ "$1" == "main" ]; then
    version="mainnet"
elif  [ "$1" == "sandbox" ]; then
    version="sandbox"
else 
    echo "Unknown parameter: $1"
    exit 1
fi

if [ "$version" == "alpha" ] || [ "$version" == "main" ]; then
    ./nodes/"$version".sh stop
elif [ "$version" == "sandbox" ]; then
    granary node stop
    docker rm granary-tezos-node-sandbox
    docker network rm granary
else
    echo "Unknown version: $1"
    exit 1
fi

# Stop blockchain adapter
docker stop tezos-adapter