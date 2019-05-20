import { FlowElement, ParallelGateway } from 'bpmn-moddle';
import { is } from '../helper/helpers';
import { ChoreographyElement } from './ChoreographyElement';

export class StructuredChoreography {
  // private tasks: ChoreographyTask[];
  // private gateways: Gateway[];
  private elements: ChoreographyElement[] = [];

  /*constructor(tasks: ChoreographyTask[], gateways: Gateway[]) {
    this.tasks = tasks;
    this.gateways = gateways;
  }*/
  constructor(elements: ChoreographyElement[]) {
    this.elements = elements;
  }

  public getElements(): ChoreographyElement[] {
    return this.elements;
  }

  public getChoreographyTasks(): ChoreographyElement[] {
    return this.elements.filter((element: ChoreographyElement) => is('bpmn:ChoreographyTask')(element.getElement()));
  }

  public getAndJoinGateways(): ChoreographyElement[] {
    return this.elements.filter((element: ChoreographyElement) => {
      const flowElement = element.getElement();
      if (is('bpmn:ParallelGateway')(flowElement)) {
        const parallelGateway = flowElement as ParallelGateway;
        return parallelGateway.gatewayDirection === 'Converging';
      }
      return false;
    });
  }

  public getElementByReference(reference: FlowElement) {
    return this.elements.find((element: ChoreographyElement) => element.getElement().id === reference.id);
  }
}

export default StructuredChoreography;
