import {
  Choreography,
  ExclusiveGateway,
  FlowElement,
  FlowNode,
  Gateway,
  ParallelGateway,
  RootElement,
  SequenceFlow,
} from 'bpmn-moddle';
import {is, parseModdle} from '../helper/helpers';
import { ChoreographyElement } from './../models/ChoreographyElement';
import { StructuredChoreography } from './../models/StructuredChoreography';

export class ChoreographyPreprocessor {

  public static async processXml(xml: string): Promise<StructuredChoreography[]>  {
    const definitions = await parseModdle(xml);

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
        .filter((element) =>
          is('bpmn:ChoreographyTask', 'bpmn:Gateway', 'bpmn:SequenceFlow', 'bpmn:StartEvent', 'bpmn:EndEvent')(element))
        .map((element: FlowElement) => new ChoreographyElement(element)));

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
        } else if (is('bpmn:Gateway')(target)) {
          const gateway = target as Gateway;
          if (gateway.gatewayDirection === 'Diverging') {
            // Case: Split - Select all subsequent elements of the split
            ChoreographyPreprocessor.selectNextElements(target, nextElements, structuredChoreography);
          } else if (gateway.gatewayDirection === 'Converging') {
            if (is('bpmn:ExclusiveGateway')(gateway)) {
              // Case: Exclusive Join - Select the subsequent element of an exclusive gateway
              ChoreographyPreprocessor.selectNextElements(target, nextElements, structuredChoreography);
            } else if (is('bpmn:ParallelGateway')(gateway)) {
              // Case: Parallel Join - Select outgoing edge of element (incoming edge of the gateway)
              nextElements.push(structuredChoreography.getElementByReference(outgoingEdge));
            }
          }
        } else if (is('bpmn:EndEvent')(target)) {
          // Case: End Event
          nextElements.push(structuredChoreography.getElementByReference(target));
        }
      });
  }

  private static selectPreviousElements(
    flowNode: FlowNode, previousElements: ChoreographyElement[], structuredChoreography: StructuredChoreography,
  ) {
    previousElements.push(structuredChoreography.getElementByReference(flowNode));
    if (is('bpmn:ChoreographyTask')(flowNode)) {
      // Case: Choreography Task
      flowNode.incoming.forEach((incomingEdge: SequenceFlow) => {
        const source = incomingEdge.sourceRef;

        if (is('bpmn:ExclusiveGateway')(source)
          && (source as ExclusiveGateway).gatewayDirection === 'Diverging') {
            // Case: Exclusive Split - Select all subsequent elements of the gateway
            ChoreographyPreprocessor.selectNextElements(
              source,
              previousElements,
              structuredChoreography,
            );
        }
      });
    } else if (is('bpmn:ParallelGateway')(flowNode)
      && (flowNode as ParallelGateway).gatewayDirection === 'Converging') {
        // Case: Parallel Join - Select all incoming edges
        flowNode.incoming.forEach((incomingEdge: SequenceFlow) => {
          previousElements.push(structuredChoreography.getElementByReference(incomingEdge));
        });
    }
  }
}

export default ChoreographyPreprocessor;
