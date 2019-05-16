import { parseString } from 'xml2js';

class Element {
  private previousElements: Element[] = [];
  private nextElements: Element[] = [];
}

class Participant {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  getName(): string {
    return this.name;
  }
}

class SequenceFlow extends Element {

}

class Task extends Element {

}

export class ChoreographyPreprocessor {

  static async processXml(xml: string): Promise<any>  {
    const jsonChoreography = await new Promise((resolve: (value: object) => void, reject: ({ }: object) => void): void => {
      parseString(xml, (error: object, result: object) => {
        if (error) {
          reject(error);
        }
        resolve(result);
      });
    });

    const choreographies = jsonChoreography['bpmn2:definitions']['bpmn2:choreography'];

    choreographies.forEach((elements: object) => {
      const participants = elements['bpmn2:participant'];
      const startEvents = elements['bpmn2:startEvent'];
      const sequenceFlow = elements['bpmn2:sequenceFlow'];
      const tasks = elements['bpmn2:choreographyTask'];
      console.info(elements);
    });


    return choreographies;
  }

}

export default ChoreographyPreprocessor;

