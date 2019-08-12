import {
  Choreography,
  Definitions,
  FlowElement,
  FlowNode,
  Gateway,
  ParallelGateway,
  RootElement,
  SequenceFlow,
  StartEvent,
  SubChoreography,
} from 'bpmn-moddle';
import { isNullOrUndefined } from 'util';
import { is, parseModdle } from '../helper';
import { ChoreographyElement } from './../models/ChoreographyElement';
import { StructuredChoreography } from './../models/StructuredChoreography';

export class ChoreographyPreprocessor {

  public static async parseXml(xml: string): Promise<Definitions> {
    return parseModdle(xml);
  }

  public static processDefinitions(definitions: Definitions): StructuredChoreography[] {

    const choreographies: Choreography[] = [];

    definitions.rootElements.forEach((element: RootElement): void => {
      if (is('bpmn:Choreography')(element)) {
        choreographies.push(element as Choreography);
      }
    });

    if (choreographies.length === 0) {
      return;
    }

    const structuredChoreographies = choreographies.map((choreography: Choreography): StructuredChoreography => {
      const structuredChoreography = new StructuredChoreography(choreography.flowElements
        .filter(is(
          'bpmn:ChoreographyTask',
          'bpmn:SubChoreography',
          'bpmn:Gateway',
          'bpmn:SequenceFlow',
          'bpmn:StartEvent',
          'bpmn:EndEvent'))
        .map((element: FlowElement) => new ChoreographyElement(element)));

      // Add a selection of sub choreography flow elements
      structuredChoreography.addElements(structuredChoreography
          .getElements()
          .filter((choreographyElement: ChoreographyElement) =>
            is('bpmn:SubChoreography')(choreographyElement.getElement()))
          .reduce((structuredChoreographyElements, choreographyElement: ChoreographyElement) =>
            structuredChoreographyElements
              .concat((choreographyElement.getElement() as SubChoreography).flowElements
                .filter(is(
                  'bpmn:ChoreographyTask',
                  'bpmn:SubChoreography',
                  'bpmn:Gateway',
                  'bpmn:SequenceFlow'))
                .map((element: FlowElement) =>
                  new ChoreographyElement(element, choreographyElement.getElement()))), []));

      structuredChoreography
        .getElements()
        .forEach((element: ChoreographyElement) => {
          if (!is('bpmn:FlowNode')(element.getElement())) {
            return;
          }
          const flowNode = element.getElement() as FlowNode;

          // Calculate Next Elements
          ChoreographyPreprocessor
            .selectNextElements(flowNode, element.getNextElements(), structuredChoreography);

          // Calculate Previous Elements
          ChoreographyPreprocessor
            .selectPreviousElements(flowNode, element.getPreviousElements(), structuredChoreography);

          element.eliminateDuplicates();
        });
      return structuredChoreography;
    });
    return structuredChoreographies;
  }

  private static selectNextElements(
    flowNode: FlowNode, nextElements: ChoreographyElement[], structuredChoreography: StructuredChoreography) {
    // Outgoing edge of EndEvent is undefined
    (flowNode.outgoing || []).forEach((outgoingEdge: SequenceFlow) => {
      const target = outgoingEdge.targetRef;

      if (is('bpmn:ChoreographyTask')(target)) {
        // Case: Choreography Task - Select subsequent task
        nextElements.push(structuredChoreography.getElementByReference(target));
      } else if (is('bpmn:SubChoreography')(target)) {
        const subChor = target as SubChoreography;
        const subStart = subChor.flowElements
          .filter((subElement: FlowElement) => is('bpmn:StartEvent')(subElement))[0] as StartEvent;
        subStart.outgoing.forEach((subSequenceFlow: SequenceFlow) => {
          nextElements.push(structuredChoreography.getElementByReference(subSequenceFlow.targetRef));
        });
        // nextElements.push(structuredChoreography.getElementByReference())
      } else if (is('bpmn:Gateway')(target)) {
        const gateway = target as Gateway;
        if (gateway.outgoing.length > 1) {
          // Case: Split - Select all subsequent elements of the split
          ChoreographyPreprocessor.selectNextElements(target, nextElements, structuredChoreography);
        } else if (gateway.outgoing.length === 1) {
          if (is('bpmn:ExclusiveGateway')(gateway) || is('bpmn:EventBasedGateway')(gateway)) {
            // Case: Exclusive Join - Select the subsequent element of an exclusive gateway
            ChoreographyPreprocessor.selectNextElements(target, nextElements, structuredChoreography);
          } else if (is('bpmn:ParallelGateway')(gateway)) {
            // Case: Parallel Join - Select outgoing edge of element (incoming edge of the gateway)
            nextElements.push(structuredChoreography.getElementByReference(outgoingEdge));
          }
        }
      } else if (is('bpmn:EndEvent')(target)) {
        const parentElement = structuredChoreography.getElementByReference(flowNode).getParent();
        if (parentElement != null) {
          if (is('bpmn:SubChoreography')(parentElement)) {
            const parentSubChoreo = parentElement as SubChoreography;
            parentSubChoreo.outgoing.forEach((parentOutgoingElement: SequenceFlow) => {
              nextElements.push(structuredChoreography.getElementByReference(parentOutgoingElement.targetRef));
            });
          }
        } else {
          // Case: End Event
          nextElements.push(structuredChoreography.getElementByReference(target));
        }
      }
    });
  }

  private static selectPreviousElements(
    flowNode: FlowNode, previousElements: ChoreographyElement[], structuredChoreography: StructuredChoreography,
  ) {
    if (is('bpmn:ChoreographyTask')(flowNode)) {
      // Case: Choreography Task
      previousElements.push(structuredChoreography.getElementByReference(flowNode));
      flowNode.incoming.forEach((incomingEdge: SequenceFlow) => {
        const source = incomingEdge.sourceRef;

        if (is('bpmn:ExclusiveGateway')(source) || is('bpmn:EventBasedGateway')(source)) {
          if ((source as Gateway).outgoing.length !== 1) {
            // Case: Exclusive Split - Select all subsequent elements of the gateway
            ChoreographyPreprocessor.selectNextElements(
              source,
              previousElements,
              structuredChoreography,
            );
          } else {
            const edgeToExclusiveSplit = source.incoming
              .find((incoming) =>
                (is('bpmn:ExclusiveGateway')(incoming.sourceRef) || is('bpmn:EventBasedGateway')(source)) &&
                ((incoming.sourceRef as Gateway).outgoing.length !== 1));
            if (!isNullOrUndefined(edgeToExclusiveSplit)) {
              ChoreographyPreprocessor.selectNextElements(
                edgeToExclusiveSplit.sourceRef,
                previousElements,
                structuredChoreography,
              );
            }
          }
        }
      });
    } else if (is('bpmn:ParallelGateway')(flowNode)
      && (flowNode as ParallelGateway).outgoing.length === 1) {
      // Case: Parallel Join - Select all incoming edges
      flowNode.incoming.forEach((incomingEdge: SequenceFlow) => {
        previousElements.push(structuredChoreography.getElementByReference(incomingEdge));
      });
    }
  }
}

export default ChoreographyPreprocessor;
