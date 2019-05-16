import express from 'express';
import * as fs from 'fs';
import * as path from 'path';

import { ChoreographyPreprocessor } from './translator/ChoreographyPreprocessor';


// load XML
const order = fs.readFileSync(path.join(__dirname, '/../assets/order.bpmn'), 'utf-8');
const sample = fs.readFileSync(path.join(__dirname, '/../assets/sample.bpmn'), 'utf-8');
const example = fs.readFileSync(path.join(__dirname, '/../assets/simple-diagram.bpmn'), 'utf-8');

ChoreographyPreprocessor.processXml(example);


// const app = express();
// app.listen(3000, () => console.log('Example app listening on port 3000!'));
