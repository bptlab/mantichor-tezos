# chor-playground

This repository provides the following setup:

- Node.js express server
- TypeScript integration
- Linting using TSLint
- Docker support
- `bpmn-moddle` integration

It can be used as a basic REST API server.
The repository also contains some basic examples on how to load and use BPMN models from XML files.

## Repository Structure

- `assets/` | static files
- `src/` | TypeScript source files
- `.dockerignore` | files ignored by Docker when copying
- `.gitignore` | files ignored by Git
- `Dockerfile` | Docker configuration
- `README.md`
- `nodemon.js` | [nodemon](https://nodemon.io/) configuration, used to rebuild and reload server on file changes
- `package*.json` | Node.js package configuration
- `tsconfig.json` | TypeScript transpiler configuration
- `tslint.json` | [TSLint](https://github.com/palantir/tslint) configuration (code style)

## Routes

There are two sample routes:

- `/gateways`  
  Returns all the gateways in the `sample.bpmn` sample.
- `/neighbors/:id`  
  Returns all the predecessors/successors of the element with the given ID from the `order.bpmn` example.

## Usage

### Running Locally

Make sure you have [Node.js](https://nodejs.org/en/download/) installed.

#### Installation

```
npm install
```

#### Scripts

- `npm run build` - builds the project, i.e., compiles the TypeScript code to JavaScript
- `npm run serve` - serves the previously built project
- `npm run watch` - build the projects, serves it and automatically updates on local changes
- `npm run lint` - runs the linter

### Using Docker

```
docker build -t chor-playground .
docker run --rm -p 3000:3000 --name chor-playground -it chor-playground
```