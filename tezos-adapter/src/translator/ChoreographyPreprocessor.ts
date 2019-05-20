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
          ChoreographyPreprocessor.selectNextElements(flowNode, element.getNextElements(), structuredChoreography);
          // Calculate Previous Elements
          element.appendPreviousElement(element);
          if (is('bpmn:ChoreographyTask')(flowNode)) {
            flowNode.incoming.forEach((incomingEdge: SequenceFlow) => {
              const source = incomingEdge.sourceRef;
              if (is('bpmn:ExclusiveGateway')(source)
                && (source as ExclusiveGateway).gatewayDirection === 'Diverging') {
                  ChoreographyPreprocessor.selectNextElements(
                    source,
                    element.getPreviousElements(),
                    structuredChoreography,
                  );
              }
            });
          } else if (is('bpmn:ParallelGateway')(flowNode)
            && (element.getElement() as ParallelGateway).gatewayDirection === 'Converging') {
              flowNode.incoming.forEach((incomingEdge: SequenceFlow) => {
                element.appendPreviousElement(structuredChoreography.getElementByReference(incomingEdge));
              });
          }
        });
      return structuredChoreography;
    });
    return structuredChoreographies;
  }

  private static selectNextElements(
    flowNode: FlowNode, nextElements: ChoreographyElement[], structuredChoreography: StructuredChoreography) {
    // Calculate Next Elements
    (flowNode.outgoing || []).forEach((outgoingEdge: SequenceFlow) => {
      const target = outgoingEdge.targetRef;

      if (is('bpmn:ChoreographyTask')(target)) {
        nextElements.push(structuredChoreography.getElementByReference(target));
      } else if (is('bpmn:Gateway')(target)) {
        const gateway = target as Gateway;
        if (gateway.gatewayDirection === 'Diverging') {
          ChoreographyPreprocessor.selectNextElements(target, nextElements, structuredChoreography);
        } else if (gateway.gatewayDirection === 'Converging') {
          if (is('bpmn:ExclusiveGateway')(gateway)) {
            ChoreographyPreprocessor.selectNextElements(target, nextElements, structuredChoreography);
          } else if (is('bpmn:ParallelGateway')(gateway)) {
            nextElements.push(structuredChoreography.getElementByReference(outgoingEdge));
          }
        }
      } else if (is('bpmn:EndEvent')(target)) {
        nextElements.push(structuredChoreography.getElementByReference(target));
      }
    });
  }
}

export default ChoreographyPreprocessor;
