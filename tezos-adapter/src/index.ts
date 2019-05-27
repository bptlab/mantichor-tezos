import bodyParser from 'body-parser';
import express from 'express';
import * as fs from 'fs';
import * as path from 'path';

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
app.listen(4000, () => console.log('Local Tezos Blockchain Backend listening on port 4000!'));
