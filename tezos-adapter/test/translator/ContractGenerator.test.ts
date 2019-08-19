import * as fs from 'fs';
import { ChoreographyElement } from './../../src/models/ChoreographyElement';
import { StructuredChoreography } from './../../src/models/StructuredChoreography';
import { ContractGenerator } from './../../src/translator/ContractGenerator';
const BpmnModdle = require('esm')(module)('bpmn-moddle').default;
const moddle = new BpmnModdle();

const sequenceChoreo = fs.readFileSync('./test/test-choreographies/sequence.bpmn', 'utf8');

test('Generate Storage for Task sequence', async () => {
  const init = new ChoreographyElement(moddle.create('bpmn:StartEvent', {id: 'Start1'}));
  const element1 = new ChoreographyElement(
    moddle.create('bpmn:ChoreographyTask', {id: 'Task1', initiatingParticipantRef: {id: 'Participant1'}}));
  const element2 = new ChoreographyElement(
    moddle.create('bpmn:ChoreographyTask', {id: 'Task2', initiatingParticipantRef: {id: 'Participant2'}}));
  const element3 = new ChoreographyElement(
    moddle.create('bpmn:ChoreographyTask', {id: 'Task3', initiatingParticipantRef: {id: 'Participant1'}}));
  const end = new ChoreographyElement(moddle.create('bpmn:EndEvent', {id: 'End1'}));
  init.getNextElements().push(element1);
  element1.getPreviousElements().push(element1);
  element1.getNextElements().push(element2);
  element2.getPreviousElements().push(element2);
  element2.getNextElements().push(element3);
  element3.getPreviousElements().push(element3);
  element3.getNextElements().push(end);
  end.getPreviousElements().push(end);
  const choreographies = [new StructuredChoreography([
    init,
    element1,
    element2,
    element3,
    end,
  ])];
  const code = ContractGenerator.generateFiCode(choreographies, [])[0];
  expect(code.taskNames).toEqual([element1.id, element2.id, element3.id]);
  expect(code.initialState).toEqual('(Pair False (Pair False (Pair False (Pair False False))))');
  expect(code.code.match(/storage bool Task1_active;\nstorage bool Task2_active;\nstorage bool Task3_active;\nstorage bool initialized;\nstorage bool finished;\n/i).length)
  .toEqual(1);
});

