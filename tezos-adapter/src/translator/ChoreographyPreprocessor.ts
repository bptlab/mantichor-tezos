import { Choreography, ChoreographyTask, FlowElement, Gateway, RootElement } from 'bpmn-moddle';
import {is, parseModdle} from '../helper/helpers';
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
      const gateways: Gateway[] = choreography.flowElements
        .filter(is('bpmn:Gateway'))
        .map((element: FlowElement) => element as Gateway);
      const tasks: ChoreographyTask[] = choreography.flowElements
        .filter(is('bpmn:ChoreographyTask'))
        .map((element: FlowElement) => element as ChoreographyTask);
      return new StructuredChoreography(tasks, gateways);
    });

    return structuredChoreographies;
  }

}

export default ChoreographyPreprocessor;
