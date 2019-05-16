import BpmnModdle, { Definitions } from 'bpmn-moddle';
const moddle = new BpmnModdle();

export class ChoreographyPreprocessor {

  public static async processXml(xml: string): Promise<any>  {
    const jsonChoreography = await new Promise((resolve: ({}: Definitions) => void, reject: ({}) => void): void => {
      moddle.fromXML(xml, (error: object, definitions: Definitions) => {
        if (error) {
          reject(error);
        }
        resolve(definitions);
      });
    });

    return jsonChoreography;
  }

}

export default ChoreographyPreprocessor;