test('Every Task checks if itself is Active', async () => {
  const init = new ChoreographyElement(moddle.create('bpmn:StartEvent', {id: 'Start1'}));
  const element1 = new ChoreographyElement(
    moddle.create('bpmn:ChoreographyTask', {id: 'Task1', initiatingParticipantRef: {id: 'Participant1'}}));
  const element2 = new ChoreographyElement(
    moddle.create('bpmn:ChoreographyTask', {id: 'Task2', initiatingParticipantRef: {id: 'Participant2'}}));
  const element3 = new ChoreographyElement(
    moddle.create('bpmn:ChoreographyTask', {id: 'Task3', initiatingParticipantRef: {id: 'Participant1'}}));
  const end = new ChoreographyElement(moddle.create('bpmn:EndEvent', {id: 'End1'}));
  init.getNextElements().push(element1);
  element1.getPreviousElements().push(element1);
  element1.getNextElements().push(element2);
  element2.getPreviousElements().push(element2);
  element2.getNextElements().push(element3);
  element3.getPreviousElements().push(element3);
  element3.getNextElements().push(end);
  end.getPreviousElements().push(end);
  const choreographies = [new StructuredChoreography([
    init,
    element1,
    element2,
    element3,
    end,
  ])];
  const code = ContractGenerator.generateFiCode(choreographies, [])[0].code;
  expect(code.match(/entry Task1 \(\) {\n  assert \(storage\.Task1_active\);/is).length).toEqual(1);
  expect(code.match(/entry Task2 \(\) {\n  assert \(storage\.Task2_active\);/is).length).toEqual(1);
  expect(code.match(/entry Task3 \(\) {\n  assert \(storage\.Task3_active\);/is).length).toEqual(1);
});

test('Every Task disables itself', async () => {
  const init = new ChoreographyElement(moddle.create('bpmn:StartEvent', {id: 'Start1'}));
  const element1 = new ChoreographyElement(
    moddle.create('bpmn:ChoreographyTask', {id: 'Task1', initiatingParticipantRef: {id: 'Participant1'}}));
  const element2 = new ChoreographyElement(
    moddle.create('bpmn:ChoreographyTask', {id: 'Task2', initiatingParticipantRef: {id: 'Participant2'}}));
  const element3 = new ChoreographyElement(
    moddle.create('bpmn:ChoreographyTask', {id: 'Task3', initiatingParticipantRef: {id: 'Participant1'}}));
  const end = new ChoreographyElement(moddle.create('bpmn:EndEvent', {id: 'End1'}));
  init.getNextElements().push(element1);
  element1.getPreviousElements().push(element1);
  element1.getNextElements().push(element2);
  element2.getPreviousElements().push(element2);
  element2.getNextElements().push(element3);
  element3.getPreviousElements().push(element3);
  element3.getNextElements().push(end);
  end.getPreviousElements().push(end);
  const choreographies = [new StructuredChoreography([
    init,
    element1,
    element2,
    element3,
    end,
  ])];
  const code = ContractGenerator.generateFiCode(choreographies, [])[0].code;
  expect(code.match(/entry Task1 \(\) {.*storage\.Task1_active = bool false;/is).length).toEqual(1);
  expect(code.match(/entry Task2 \(\) {.*storage\.Task2_active = bool false;/is).length).toEqual(1);
  expect(code.match(/entry Task3 \(\) {.*storage\.Task3_active = bool false;/is).length).toEqual(1);
});

test('Add Sender Checks if Role is provided', async () => {
  const init = new ChoreographyElement(moddle.create('bpmn:StartEvent', {id: 'Start1'}));
  const element1 = new ChoreographyElement(
    moddle.create('bpmn:ChoreographyTask', {id: 'Task1', initiatingParticipantRef: {id: 'Participant1'}}));
  const end = new ChoreographyElement(moddle.create('bpmn:EndEvent', {id: 'End1'}));
  init.getNextElements().push(element1);
  element1.getPreviousElements().push(element1);
  element1.getNextElements().push(end);
  end.getPreviousElements().push(end);
  const choreographies = [new StructuredChoreography([
    init,
    element1,
    end,
  ])];
  const code = ContractGenerator.generateFiCode(choreographies, [{roleId: 'Participant1', address: 'xxxxxx'}])[0].code;
  expect(code.match(/entry Task1 \(\) {.*assert \(SENDER == address "xxxxxx"\);/is).length).toEqual(1);
});

test('Generate Michelson Code', async () => {
  const init = new ChoreographyElement(moddle.create('bpmn:StartEvent', {id: 'Start1'}));
  const element1 = new ChoreographyElement(
    moddle.create('bpmn:ChoreographyTask', {id: 'Task1', initiatingParticipantRef: {id: 'Participant1'}}));
  const end = new ChoreographyElement(moddle.create('bpmn:EndEvent', {id: 'End1'}));
  init.getNextElements().push(element1);
  element1.getPreviousElements().push(element1);
  element1.getNextElements().push(end);
  end.getPreviousElements().push(end);
  const choreographies = [new StructuredChoreography([
    init,
    element1,
    end,
  ])];
  const code = ContractGenerator.generateFiCode(choreographies, [{roleId: 'Participant1', address: 'xxxxxx'}]);
  const contract = ContractGenerator.compileFiCode(code)[0];
  expect(contract.getCode).not.toBeNull();
  expect(contract.getAbi).not.toBeNull();
  expect(contract.getCode).not.toEqual('');
  expect(contract.getAbi).not.toEqual('');
});

test('Generate Michelson from BPMN', async () => {
  const contract = (await ContractGenerator.generateContractsFromBPMN(sequenceChoreo))[0];
  expect(contract.getCode).not.toBeNull();
  expect(contract.getAbi).not.toBeNull();
  expect(contract.getCode).not.toEqual('');
  expect(contract.getAbi).not.toEqual('');
});
