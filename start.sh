#! /usr/bin/env bash

usage() {
    echo "Usage: $0 <command>"
    echo "  Main commands:"
    echo "    $0 alpha"
    echo "       Launch a full Tezos alphanet node in a docker container"
    echo "       with sane defaults passed to the node,"
    echo "       for the choreograpy adapter to work."
    echo "    $0 main"
    echo "       Launch a full Tezos mainnet node in a docker container"
    echo "       with sane defaults passed to the node,"
    echo "       for the choreograpy adapter to work."
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

# Update tezos nodes
./nodes/"$version".sh update_script

# Start tezos nodes
./nodes/"$version".sh start

# Start blockchain adapter (maybe pass started version?)
