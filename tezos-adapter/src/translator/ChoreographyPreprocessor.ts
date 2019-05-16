import { Choreography, FlowElement, RootElement } from 'bpmn-moddle';
import {is, parseModdle} from '../helper/helpers';

export class ChoreographyPreprocessor {

  public static async processXml(xml: string): Promise<any>  {
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

    choreographies.forEach((choreography: Choreography): void => {
      choreography.flowElements.forEach((flowElement: FlowElement): void => {
        console.info(flowElement);
      });
      console.info('END');
    });
  }

}

export default ChoreographyPreprocessor;
