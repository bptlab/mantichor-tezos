#!/usr/bin/env bash
# allow alias expansion
shopt -s expand_aliases

# suppress tezos client warnings
export TEZOS_CLIENT_UNSAFE_DISABLE_DISCLAIMER=Y

# TODO: Detect whether the node and client have been started before and skip initializing them

# start sandboxed node
echo "-> starting sandboxed node!"
DATA_DIR='/var/run/tezos/node' /tezos/src/bin_node/tezos-sandboxed-node.sh 1 --connections 1 &
P1=$!

# wait some time for node to start
eval 'sleep 5' &
P2=$!
wait $P2

# initialize sandboxed client
echo "-> initialising sandboxed client!"
eval "$(/tezos/src/bin_client/tezos-init-sandboxed-client.sh 1)"

# activate alpha protocol
echo "-> activate alpha!"
tezos-activate-alpha

# persist temp client directory
tmpDir=$(find /tmp/ -name "tezos-tmp-client.*" -type d)
echo tmpDir
cp -R "$tmpDir"/. /var/run/tezos/client

echo "-> activated chains:"
/tezos/src/bin_client//../../_build/default/src/bin_client/main_client.exe -base-dir /var/run/tezos/client -addr 127.0.0.1 -port 18731 rpc get /chains/main/blocks/head/metadata

echo "-> known addresses:"
/tezos/src/bin_client//../../_build/default/src/bin_client/main_client.exe -base-dir /var/run/tezos/client -addr 127.0.0.1 -port 18731 list known addresses

cd /adapter || exit 1
npm run serve &

# Bake in a loop every 20 seconds, since sandbox does not come with a baker node
while :
do
    echo "-> baking for bootstrap1 account"
	/tezos/src/bin_client//../../_build/default/src/bin_client/main_client.exe -base-dir /var/run/tezos/client -addr 127.0.0.1 -port 18731 bake for bootstrap1
	sleep 20
done

### use /tezos/src/bin_client//../../_build/default/src/bin_client/main_client.exe -base-dir /var/run/tezos/client -addr 127.0.0.1 -port to interact with the tezos client and node
wait $P1
