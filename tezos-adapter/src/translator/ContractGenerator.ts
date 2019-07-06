import { ChoreographyActivity, FlowNode, ParallelGateway, SequenceFlow } from 'bpmn-moddle';
import fi from 'fi-compiler';
import { isUndefined } from 'util';
import { is } from '../helper/helpers';
import { RoleMapping } from '../models/RoleMapping';
import { ChoreographyElement } from './../models/ChoreographyElement';
import { Contract } from './../models/Contract';
import { StructuredChoreography } from './../models/StructuredChoreography';
import { ChoreographyPreprocessor } from './ChoreographyPreprocessor';

interface FiCodeMetaData {
  code: string;
  initialState: string;
  taskNames: string[];
}

export class ContractGenerator {

  public static async generateContractsFromBPMN(xml: string, roleMappings: RoleMapping[]): Promise<Contract[]> {
    const structuredChoreographies = await ChoreographyPreprocessor.parseXml(xml);
    const definitions = ChoreographyPreprocessor.processDefinitions(structuredChoreographies);
    const code = ContractGenerator.generateContracts(definitions, roleMappings);
    return code;
  }

  public static generateContracts(choreographies: StructuredChoreography[], roleMappings: RoleMapping[]): Contract[] {
    const fiCode = ContractGenerator.generateFiCode(choreographies, roleMappings);
    return ContractGenerator.compileFiCode(fiCode);
  }

  public static compileFiCode(code: FiCodeMetaData[]): Contract[] {
    return code.map((fiCode: FiCodeMetaData) => {
      const compiled = fi.compile(fiCode.code);
      return new Contract(compiled.ml, compiled.abi, fiCode.initialState, fiCode.taskNames, fiCode.code);
    });
  }

  public static generateFiCode(
    choreographies: StructuredChoreography[], roleMappings: RoleMapping[]): FiCodeMetaData[] {
    const fiSources = choreographies.map((choreography: StructuredChoreography): FiCodeMetaData => {
      const elements = choreography.getElements();
      const tasks = choreography.getChoreographyTasks();
      const joins = choreography.getAndJoinGateways();

      // generate storage
      const { storage, taskNames } = ContractGenerator.generateStorage(tasks, joins);

      // generate entries
      const initEntry = ContractGenerator.generateInitEntry(elements);

      const taskEntries = tasks
        .map((task: ChoreographyElement): string => ContractGenerator.generateTaskEntry(task, joins, roleMappings))
        .join('');

      // generate initial state
      const initialState = ContractGenerator.generateInitialState(tasks, joins);

      return {
        code: storage + initEntry + taskEntries,
        initialState,
        taskNames,
      };
    });
    return fiSources;
  }

  private static generateInitEntry(elements: ChoreographyElement[]): string {
    const entryPoint = 'entry init() {\n  assert(storage.initialized == bool false);\n';

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
      '  storage.initialized = bool true;\n}\n\n';
  }

  private static generateInitialState(tasks: ChoreographyElement[], joins: ChoreographyElement[]): string {
    const states = tasks.length + joins.length + 2; // Initialized and finished state
    let result = '';
    for (let i = 1; i < states; i++) {
      result += '(Pair False ';
    }
    result += 'False';
    for (let i = 1; i < states; i++) {
      result += ')';
    }
    return result;
  }

  private static generateStorage(
    tasks: ChoreographyElement[], joins: ChoreographyElement[]): { storage: string, taskNames: string[] } {
    const taskNames = [];
    const taskStates = tasks.map((task: ChoreographyElement) => {
      taskNames.push(task.id);
      return `storage bool ${task.id}_active;\n`;
    }).join('');

    const joinStates = joins.map((join: ChoreographyElement) =>
      join.getPreviousElements()
        .filter((element: ChoreographyElement) =>
          is('bpmn:SequenceFlow')(element.getElement()))
        .map((element: ChoreographyElement) =>
          `storage bool ${element.id}_active;\n`,
        ).join('')).join('');

    return {
      storage: (taskStates + joinStates + 'storage bool initialized;\nstorage bool finished;\n\n'),
      taskNames,
    };
  }

  private static generateTaskEntry(
    task: ChoreographyElement, joins: ChoreographyElement[], roleMappings: RoleMapping[]): string {
    const entryPoint = `entry ${task.id} () {\n`;

    const initiator = (task.getElement() as ChoreographyActivity).initiatingParticipantRef.id;
    const mapping = roleMappings.find((map: RoleMapping) => map.roleId === initiator);

    // Warning: Unsecured task execution may be possible. An error should be thrown instead of not having the check!
    const initiatorCheck = isUndefined(mapping)
      ? ''
      : `  assert (SENDER == address "${mapping.address}");\n`;

    if (isUndefined(mapping)) {
      console.warn(`Warning! Task ${task.id} is unsecured! Please provide a valid role mapping.`);
    }

    const controlFlowCheck = `  assert (storage.${task.id}_active);\n`;

    const controlFlowActions = ContractGenerator.generateControlFlowActions(task, joins);

    return entryPoint +
      initiatorCheck +
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
