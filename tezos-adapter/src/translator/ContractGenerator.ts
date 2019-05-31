import { FlowNode, ParallelGateway, SequenceFlow } from 'bpmn-moddle';
import fi from 'fi-compiler';
import { is } from '../helper/helpers';
import { ChoreographyElement } from './../models/ChoreographyElement';
import { Contract } from './../models/Contract';
import { StructuredChoreography } from './../models/StructuredChoreography';
import { ChoreographyPreprocessor } from './ChoreographyPreprocessor';
export class ContractGenerator {

  public static async generateContractsFromBPMN(xml: string): Promise<Contract[]> {
    const structuredChoreographies = await ChoreographyPreprocessor.parseXml(xml);
    const definitions = ChoreographyPreprocessor.processDefinitions(structuredChoreographies);
    const code = ContractGenerator.generateContracts(definitions);
    return code;
  }

  public static generateContracts(choreographies: StructuredChoreography[]): Contract[] {
    const fiCode = ContractGenerator.generateFiCode(choreographies);
    return ContractGenerator.compileFiCode(fiCode);
  }

  public static compileFiCode(code: string[]): Contract[] {
    return code.map((fiCode: string) => {
      const compiled = fi.compile(fiCode);
      return new Contract(compiled.ml, compiled.abi, fiCode);
    });
  }

  public static generateFiCode(choreographies: StructuredChoreography[]): string[] {
    const fiSources: string[] = choreographies.map((choreography: StructuredChoreography) =>  {
      const elements = choreography.getElements();
      const tasks = choreography.getChoreographyTasks();
      const joins = choreography.getAndJoinGateways();

      // generate storage
      const storage = ContractGenerator.generateStorage(tasks, joins);

      // generate entries
      const initEntry = ContractGenerator.generateInitEntry(elements);

      const taskEntries = tasks
        .map((task: ChoreographyElement): string => ContractGenerator.generateTaskEntry(task, joins))
        .join('');

      return storage +
        initEntry +
        taskEntries;
    });
    return fiSources;
  }

  private static generateInitEntry(elements: ChoreographyElement[]): string {
    const entryPoint = 'entry init() {\n';

    const startEvent = elements
        .filter((element: ChoreographyElement) => is('bpmn:StartEvent')(element.getElement()));

    const activateInitialElements = startEvent
      .map((element: ChoreographyElement) => element
        .getNextElements()
        .map((nextElement: ChoreographyElement) => `  storage.${nextElement.id}_active = bool true;\n`)
        .join(''))
      .join('');

    return entryPoint +
      activateInitialElements +
      '}\n\n';
  }

  private static generateStorage(tasks: ChoreographyElement[], joins: ChoreographyElement[]): string {
    const taskStates = tasks.map((task: ChoreographyElement) =>
      `storage bool ${task.id}_active;\n`).join('');

    const joinStates = joins.map((join: ChoreographyElement) =>
          join.getPreviousElements()
            .filter((element: ChoreographyElement) =>
              is('bpmn:SequenceFlow')(element.getElement()))
            .map((element: ChoreographyElement) =>
              `storage bool ${element.id}_active;\n`,
            ).join('')).join('');

    return taskStates +
      joinStates +
      'storage bool finished;\n\n';
  }

  private static generateTaskEntry(task: ChoreographyElement, joins: ChoreographyElement[]): string {
      const entryPoint = `entry ${task.id} () {\n`;

      const controlFlowCheck = `  assert (storage.${task.id}_active);\n`;

      const controlFlowActions = ContractGenerator.generateControlFlowActions(task, joins);

      return entryPoint +
        controlFlowCheck +
        controlFlowActions +
        '}\n\n';
  }

  private static generateParallelJoin(join: ChoreographyElement, joins: ChoreographyElement[]): string {
    const controlFlowCheck = `  if (${join
      .getPreviousElements()
      .map((element: ChoreographyElement) => `storage.${element.id}_active`)
      .join(' && ')}) {\n`;

    const controlFlowActions = ContractGenerator.generateControlFlowActions(join, joins);

    return controlFlowCheck +
      controlFlowActions +
      '  }\n';
  }

  private static generateControlFlowActions(
    choreographyElement: ChoreographyElement,
    joins: ChoreographyElement[]): string {
    const deactivatePreviousElements = choreographyElement
    .getPreviousElements()
    .map((element: ChoreographyElement) => `  storage.${element.id}_active = bool false;\n`)
    .join('');

    const activateNextElements = choreographyElement
    .getNextElements()
    .filter((element: ChoreographyElement) => !is('bpmn:EndEvent')(element.getElement()))
    .map((element: ChoreographyElement) => `  storage.${element.id}_active = bool true;\n`)
    .join('');

    const finishedFlag = choreographyElement
    .getNextElements()
    .find((element: ChoreographyElement) => is('bpmn:EndEvent')(element.getElement())) !== undefined
      ? '  storage.finished = bool true;\n'
      : '';

    // try to execute subsequent parallel joins
    const subsequentParallelJoins = choreographyElement
    .getNextElements()
    .filter((element: ChoreographyElement) => is('bpmn:SequenceFlow')(element.getElement()))
    .map((element: ChoreographyElement) => (element.getElement() as SequenceFlow).targetRef)
    .filter((flowNode: FlowNode) =>
      is('bpmn:ParallelGateway')(flowNode) && (flowNode as ParallelGateway).outgoing.length === 1)
    .map((parallelJoin: FlowNode) =>
      ContractGenerator
        .generateParallelJoin(joins.find((join: ChoreographyElement) => join.id === parallelJoin.id), joins))
    .join('');

    return deactivatePreviousElements +
      activateNextElements +
      finishedFlag +
      subsequentParallelJoins;
  }
}

export default ContractGenerator;
