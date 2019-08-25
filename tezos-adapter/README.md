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

The implemented routes can be found as Swagger Documentation in [Mantichor's Frontend Repository](https://github.com/bptlab/mantichor-frontend/blob/master/adapter-apidoc.yaml)

## Usage

### Running Locally

Make sure you have [Node.js](https://nodejs.org/en/download/) installed.

#### Installation

```bash
npm install
```

#### Scripts

- `npm start` - builds the project, i.e., compiles the TypeScript and starts the application in developer mode
- `npm run build` - builds the project, i.e., compiles the TypeScript code to JavaScript
- `npm run serve` - serves the previously built project
- `npm run watch` - build the projects, serves it and automatically updates on local changes
- `npm run lint` - runs the linter
- `npm run test` - runs the test suites

#### Testing

Tests can be run with: `npm run test`. This results in a testing result and coverage report printed to the CLI.

The test suite is [Jest](https://jestjs.io/). As much adapter internal functionalities as should be tested. A mock Blockchain is not implemented yet.
