import { exec } from 'child_process';
import fi from 'fi-compiler';
import * as fs from 'fs';

import { Account } from './../models/Account';
import { Contract } from './../models/Contract';
import { bootstrap1 } from './accounts';

const tezosAddress = '127.0.0.1';
const tezosPort = '18731';
const tezosBaseDir = '/var/run/tezos/client';

export function getDefaultAccount(): Account {
  return bootstrap1;
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
      console.info('Contract deployed');
      const regexResult = result.match(/.*New contract (\w+) originated\..*/i);
      if (regexResult.length > 1) {
        contractAddress = regexResult[1];
      }
    } catch (error) {
      console.error('Error deploying contract');
      console.error(error);
    }
    fs.unlinkSync(path);
  } catch (error) {
    console.error('Error creating/unlinking temporary contract file');
    console.error(error);
  }
  return contractAddress;
}

export async function getContractStorage(address: string): Promise<string> {
  const command = `get script storage for ${address}`;
  let storage = '';
  try {
    storage = await executeCommand(command);
  } catch (error) {
    console.error(error);
  }
  return storage;
}

export async function callContractFunction(
  contract: Contract, address: string, user: string, functionName: string): Promise<boolean> {
  fi.abi.load(contract.getAbi());
  const argument = fi.abi.entry(functionName);
  const command = `transfer 0 from ${user} to ${address} --arg '${argument}' --burn-cap 100`;
  const result = await executeCommand(command);
  console.info(result);
  if (result.match(/.*This operation FAILED\..*/g)) {
    console.info(`Execution of function ${functionName} failed`);
    return false;
  }
  console.info(`Executed function ${functionName} successfully`);
  return true;
}

// Definitely not going to work in the sandboxed mode
export async function activateAlphanetAccount(path: string, accountName: string): Promise<boolean> {
  const command = `activate account ${accountName} with "${path}"`;
  const result = await executeCommand(command);
  return true;
}
