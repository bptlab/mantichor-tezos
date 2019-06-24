import bodyParser from 'body-parser';
import express from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as request from 'request-promise-native';
import sleep from 'sleepjs';
import { isNullOrUndefined } from 'util';
import * as connector from './connector';
import choreographyRouter from './routers/choreography';
import { ContractGenerator } from './translator/ContractGenerator';

// test connection to tezos
const main = async () => {
  await sleep(20000);

  // test if node can be contacted
  let connected = false;
  await request.get('http://127.0.0.1:18731/protocols', (error, response, body) => {
    if (!error && response.statusCode === 200) {
      console.log('Activated protocols:', body);
      connected = true;
    } else {
      console.error('Error when contacting tezos node: ', error, response);
      connected = false;
    }
  }).catch((error) => {
    console.error(error);
  });

  if (!connected) {
    console.error('Could not contact tezos node, shutting down!');
    return;
  }

  // load XML
  const example = fs.readFileSync(path.join(__dirname, '/../assets/twotasks.bpmn'), 'utf-8');
  const contract = (await ContractGenerator.generateContractsFromBPMN(example))[0];

  const account = await connector.createAccount();
  if (!isNullOrUndefined(account)) {
    // test deploy
    /*const code = 'parameter string;\nstorage string;\ncode {CAR; NIL operation; PAIR;};';
    const initialState = '"hello"';*/
    const contractAddress = await connector.deployContract(contract, account.identifier);
    console.info(`Deployed contract at: ${contractAddress}`);
    if (await connector.callContractFunction(contract, contractAddress, account.identifier, 'init')) {
      // Print contract storage / state
      console.info(await connector.getContractStorage(contractAddress));
    }
  }

  const app = express();
  app.use(bodyParser.json());
  app.use(choreographyRouter);
  app.listen(3000, () => console.log('Local Tezos Blockchain Adapter listening on port 3000!'));

};
main();
