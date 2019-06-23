import { exec } from 'child_process';
import fi from 'fi-compiler';
import * as fs from 'fs';

import { Contract } from './../models/Contract';

const bootstrapKey = 'edsk3gUfUPyBSfrS9CCgmCiQsTCHGkviBDusMxDJstFtojtc1zcpsh';
const bootstrapIdentity = 'tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx';
const bootstrapPubkey = 'edpkuBknW28nW72KG6RoHtYW7p12T6GKc7nAbwYX5m8Wd9sDVC9yav';

// const testIdentity = 'tz1gjaF81ZRRvdzjobyfVNsAeSC6PScjfQwN';
// const testPubkey = 'edpktzNbDAUjUk697W7gYg2CRuBQjyPxbEg8dLccYYwKSKvkPvjtV9';

const tezosAddress = '127.0.0.1';
const tezosPort = '18731';
const tezosBaseDir = '/var/run/tezos/client';

// TODO: originate account for this adapter

/* TODO: hardcode mapping from client to pair of {secretkey, identity, publickey}, since
the tezos sandbox is unable to handle new accounts. -> https://gitlab.com/tezos/tezos/issues/346
Therefore, we have to create a mapping from possible clients
to bootstrapped tezos accounts. */
export async function createAccount() {
  return { publicKey: bootstrapPubkey, secretKey: bootstrapKey, identity: bootstrapIdentity };
}

async function executeCommand(command: string): Promise<string> {
  const executionCommand =
    `/tezos/tezos-client -A ${tezosAddress} -P ${tezosPort} -base-dir ${tezosBaseDir} ${command}`;
  return new Promise((resolve: (value: string) => void, reject: (reason: string | Error) => void) => {
    exec(executionCommand, (error, stdout, stderr) => {
      if (stdout) {
        resolve(stdout);
      }
      if (stderr) {
        reject(stderr);
      }
      reject(error);
    });
  });
}

export async function deployContract(contract: Contract, user: string): Promise<string> {
  console.info('Start deploying contract');
  const contractName = `${Date.now()}-contract`;
  const path = `/tmp/${contractName}`;

  let contractAddress = '';

  const command = `originate contract ${contractName} ` +
    `for ${user} transferring 1 from ${user} running ${path} --init '${contract.getInitialState()}' --burn-cap 100`;

  try {
    fs.writeFileSync(path, contract.getCode());
    try {
      const result = await executeCommand(command);
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

export async function getContractStorage(address: string): Promise<string> {
  const command = `get script storage for ${address}`;
  let storage = '';
  try {
    const result = await executeCommand(command);
    storage = result;
  } catch (error) {
    console.error(error);
  }
  return storage;
}

export async function callContractFunction(
  contract: Contract, address: string, user: string, functionName: string): Promise<boolean> {
  let executed = false;
  try {
    fi.abi.load(contract.getAbi());
    const argument = fi.abi.entry(functionName);
    const command = `transfer 0 from ${user} to ${address} --arg '${argument}' --burn-cap 100`;
    try {
      const result = await executeCommand(command);
      console.info(result);
      console.info(`Executed function ${functionName} successfully`);
      executed = true;
    } catch (error) {
      console.info(`Error executing function '${functionName}' for contract '${address}'`);
      console.error(error);
    }
  } catch (error) {
    console.info(error);
  }
  return executed;
}
