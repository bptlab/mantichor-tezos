import { callContractFunction, deployContract, getContractStorage } from '.';
import { RoleMapping } from '../models/RoleMapping';
import { Account } from './../models/Account';
import { ContractGenerator } from './../translator/ContractGenerator';

// Currently we assume only one choreography per contract

export async function deployChoreography(xml: string, account: Account, roleMappings: RoleMapping[]): Promise<string> {
  const contract = (await ContractGenerator.generateContractsFromBPMN(xml, roleMappings))[0];
  console.info(contract.getFiCode());
  return await deployContract(contract, account.identifier);
}

export async function executeFunction(
  xml: string, address: string, account: Account, functionName: string): Promise<boolean> {
  const contract = (await ContractGenerator.generateContractsFromBPMN(xml))[0];
  return callContractFunction(contract, address, account.identifier, functionName);
}

export async function getActiveTasks(xml: string, address: string): Promise<string[][]> {
  const contract = (await ContractGenerator.generateContractsFromBPMN(xml))[0];
  const storage = await getContractStorage(address);
  const regex = /(true|false)/gi;
  const states = [];
  let stateMatch = regex.exec(storage);
  while (stateMatch) {
    states.push(stateMatch[0]);
    stateMatch = regex.exec(storage);
  }
  if (states.length === 0) {
    return [];
  }

  const result = contract
    .getTaskNames()
    .reduce((activeTasks: string[][], taskName: string, index: number): string[][] => {
      if (states[index].toLowerCase() === 'true') {
        activeTasks.push([taskName]);
      }
      return activeTasks;
    }, []);

  if (states[states.length - 1].toLowerCase() === 'true') {
    result.push(['finished']);
  }

  return result;
}
