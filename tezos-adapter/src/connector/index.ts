// import Sotez, { crypto, forge, ledger, utility } from 'sotez';
import { exec } from 'child_process';
import * as fs from 'fs';
import { Contract } from './../models/Contract';
// import Sotez, { crypto, forge, ledger, utility } from '../../node_modules/sotez/dist/node';

const bootstrapKey = 'edsk3gUfUPyBSfrS9CCgmCiQsTCHGkviBDusMxDJstFtojtc1zcpsh';
const bootstrapIdentity = 'tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx';
const bootstrapPubkey = 'edpkuBknW28nW72KG6RoHtYW7p12T6GKc7nAbwYX5m8Wd9sDVC9yav';

const testIdentity = 'tz1gjaF81ZRRvdzjobyfVNsAeSC6PScjfQwN';
const testPubkey = 'edpktzNbDAUjUk697W7gYg2CRuBQjyPxbEg8dLccYYwKSKvkPvjtV9';

const nodeAddress = '127.0.0.1';
const nodePort = '18731';
const nodeBaseDir = '/var/run/tezos/client';

// const sotez = new Sotez('http://127.0.0.1:18731', 'main', 'main');
// TODO: originate account for this adapter

// const importKey = async (secretKey) => {
//   await sotez.importKey(secretKey).then(console.log('Imported key.'))
//   .catch((err) => console.error('Error importing key:', err));
// };

/* TODO: hardcode mapping from client to pair of {secretkey, identity, publickey}, since
the tezos sandbox is unable to handle new accounts. -> https://gitlab.com/tezos/tezos/issues/346
Therefore, we have to create a mapping from possible clients
to bootstrapped tezos accounts. */
export async function createAccount() {
  return { publicKey: bootstrapPubkey, secretKey: bootstrapKey, identity: bootstrapIdentity };
}

export async function deployContract(contract: Contract, user: string): Promise<string> {
  console.info('Start deploying contract');
  const contractName = `${Date.now()}-contract`;
  const path = `/tmp/${contractName}`;

  let contractAddress = '';

  const command = `/tezos/tezos-client -A ${nodeAddress} -P ${nodePort} ` +
    `-base-dir ${nodeBaseDir} originate contract ${contractName} ` +
    `for ${user} transferring 1 from ${user} running ${path} --init '${contract.getInitialState()}' --burn-cap 100`;

  try {
    fs.writeFileSync(path, contract.getCode());
    try {
      const result = await new Promise((resolve: (value: string) => void, reject: (reason: string | Error) => void) => {
        exec(command, (error, stdout, stderr) => {
          if (stdout) {
            resolve(stdout);
          }
          if (stderr) {
            reject(stderr);
          }
          reject(error);
        });
      });
      console.info(result);
      console.info('Contract deployed');
      const regexResult = result.match(/.*New contract (\w+) originated\..*/i);
      if (regexResult.length > 1) {
        contractAddress = regexResult[1];
      }
    } catch (error) {
      console.info('Error deploying contract');
      console.error(error);
    }
    fs.unlinkSync(path);
  } catch (error) {
    console.info('Error creating/unlinking temporary contract file');
    console.error(error);
  }
  return contractAddress;
}

export async function loadContract(contract: string, secretKey: string) {
  // await importKey(secretKey);
  // // await sotez.query(`/chains/${chain}/blocks/${contract}`);
  // await sotez.contract.load(contract).then((cont) => {
  //   console.log('Loaded contract:', cont);
  //   return cont.script.storage;
  // }).catch((error) => {
  //   console.error('Error loading contract:', error);
  //   return null;
  // });
}

export async function getCurrentHead() {
  // await importKey(bootstrapKey);
  // sotez.query(`/chains/main/blocks/head`)
  // .then((head) => {
  //   console.log('Finished fetching head! \n', 'Current head is:\n ', head);
  //   return head;
  // })
  // .catch((error) => {
  //   console.error('Error fetching head:', error);
  //   return null;
  // });
}

export async function sendTransactionOnContract(
  contract: string,
  parameter: string = '',
  amount: number = 0,
  secretKey: string) {

    // await importKey(secretKey);
    // const { hash } = await sotez.transfer({
    //   amount,
    //   parameter,
    //   to: contract,
    // }).catch((error) => {
    //   console.log('Error when executing transaction on contract!', error);
    //   return null;
    // });
    // if (isNullOrUndefined(hash)) { return null; }
    // console.log(`Injected Operation Hash: ${hash}`);
    // // Await confirmation of included operation
    // const block = await sotez.awaitOperation(hash);
    // console.log(`Operation found in block ${block}`);
    // return block;
  }

export async function sendTestTransaction() {
    // await importKey(bootstrapKey);
    // await sotez.transfer({
    //   amount: '7',
    //   to: testIdentity,
    // }).then((res) => console.log('Finished transfer! \n', 'Transfer result:\n', res))
    // .catch((err) => console.error('Error sending transaction:', err));
  }
