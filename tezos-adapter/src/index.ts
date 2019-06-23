import bodyParser from 'body-parser';
import express from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as request from 'request-promise-native';
import sleep from 'sleepjs';
import { isNullOrUndefined } from 'util';
import * as connector from './connector';
import { Contract } from './models/Contract';
import choreographyRouter from './routers/choreography';
import { ChoreographyPreprocessor } from './translator/ChoreographyPreprocessor';

// test connection to tezos
const main = async () => {
  await sleep(20000);

  // test if node can be contacted
  await request.get('http://127.0.0.1:18731/protocols', (error, response, body) => {
    if (!error && response.statusCode === 200) {
      console.log('Activated protocols:', body);
    } else {
      console.log('Error when contacting tezos node: ', error, response);
    }
  });

  const contract = fs.readFileSync(path.join(__dirname, '/../assets/test0.tz'), 'utf-8');
  const account = await connector.createAccount();
  if (!isNullOrUndefined(account)) {
    // test deploy
    const code = 'parameter string;\nstorage string;\ncode {CAR; NIL operation; PAIR;};';
    const initialState = '"hello"';
    const user = 'bootstrap1';
    const result = await connector.deployContract(new Contract(code, {}, initialState), user);
    console.info(`Deployed contract at: ${result}`);
  }

  // load XML
  const example = fs.readFileSync(path.join(__dirname, '/../assets/simple-diagram.bpmn'), 'utf-8');

  ChoreographyPreprocessor.parseXml(example);

  const app = express();
  app.use(bodyParser.json());
  app.use(choreographyRouter);
  app.listen(3000, () => console.log('Local Tezos Blockchain Adapter listening on port 3000!'));

};
main();
