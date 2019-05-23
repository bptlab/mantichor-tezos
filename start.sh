#! /usr/bin/env bash

usage() {
    echo "Usage: $0 <command>"
    echo "  Main commands:"
    echo "    $0 alpha"
    echo "       Launch a full Tezos alphanet node in a docker container"
    echo "       with sane defaults passed to the node,"
    echo "       for the choreograpy adapter to work."
    echo "    $0 sandbox"
    echo "       Launch a tezos sandbox node and the choreography adapter."
    echo "    $0 main"
    echo "       Launch a full Tezos mainnet node in a docker container"
    echo "       with sane defaults passed to the node,"
    echo "       for the choreograpy adapter to work."
}

if [ "$#" -eq 0 ] ; then usage ; exit 1; fi

version=""
if [  "$1" == "alpha" ]; then
  version="alpha"
elif  [ "$1" == "main" ]; then
    version="main"
elif [ "$1" == "sandbox" ]; then
    version="alpha"
else 
    echo "Unknown parameter: $1"
    exit 1
fi

if [ "$1" == "alpha" ] || [ "$1" == "main" ]; then
    echo "Starting and updating tezos"
    # Update tezos nodes
    ./nodes/"$version".sh update_script

    # Start tezos nodes
    ./nodes/"$version".sh start --rpc-port 127.0.0.1:8732 --cors-origin '*' --cors-header 'Origin, X-Requested-With, Content-Type, Accept, Range'

    echo "Waiting until tezos has been synchronised"
    echo "This might take quite some time!"

    ./nodes/"$version".sh client bootstrapped

    echo "Adding account to tezos node"

    ./nodes/"$version".sh client activate account my_account with "container:nodes/faucet.json"
    # ./tezos-client list known addresses
    # ./tezos-client show address my_account [-S --show-secret]

    # Todo: only get relevant part of key!
    # secretKey=$(./nodes/"$version".sh client show address my_account -S) #
elif [ "$1" == "sandbox" ]; then
    echo "Installing granary tezos node"
    secretKey="unencrypted:edsk3gUfUPyBSfrS9CCgmCiQsTCHGkviBDusMxDJstFtojtc1zcpsh"
    npm install --global @stove-labs/granary@pre-alpha
    granary --version
    granary init
    sudo chmod +x -R .granary/
    granary node start
    granary client - import secret key "activator" "unencrypted:edsk31vznjHSSpGExDMHYASz45VZqXN4DPxvsa4hAyY8dHM28cZzp6"
    granary client - "--block genesis activate protocol ProtoALphaALphaALphaALphaALphaALphaALphaALphaDdp3zK with fitness 1 and key activator and parameters $PWD/protocol_parameters.json --timestamp $(TZ='AAA+1' date +%FT%TZ)" 
    granary client - import secret key "bootstrap1" "unencrypted:edsk3gUfUPyBSfrS9CCgmCiQsTCHGkviBDusMxDJstFtojtc1zcpsh"
else
    echo "Unknown version: $1"
    exit 1
fi


# Start blockchain adapter (maybe pass started version?)
cd tezos-adapter || exit
docker build -t tezos-adapter .
docker run --rm -p 3000:3000 8732:8732 -e TEZOS_VERSION="$version" -e TEZOS_KEY="$secretKey" --name tezos-adapter -it tezos-adapter
cd .. || exit
