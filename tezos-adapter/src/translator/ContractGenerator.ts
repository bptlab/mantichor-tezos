import { ParallelGateway, SequenceFlow } from 'bpmn-moddle';
import fi from 'fi-compiler';
import { is } from '../helper/helpers';
import { ChoreographyElement } from './../models/ChoreographyElement';
import { Contract } from './../models/Contract';
import { StructuredChoreography } from './../models/StructuredChoreography';
export class ContractGenerator {

  public static generateContracts(choreographies: StructuredChoreography[]): Contract[] {
    const fiCode = ContractGenerator.generateFiCode(choreographies);
    return ContractGenerator.compileFiCode(fiCode);
  }

  public static compileFiCode(code: string[]): Contract[] {
    return code.map((fiCode: string) => {
      const compiled = fi.compile(fiCode);
      return new Contract(compiled.ml, compiled.abi);
    });
  }

  public static generateFiCode(choreographies: StructuredChoreography[]): string[] {
    const fiSources: string[] = choreographies.map((choreography: StructuredChoreography) =>  {
      const tasks = choreography.getChoreographyTasks();
      const andJoinGateways = choreography.getAndJoinGateways();

      // generate storage
      const taskStates = `${tasks.map((task: ChoreographyElement) =>
          `storage bool ${task.id}_active;\n`).join('')}`;

      const andJoinGatewayStates = `${andJoinGateways
          .map((andJoinGateway: ChoreographyElement) =>
            andJoinGateway
              .incoming
              .map((incomingEdge: SequenceFlow) =>
                `storage bool ${incomingEdge.id}_active;\n`,
              ).join(''),
            ).join('')}`;

      const storageCode = taskStates + andJoinGatewayStates + 'storage bool finished;\n';

      // generate entries

      const taskEntries = tasks.map((task: ChoreographyElement): string => {
        let generateInitEntry = false;
        const code = `entry ${task.id} () {
          assert (storage.${task.id}_active);
          ${task.getPreviousElements().map((element: ChoreographyElement) => {
            if (is('bpmn:StartEvent')(element.getElement())) {
              generateInitEntry = true;
              return '';
            } else {
              return `storage.${element.id}_active = bool false;\n`;
            }
          }).join('')}
          ${task.getNextElements().map((element: ChoreographyElement) => {
            if (is('bpmn:EndEvent')(element.getElement())) {
              return `storage.finished = bool true;\n`;
            } else {
              return `storage.${element.id}_active = bool true;\n`;
            }
          }).join('')}
        }\n`;
        const initEntry = generateInitEntry
          ? `entry init() {storage.${task.id}_active = bool true;}\n`
          : '';
        return initEntry + code;
      }).join('');

      const joinEntries = andJoinGateways.map((join: ChoreographyElement): string => {
        let generateInitEntry = false;
        const code = `entry ${join.id} () {
          ${(join.getElement() as ParallelGateway).incoming.map((incomingEdge: SequenceFlow) => {
            return `assert(storage.${incomingEdge.id}_active);\n`;
          }).join('')}
          ${(join.getElement() as ParallelGateway).incoming.map((incomingEdge: SequenceFlow) => {
            if (is('bpmn:StartEvent')(join.getElement())) {
              generateInitEntry = true;
              return '';
            } else {
              return `storage.${incomingEdge.id}_active = bool false;\n`;
            }
          }).join('')}
          ${join.getNextElements().map((element: ChoreographyElement) => {
            if (is('bpmn:EndEvent')(element.getElement())) {
              return `storage.finished = bool true;\n`;
            } else {
              return `storage.${element.id}_active = bool true;\n`;
            }
          }).join('')}
        }\n`;
        const initEntry = generateInitEntry
          ? `entry init() {storage.${join.id}_active = bool true;}\n`
          : '';
        return initEntry + code;
      }).join('');

      const entries = taskEntries + joinEntries;

      return storageCode + entries;
    });
    return fiSources;
  }

  private static formatName(name: string): string {
    return name.replace(/ |,|:|;/gi, '_');
  }
}

export default ContractGenerator;
