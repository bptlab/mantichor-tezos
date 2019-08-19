import { ChoreographyElement } from './../../src/models/ChoreographyElement';
const BpmnModdle = require('esm')(module)('bpmn-moddle').default;
const moddle = new BpmnModdle();

test('Eliminate duplicates', async () => {
  const element = new ChoreographyElement(moddle.create('bpmn:ChoreographyTask'));
  element
    .getNextElements()
    .push(new ChoreographyElement(moddle.create('bpmn:ChoreographyTask', {id: 'Task1'})));
  element
    .getNextElements()
    .push(new ChoreographyElement(moddle.create('bpmn:ChoreographyTask', {id: 'Task1'})));
  element
    .getPreviousElements()
    .push(new ChoreographyElement(moddle.create('bpmn:ChoreographyTask', {id: 'Task2'})));
  element
    .getPreviousElements()
    .push(new ChoreographyElement(moddle.create('bpmn:ChoreographyTask', {id: 'Task2'})));
  expect(element.getNextElements().length).toEqual(2);
  expect(element.getPreviousElements().length).toEqual(2);
  element.eliminateDuplicates();
  expect(element.getNextElements().length).toEqual(1);
  expect(element.getPreviousElements().length).toEqual(1);
});

test('Get incoming elements', async () => {
  const incoming = [
    moddle.create('bpmn:SequenceFlow'),
    moddle.create('bpmn:SequenceFlow'),
    moddle.create('bpmn:SequenceFlow'),
  ];
  const outgoing = [
    moddle.create('bpmn:SequenceFlow'),
    moddle.create('bpmn:SequenceFlow'),
  ];

  const element = new ChoreographyElement(moddle.create('bpmn:ChoreographyTask', {
    incoming,
    outgoing,
  }));
  expect(element.incoming.length).toEqual(incoming.length);
  expect(element.outgoing.length).toEqual(outgoing.length);
});

test('Add parent', async () => {
  const parent = moddle.create('bpmn:ChoreographyTask', {id: 'Parent'});
  const element = new ChoreographyElement(
    moddle.create('bpmn:ChoreographyTask'),
    parent,
  );
  expect(element.getParent()).toEqual(parent);
});

test('Get Element Name', async () => {
  const name = 'Task';
  const element = new ChoreographyElement(
    moddle.create('bpmn:ChoreographyTask', {name}),
  );
  expect(element.name).toEqual(name);
});
