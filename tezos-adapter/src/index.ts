import bodyParser from 'body-parser';
import express from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as request from 'request-promise-native';
import sleep from 'sleepjs';
import { isNullOrUndefined } from 'util';
import * as connector from './connector';
import { deployChoreography, executeFunction, getActiveTasks } from './connector/ContractHelper';
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
  const xml = fs.readFileSync(path.join(__dirname, '/../assets/twotasks.bpmn'), 'utf-8');

  const account = await connector.createAccount();
  if (!isNullOrUndefined(account)) {
    // test deploy
    /*const code = 'parameter string;\nstorage string;\ncode {CAR; NIL operation; PAIR;};';
    const initialState = '"hello"';*/
    const contractAddress = await deployChoreography(xml, account);
    console.info(`Deployed contract at: ${contractAddress}`);
    console.info(await connector.getContractStorage(contractAddress));
    console.info(await getActiveTasks(xml, contractAddress));
    if (await executeFunction(xml, contractAddress, account, 'init')) {
      // Print contract storage / state
      console.info(await connector.getContractStorage(contractAddress));
      console.info(await getActiveTasks(xml, contractAddress));
    }
  }

  const app = express();
  app.use(bodyParser.json());
  app.use(choreographyRouter);
  app.listen(3000, () => console.log('Local Tezos Blockchain Adapter listening on port 3000!'));

};
main();
