import { StructuredChoreography } from './../models/StructuredChoreography';
export class ContractGenerator {

  private choreographies: StructuredChoreography[];

  constructor(choreographies: StructuredChoreography[]) {
    this.choreographies = choreographies;
  }

  public generateLiquidityCode(): string[] {
    return [''];
  }
}

export default ContractGenerator;
