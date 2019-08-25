# Documentation

## Architecture

The tezos adapter consists of the adapter itself, (a node.js server that runs inside a docker container and exposes a REST API to the mantichor frontend, generates smart contracts for choreography diagrams, and communicates via an RPC interface with the tezos node), and the tezos node, which is pre-built and also part of the docker container, exposing said RPC interface.

The REST API implemented in this adapter has been defined for the whole mantichor framework. Further information about the API and a corresponding swagger file can be found [here](https://github.com/bptlab/mantichor-frontend)

For a concise overview, take a look at [this](architecture.png) component diagram detailing the architecture.

## Tezos integration

The tezos adapter uses a prebuilt tezos sandbox node as a base image. The sandboxed node utilises the alphanet protocol of the tezos blockchain, while being a single isolated node.
Moreover, only a single node is used for each instance of the adapter, who therefore also can't communicate with each other. This however could be changed in the future. The adapter communicates with the tezos node by calling shell scripts provided by tezos that wrap the RPC calls. Since the sandboxed node is incompatible with libraries, this was the most reasonable approach. Below, we outline how a proper tezos alphanet could be used in the future, instead of a sandboxed one.

## How to change to a tezos alphanet node

Right now, the tezos node is a sandboxed alphanet node, built and run inside a custom docker image. However, for blockchain-based choreography execution to make sense, more than a single sandboxed node is needed. Connecting this adapter to the alphanet has not been done, since it was faster to simply use the sandboxed node. To change this, several steps have to be taken:

- The dockerfile of the tezos node has to be changed, so that a tezos alphanet node is started (and fully bootstrapped!), after the adapter is started
- Also, baking manually should no longer be necessary
- The supplied bootstrap accounts have to be changed to real accounts, requiring a rewrite on how the role --> account mapping is done
- See `Accounts.ts`, `getAccountForAddress()` can be used to activate and use an Alphanet account supplied as a JSON file. This won't work in the sandboxed mode, however, as new accounts can't be activated there. To use an account from file, pass the environment variable `USE_ACCOUNT_FILE="true"`.
- The way the adapter interacts with the tezos chain could potentially be changed, making use of libraries like [sotez](https://github.com/AndrewKishino/sotez) or [eztz](https://github.com/TezTech/eztz)

## Building and publishing the tezos node

The tezos node and the adapter are built using two different files (`docker-tezos-node.yaml` and `docker-tezos-adapter.yaml`), where the tezos node is published to the `bptlab` docker hub, as to keep build times low, as well as the adapter image. Should changes be made, you can rebuild the images by executing

```shell
    docker build . -f docker-tezos-node.yaml -t bptlab/mantichor-tezos-node:latest
    docker push bptlab/mantichor-tezos-node:latest
```

to update the tezos node or

```shell
    docker build . -f docker-tezos-adapter.yaml -t bptlab/mantichor-tezos-adapter:latest
    docker push bptlab/mantichor-tezos-adapter:latest
```

to update the tezos adapter.

## Running the tezos adapter

You can run the container using the **pre-built** image:

```shell
    docker run --name mantichor-tezos-adapter -d bptlab/mantichor-tezos-adapter:latest
```

or build and run the image **manually**, by executing `start.sh` or

```shell
    docker build -f docker-tezos-adapter.yaml . -t mantichor-tezos-adapter
    docker run -p 7320:7320 --name mantichor-tezos-adapter -d mantichor-tezos-adapter
    docker logs -f mantichor-tezos-adapter
```

The container can be stopped using `stop.sh`, and the volumes used for storing blockchain data can be reset by using `docker volume ls` and removing these volumes.

## Smart Contract Generation

Each choreography deployed on the Tezos Adapter must be converted into a Smart Contract that Tezos can understand. The Tezos Adapter generates .fi-files that are compiled to [Michelson code](https://tezos.gitlab.io/master/whitedoc/michelson.html) using the [fi compiler](https://github.com/TezTech/fi-compiler). The contract generation is based on the approach described by [Weber et al.](https://link.springer.com/chapter/10.1007/978-3-319-45348-4_19) for implementing choreographies on the blockchain. The Smart Contract generation is divided into two sections. In the first section, the xml is converted into a structured choreography. A structured choreography consists of the choreography elements which are enriched with information about their predecessors and successors according to the rules of Weber et al.. In the second section the structured choreography is used to generate the fi code. The exact steps will be explained later in this chapter.

### Assumptions

A correct translation of a choreography into a Smart Contract can only take place if the following conditions are met by the choreography:

- Every gateway split merges with the corresponding gateway join. Alternatively, individual paths can also be terminated by an end event.
- Tasks with a response message must be divided into two tasks.
- A subchoreography must not contain a subchoreography.
- Each choreography and each subchoreography has exactly one start event and at least one end event.
- Only the choreography elements contained in the Supported choreography elements section are used.

### Contract Structure

The Smart Contract consists of two essential parts. The storage is defined in the first part. A Boolean flag is generated for each task, for each parallel join gateway incoming sequence flow and for each subchoreography. In addition, each Smart Contract also contains an initialized flag and a finished flag. The second part defines the functions. A function is generated for each Choreography Task. The structure of these functions is described in the next section. In addition, each Smart Contract has an init function. This initializes the subsequent element of the start event.

### Supported Choreography Elements

The Tezos adapter supports the following choreography elements. The use of unsupported elements can lead to unexpected behaviour:

- Start Event
- End Event
- Task
- Event-based Gateway
- Data-based Gateway
- Parallel Gateway
- Subchoreography

#### Events

##### Start Event

The start event is translated into the init function and the initialized flag that every Smart Contract has. However, it should be noted that exactly one start event should be used for a choreography. The init function activates the subsequent elements of the start event and sets the initialized flag to True. This prevents the start event from being executed more than once. Start events within subchoreographies are ignored. The succeeding element of the start event is activated as soon as the subchoreography is activated.

##### End Event

The end event is represented by the finished flag. However, there is only one finished flag for all end events. As soon as an end event is reached, the finished flag is set to True.  Exceptions are the end events within a subchoreography. If an end event is reached in a subchoreography, the subchoreography is deactivated and the subsequent element of the subchoreography is activated.

#### Tasks

A task is represented by a function. This function can only be executed if the task is activated. If the task is executed successfully, it will be deactivated and its successor will be activated. A task with a response message must be split into two tasks according to the assumptions. Currently no payload is supported when executing a task.

#### Gateways

##### Event-based Gateway

If an event-based split gateway is activated, all following elements of the gateway are activated instead. In addition, any task that follows an event-based gateway disables all subsequent elements of the gateway when executed. This ensures that only one path can be executed. However, so far only message tasks are supported as deciding events. An event-based join gateway only activates its successor when it is activated. The gateway is therefore not explicitly defined in the Smart Contract, but implicitly according to the task behaviour.

##### Data-based Gateway

Since message payload is currently not supported, data-based gateways behave in the same way as event-based gateways.

##### Parallel Gateway

If a parallel split gateway is activated, all subsequent elements are activated. For a parallel join gateway, a boolean flag is generated for each incoming sequence flow. If a task that is a predecessor of the parallel join gateway has been executed, it activates the corresponding sequence flow flag and checks all incoming sequence flow flags that belong to the gateway. If all evaluate to True, the following element of the gateway is activated. Parallel gateways are thus implemented both via the sequence flow flags and via the task behaviour.

#### Subchoreographies

Each subchoreography is represented by a flag. This flag determines whether the subchoreography is enabled or not. Tasks that are in a subchoreography can only be executed if the subchoreography is enabled. An end event deactivates the subchoreography. This allows multiple end events in a subchoreography. However, only one start event is allowed. Furthermore, nested subchoreographies are currently not supported.

### Access Rights

So that not every party can execute the choreography tasks, the tasks can be secured with access rights. A role mapping can be sent with the deployment of the choreography. The role mapping assigns Tezos user addresses to choreography participant ids. When the contract is generated, a verification is added to each task that checks whether the sender of the transaction corresponds to the tezos address corresponding to the participant who is the sender of the task. Several Tezos accounts can be active on one adapter. Therefore, when executing a task, you must specify with which account this should be done. However, access restrictions are optional or can be introduced in part. All tasks whose sender has not been assigned a tezos address remain unprotected.

### Limitations

With the current approach to translating choreographies into smart contracts, there are some limitations that need to be considered:

Messages sent via the execution of a choreography task cannot have any content. Therefore, this data cannot be persisted on the blockchain and cannot be used for e.g. data-based gateways.
