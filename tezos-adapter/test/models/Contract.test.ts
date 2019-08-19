import { Contract } from './../../src/models/Contract';

test('Contract class getter', async () => {
  const abi = {};
  const code = 'code';
  const fiCode = 'fi-code';
  const initialState = '(Pair False False)';
  const taskNames = ['Task1', 'Task2'];
  const contract = new Contract(code, abi, initialState, taskNames, fiCode);
  expect(contract.getCode()).toEqual(code);
  expect(contract.getAbi()).toEqual(abi);
  expect(contract.getInitialState()).toEqual(initialState);
  expect(contract.getTaskNames()).toEqual(taskNames);
  expect(contract.getFiCode()).toEqual(fiCode);
});
