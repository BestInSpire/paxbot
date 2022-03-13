interface Events {
	on: string;
	execute: (arg0: { t: string }) => void;
}
export class EventStructure implements Events {
	public on;
	public execute;
	constructor({
		on = '',
		//@ts-ignore
		execute,
	}) {
		this.on = on;
		this.execute = execute;
	}
}
