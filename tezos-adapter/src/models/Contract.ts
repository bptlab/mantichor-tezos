export class Contract {
  private abi: object;
  private code: string;
  private fiCode: string;
  private initialState: string;
  private taskNames: string[];

  constructor(code: string, abi: object, initialState: string, taskNames: string[], fiCode?: string) {
    this.abi = abi;
    this.code = code;
    this.fiCode = fiCode;
    this.initialState = initialState;
    this.taskNames = taskNames;
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

  public getInitialState(): string {
    return this.initialState;
  }

  public getTaskNames(): string[] {
    return this.taskNames;
  }
}
