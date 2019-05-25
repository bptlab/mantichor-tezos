export class Contract {
  private abi: object;
  private code: string;

  constructor(code: string, abi: object) {
    this.abi = abi;
    this.code = code;
  }

  public getAbi(): object {
    return this.abi;
  }

  public getCode(): string {
    return this.code;
  }
}
