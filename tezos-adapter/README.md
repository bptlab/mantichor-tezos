# Tezos Adapter

Tezos Blockchain Choreography Converter and Backend

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

## Usage

### Running Locally

Make sure you have [Node.js](https://nodejs.org/en/download/) installed.

#### Installation

```
npm install
```

#### Scripts

- `npm start` - builds the project, i.e., compiles the TypeScript and starts the application in developer mode
- `npm run build` - builds the project, i.e., compiles the TypeScript code to JavaScript
- `npm run serve` - serves the previously built project
- `npm run watch` - build the projects, serves it and automatically updates on local changes
- `npm run lint` - runs the linter

### Using Docker

```
docker build -t tezos-adapter .
docker run --rm -p 3000:3000 -e TEZOS_VERSION="alpha" -e TEZOS_KEY="someSecretKey" --name tezos-adapter -it tezos-adapter
```
