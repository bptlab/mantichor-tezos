import bodyParser from 'body-parser';
import express from 'express';
import * as fs from 'fs';
import * as path from 'path';
import request from 'request';
import * as connector from './connector';

// test connection to tezos
request('http://node:8732/protocols', (error, response, body) => {
  if (!error && response.statusCode === 200) {
    console.log(body);
  } else {
    console.log('Error when contacting tezos node: ', error, response);
  }
});
const contract = fs.readFileSync(path.join(__dirname, '/../assets/test0.tz'), 'utf-8');
connector.deployContract(contract, 100, '10tz');

import choreographyRouter from './routers/choreography';
import { ChoreographyPreprocessor } from './translator/ChoreographyPreprocessor';
// load XML
const order = fs.readFileSync(path.join(__dirname, '/../assets/order.bpmn'), 'utf-8');
const sample = fs.readFileSync(path.join(__dirname, '/../assets/sample.bpmn'), 'utf-8');
const example = fs.readFileSync(path.join(__dirname, '/../assets/simple-diagram.bpmn'), 'utf-8');

ChoreographyPreprocessor.parseXml(example);

const app = express();
app.use(bodyParser.json());
app.use(choreographyRouter);
app.listen(3000, () => console.log('Local Tezos Blockchain Backend listening on port 3000!'));
