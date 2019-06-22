#!/usr/bin/env bash
shopt -s expand_aliases
echo "-> starting sandboxed node!"
DATA_DIR='/var/run/tezos/node' /tezos/src/bin_node/tezos-sandboxed-node.sh 1 --connections 1 &
P1=$!

eval 'sleep 5' &
P2=$!
wait $P2

echo "-> initialising sandboxed client!"
eval "$(/tezos/src/bin_client/tezos-init-sandboxed-client.sh 1)"

echo "-> activate alpha!"
tezos-activate-alpha

echo "-> activated chains:"
/tezos/src/bin_client//../../_build/default/src/bin_client/main_client.exe -addr localhost -port 18731 rpc get /chains/main/blocks/head/metadata

echo "-> known addresses:"
/tezos/src/bin_client//../../_build/default/src/bin_client/main_client.exe -addr localhost -port 18731 list known addresses
wait $P1
