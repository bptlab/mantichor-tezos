import { ChoreographyElement } from './../../src/models/ChoreographyElement';
import { StructuredChoreography } from './../../src/models/StructuredChoreography';
const BpmnModdle = require('esm')(module)('bpmn-moddle').default;
const moddle = new BpmnModdle();

test('Get Elements from Structured Choreography', async () => {
  const elements = [
    new ChoreographyElement(moddle.create('bpmn:ChoreographyTask')),
    new ChoreographyElement(moddle.create('bpmn:ChoreographyTask')),
    new ChoreographyElement(moddle.create('bpmn:ChoreographyTask')),
    new ChoreographyElement(moddle.create('bpmn:SequenceFlow')),
    new ChoreographyElement(moddle.create('bpmn:SequenceFlow')),
    new ChoreographyElement(moddle.create('bpmn:SequenceFlow')),
    new ChoreographyElement(moddle.create('bpmn:StartEvent')),
    new ChoreographyElement(moddle.create('bpmn:ParallelGateway')),
  ];
  const structuredChoreography = new StructuredChoreography(elements);
  expect(structuredChoreography.getElements().length).toEqual(elements.length);
});

test('Add Elements to Structured Choreography', async () => {
  const elements = [
    new ChoreographyElement(moddle.create('bpmn:ChoreographyTask')),
    new ChoreographyElement(moddle.create('bpmn:ChoreographyTask')),
    new ChoreographyElement(moddle.create('bpmn:ChoreographyTask')),
  ];
  const structuredChoreography = new StructuredChoreography(elements);
  structuredChoreography.addElements(elements);
  expect(structuredChoreography.getElements().length).toEqual(elements.length * 2);
});

test('Get Choreography Tasks from Structured Choreography', async () => {
  const structuredChoreography = new StructuredChoreography([
    new ChoreographyElement(moddle.create('bpmn:ChoreographyTask')),
    new ChoreographyElement(moddle.create('bpmn:ChoreographyTask')),
    new ChoreographyElement(moddle.create('bpmn:ChoreographyTask')),
    new ChoreographyElement(moddle.create('bpmn:SequenceFlow')),
    new ChoreographyElement(moddle.create('bpmn:SequenceFlow')),
    new ChoreographyElement(moddle.create('bpmn:SequenceFlow')),
  ]);
  expect(structuredChoreography.getChoreographyTasks().length).toEqual(3);
});

test('Get Parallel Joins from Structured Choreography', async () => {
  const structuredChoreography = new StructuredChoreography([
    new ChoreographyElement(moddle.create('bpmn:ChoreographyTask')),
    new ChoreographyElement(moddle.create('bpmn:ParallelGateway', {
      outgoing: [
        moddle.create('bpmn:SequenceFlow'),
      ],
    })),
    new ChoreographyElement(moddle.create('bpmn:ParallelGateway', {
      outgoing: [
        moddle.create('bpmn:SequenceFlow'),
        moddle.create('bpmn:SequenceFlow'),
      ],
    })),
    new ChoreographyElement(moddle.create('bpmn:ParallelGateway', {
      outgoing: [
        moddle.create('bpmn:SequenceFlow'),
      ],
    })),
  ]);
  expect(structuredChoreography.getAndJoinGateways().length).toEqual(2);
});

test('Get Subchoreographies from Structured Choreography', async () => {
  const structuredChoreography = new StructuredChoreography([
    new ChoreographyElement(moddle.create('bpmn:SubChoreography')),
    new ChoreographyElement(moddle.create('bpmn:ChoreographyTask')),
    new ChoreographyElement(moddle.create('bpmn:SubChoreography')),
  ]);
  expect(structuredChoreography.getSubChoreographies().length).toEqual(2);
});

test('Get element by id from Structured Choreography', async () => {
  const element = moddle.create('bpmn:ChoreographyTask', {id: 'Task1'});
  const choreographyElement = new ChoreographyElement(element);
  const structuredChoreography = new StructuredChoreography([
    choreographyElement,
    new ChoreographyElement(moddle.create('bpmn:ChoreographyTask', {id: 'Task2'})),
    new ChoreographyElement(moddle.create('bpmn:ChoreographyTask', {id: 'Task3'})),
  ]);
  expect(structuredChoreography.getElementByReference(element)).toEqual(choreographyElement);
});
