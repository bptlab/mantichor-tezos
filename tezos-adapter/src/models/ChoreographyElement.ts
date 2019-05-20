import { FlowElement, FlowNode } from 'bpmn-moddle';

export class ChoreographyElement {
  private nextElements: ChoreographyElement[] = [];
  private previousElements: ChoreographyElement[] = [];
  private element: FlowElement;

  constructor(element: FlowElement) {
    this.element = element;
  }

  public appendNextElement(element: ChoreographyElement): void {
    this.nextElements.push(element);
  }

  public appendPreviousElement(element: ChoreographyElement): void {
    this.previousElements.push(element);
  }

  public getNextElements(): ChoreographyElement[] {
    return this.nextElements;
  }

  public getPreviousElements(): ChoreographyElement[] {
    return this.previousElements;
  }

  public getElement(): FlowElement {
    return this.element;
  }
}
