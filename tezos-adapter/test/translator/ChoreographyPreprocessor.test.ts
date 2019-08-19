import { Choreography, RootElement } from 'bpmn-moddle';
import * as fs from 'fs';
import { is } from '../../src/helper';
import { ChoreographyPreprocessor } from './../../src/translator/ChoreographyPreprocessor';
const BpmnModdle = require('esm')(module)('bpmn-moddle').default;
const moddle = new BpmnModdle();

const sequenceChoreo = fs.readFileSync('./test/test-choreographies/sequence.bpmn', 'utf8');
const exclusiveChoreo = fs.readFileSync('./test/test-choreographies/exclusive.bpmn', 'utf8');
const eventBasedChoreo = fs.readFileSync('./test/test-choreographies/event-based.bpmn', 'utf8');
const parallelChoreo = fs.readFileSync('./test/test-choreographies/parallel.bpmn', 'utf8');
const subChoreoChoreo = fs.readFileSync('./test/test-choreographies/subchoreo.bpmn', 'utf8');

test('Parse XML using BPMNModdle', async () => {
  const sequenceDefinitions = await ChoreographyPreprocessor.parseXml(sequenceChoreo);
  const choreographies = [];
  sequenceDefinitions.rootElements.forEach((element: RootElement): void => {
    if (is('bpmn:Choreography')(element)) {
      choreographies.push(element as Choreography);
    }
  });
  expect(choreographies.length).toEqual(1);
  const elements = (choreographies[0] as Choreography).flowElements;
  expect(elements.length).toEqual(9);
  expect(elements.filter(is('bpmn:ChoreographyTask')).length).toEqual(3);
  expect(elements.filter(is('bpmn:Event')).length).toEqual(2);
  expect(elements.filter(is('bpmn:SequenceFlow')).length).toEqual(4);
});

test('Generate Structured Choreography', async () => {
  const definitions = await ChoreographyPreprocessor.parseXml(sequenceChoreo);
  const structuredChoreographies = ChoreographyPreprocessor.processDefinitions(definitions);
  expect(structuredChoreographies.length).toEqual(1);
  expect(structuredChoreographies[0].getElements().length).toEqual(9);
});

test('Generate Structured Choreography using Sequence Choreography', async () => {
  const definitions = await ChoreographyPreprocessor.parseXml(sequenceChoreo);
  const structuredChoreography = ChoreographyPreprocessor.processDefinitions(definitions)[0];
  expect(structuredChoreography.getChoreographyTasks().length).toEqual(3);
});

test('Generate Structured Choreography using Parallel Choreography', async () => {
  const definitions = await ChoreographyPreprocessor.parseXml(parallelChoreo);
  const structuredChoreography = ChoreographyPreprocessor.processDefinitions(definitions)[0];
  expect(structuredChoreography.getAndJoinGateways().length).toEqual(1);
  const parallelGateways = structuredChoreography.getElements().filter((element) =>
    is('bpmn:ParallelGateway')(element.getElement()));
  expect(parallelGateways.length).toEqual(2);
});

test('Generate Structured Choreography using Subchoreography Choreography', async () => {
  const definitions = await ChoreographyPreprocessor.parseXml(subChoreoChoreo);
  const structuredChoreography = ChoreographyPreprocessor.processDefinitions(definitions)[0];
  expect(structuredChoreography.getSubChoreographies().length).toEqual(1);
});

test('Generate Structured Choreography using Exclusive Choreography', async () => {
  const definitions = await ChoreographyPreprocessor.parseXml(exclusiveChoreo);
  const structuredChoreography = ChoreographyPreprocessor.processDefinitions(definitions)[0];
  const exclusiveBasedGateways = structuredChoreography.getElements().filter((element) =>
    is('bpmn:ExclusiveGateway')(element.getElement()));
  expect(exclusiveBasedGateways.length).toEqual(2);
});

test('Generate Structured Choreography using Event Based Choreography', async () => {
  const definitions = await ChoreographyPreprocessor.parseXml(eventBasedChoreo);
  const structuredChoreography = ChoreographyPreprocessor.processDefinitions(definitions)[0];
  const eventBasedGateways = structuredChoreography.getElements().filter((element) =>
    is('bpmn:EventBasedGateway')(element.getElement()));
  expect(eventBasedGateways.length).toEqual(1);
  const exclusiveBasedGateways = structuredChoreography.getElements().filter((element) =>
    is('bpmn:ExclusiveGateway')(element.getElement()));
  expect(exclusiveBasedGateways.length).toEqual(1);
});

test('Empty Definition Set', async () => {
  const definitions = moddle.create('bpmn:Definitions', {rootElements: []});
  const structuredChoreography = ChoreographyPreprocessor.processDefinitions(definitions);
  expect(structuredChoreography).toEqual([]);
});
