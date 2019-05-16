import * as fs from 'fs';
import * as path from 'path';

import { ChoreographyPreprocessor } from './translator/ChoreographyPreprocessor';

async function init(): Promise<void> {
  const xml = await new Promise((resolve: (value: string) => void, reject: ({ }: object) => void): void => {
    fs.readFile('/home/tom/uni-projects/mantichor-tezos/tezos-adapter/resources/choreo-examples/simple-diagram.bpmn', 'utf8', (error: any, content: string) => {
      if (error) {
        reject(error);
      }
      resolve(content);
    });
  });
  const result = await ChoreographyPreprocessor.processXml(xml);
}

init();


