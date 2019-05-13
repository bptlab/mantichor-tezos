#! /usr/bin/env bash

usage() {
    echo "Usage: $0 <command>"
    echo "  Main commands:"
    echo "    $0 alpha"
    echo "       Stop the alpanet node"
    echo "    $0 main"
    echo "       Stop the mainnet node"
}

if [ "$#" -eq 0 ] ; then usage ; exit 1; fi

version=""
if [  "$1" == "alpha" ]; then
  version="alphanet"
elif  [ "$1" == "main" ]; then
    version="mainnet"
else 
    echo "Unknown parameter: $1"
    exit 1
fi

# Stop tezos nodes
./nodes/"$version".sh stop

# Stop blockchain adapter (maybe pass started version?)
