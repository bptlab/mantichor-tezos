import { activateAlphanetAccount, callContractFunction, deployContract, getContractStorage } from '../../src/connector/';
import { Contract } from './../../src/models/Contract';

const abi = {};
const code = 'code';
const fiCode = 'fi-code';
const initialState = '(Pair False False)';
const taskNames = ['Task1', 'Task2'];
const contract = new Contract(code, abi, initialState, taskNames, fiCode);

test('deployContract fails on error', async () => {
  try {
    await deployContract(contract, 'user');
  } catch (error) {
    expect(error).toBeDefined();
  }
  });

test('getContractStorage fails on error', async () => {
  try {
    await getContractStorage('address');
  } catch (error) {
    expect(error).toBeDefined();
  }
  });
test('activateAlphanetAccount fails on error', async () => {
  try {
    await activateAlphanetAccount('path', 'accountName');
  } catch (error) {
    expect(error).toBeDefined();
  }
  });

test('callContractFunction fails on error', async () => {
   try {
     await callContractFunction(contract, 'address', 'user', 'functionName');
   } catch (error) {
     expect(error).toBeDefined();
   }
});
