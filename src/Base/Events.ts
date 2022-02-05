interface Events {
  on: string;
  execute: any;
}
export class EventStructure implements Events {
  public on: string;
  public execute: any;
  constructor({
    on = "",
    //@ts-ignore
    execute,
  }) {
    this.on = on;
    this.execute = execute;
  }
}
