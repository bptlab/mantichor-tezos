import { FlowElement, FlowNode } from 'bpmn-moddle';

export class ChoreographyElement {
  private nextElements: ChoreographyElement[] = [];
  private previousElements: ChoreographyElement[] = [];
  private element: FlowElement;
  private parent: FlowElement;

  constructor(element: FlowElement, parent: FlowElement = null) {
    this.element = element;
    this.parent = parent;
  }

  public eliminateDuplicates(): void {
    this.nextElements = this.makeSet(this.nextElements);
    this.previousElements = this.makeSet(this.previousElements);
  }

  public getNextElements(): ChoreographyElement[] {
    return this.nextElements;
  }

  public getPreviousElements(): ChoreographyElement[] {
    return this.previousElements;
  }

  public getParent(): FlowElement {
    return this.parent;
  }

  public getElement(): FlowElement {
    return this.element;
  }

  public get id(): string {
    return this.element.id;
  }

  public get name(): string {
    return this.element.name;
  }

  public get incoming(): FlowElement[] {
    return ((this.element) as FlowNode).incoming;
  }

  public get outgoing(): FlowElement[] {
    return ((this.element) as FlowNode).outgoing;
  }

  private makeSet(initialElements: ChoreographyElement[]): ChoreographyElement[] {
    return initialElements.reduce((elements: ChoreographyElement[], currentElement: ChoreographyElement) => {
      if (elements.find((element: ChoreographyElement) => element.id === currentElement.id) === undefined) {
        elements.push(currentElement);
      }
      return elements;
    }, []);
  }
}
