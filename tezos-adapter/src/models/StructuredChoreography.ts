import { ChoreographyTask, Gateway } from 'bpmn-moddle';

export class StructuredChoreography {
  private tasks: ChoreographyTask[];
  private gateways: Gateway[];

  constructor(tasks: ChoreographyTask[], gateways: Gateway[]) {
    this.tasks = tasks;
    this.gateways = gateways;
  }
}

export default StructuredChoreography;
