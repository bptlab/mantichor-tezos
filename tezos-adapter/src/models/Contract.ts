export class Contract {
  private abi: object;
  private code: string;
  private fiCode: string;

  constructor(code: string, abi: object, fiCode?: string) {
    this.abi = abi;
    this.code = code;
    this.fiCode = fiCode;
  }

  public getAbi(): object {
    return this.abi;
  }

  public getCode(): string {
    return this.code;
  }

  public getFiCode(): string {
    return this.fiCode;
  }
}
