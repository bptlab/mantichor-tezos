#!/usr/bin/env bash

DATA_DIR='/var/run/tezos/node' /tezos/src/bin_node/tezos-sandboxed-node.sh 1 --connections 1 &
P1=$!
eval 'sleep 5 && eval '/tezos/src/bin_client/tezos-init-sandboxed-client.sh 1'' &
P2=$!
wait $P2
cat /tezos/src/bin_client//../../scripts/protocol_parameters.json
/tezos/src/bin_client//../../_build/default/src/bin_client/main_client.exe -base-dir /var/run/tezos/client -addr localhost -port 18731 -block genesis activate protocol Pt24m4xiPbLDhVgVfABUjirbmda3yohdN82Sp9FeuAXJ4eV9otd with fitness 1 and key activator and parameters /tezos/src/bin_client//../../scripts/protocol_parameters.json --timestamp 2019-06-21T11:20:44Z
/tezos/src/bin_client//../../_build/default/src/bin_client/main_client.exe -addr localhost -port 18731 rpc get /chains/main/blocks/head/metadata
/tezos/src/bin_client//../../_build/default/src/bin_client/main_client.exe -addr localhost -port 18731 list known addresses
wait $P1
