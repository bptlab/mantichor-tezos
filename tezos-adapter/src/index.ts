import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import * as request from 'request-promise-native';
import sleep from 'sleepjs';
import choreographyRouter from './routers/choreography';

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

  const app = express();
  app.use(bodyParser.json());
  app.use(cors());
  app.use(choreographyRouter);
  app.listen(7320, () => console.log('Local Tezos Blockchain Adapter listening on port 7320!'));

};
main();
