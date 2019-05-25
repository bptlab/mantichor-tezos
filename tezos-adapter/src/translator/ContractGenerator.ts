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
          `storage bool task_${task.id}_active;\n`).join('')}`;

      const andJoinGatewayStates = `${andJoinGateways
          .map((andJoinGateway: ChoreographyElement) =>
            andJoinGateway
              .getPreviousElements()
              .map((incomingEdge: ChoreographyElement) =>
                `storage bool join_input_${incomingEdge.id}_active;\n`,
              ).join(''),
            ).join('')}`;

      const storageCode = taskStates + andJoinGatewayStates + 'storage bool finished;\n';

      // generate entries

      const taskEntries = tasks.map((task: ChoreographyElement): string => {
        let generateInitEntry = false;
        const code = `entry task_${task.id} () {
          assert (storage.task_${task.id}_active);
          ${task.getPreviousElements().map((element: ChoreographyElement) => {
            if (is('bpmn:ChoreographyTask')(element.getElement())) {
              return `storage.task_${element.id}_active = bool false;\n`;
            } else if (is('bpmn:SequenceFlow')(element.getElement())) {
              return `storage.join_input_${element.id}_active = bool false;\n`;
            } else if (is('bpmn:StartEvent')(element)) {
              generateInitEntry = true;
            }
          })}
          ${task.getNextElements().map((element: ChoreographyElement) => {
            if (is('bpmn:ChoreographyTask')(element.getElement())) {
              return `storage.task_${element.id}_active = bool true;\n`;
            } else if (is('bpmn:SequenceFlow')(element.getElement())) {
              return `storage.join_input_${element.id}_active = bool true;\n`;
            }
          })}
        }`;
        const initEntry = generateInitEntry
          ? `entry init() {storage.task_${task.id}_active = bool true;}\n`
          : '';
        return initEntry + code;
      }).join('');

      const joinEntries = '';

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
