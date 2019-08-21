#! /usr/bin/env bash
docker build -f docker-tezos-adapter.yaml . -t mantichor-tezos-adapter
docker run -p 7320:7320 --name mantichor-tezos-adapter -d mantichor-tezos-adapter
docker logs -f mantichor-tezos-adapter