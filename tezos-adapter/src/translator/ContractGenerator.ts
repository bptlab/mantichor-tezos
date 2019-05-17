import { StructuredChoreography } from './../models/StructuredChoreography';
export class ContractGenerator {

  private choreographies: StructuredChoreography[];

  constructor(choreographies: StructuredChoreography[]) {
    this.choreographies = choreographies;
  }

  public generateLiquidityCode(): string[] {
    const liquiditySources: string[] = this.choreographies.map((choreography: StructuredChoreography) =>  {
      const liquiditySource = '';

      // generate storage

      // generate body

      // TODO Generate Liquidity Code

      return liquiditySource;
    });
    return liquiditySources;
  }
}

export default ContractGenerator;
