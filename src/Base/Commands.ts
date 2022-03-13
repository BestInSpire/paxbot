import { SlashCommandBuilder } from '@discordjs/builders';
import { BaseCommandInteraction, Message } from 'discord.js';

export interface CustomCommands {
	props: {
		name: string;
		aliases: string[];
		category: string;
		description: string;
		usage: string;
		enabled: boolean;
		owner: boolean;
		nsfw: boolean;
		permissions: { bot: string[]; user: string[] };
		cooldown: number;
	};
	execute: (
		message: Message<boolean>,
		args: string[],
	) => void | Promise<void | Message<boolean> | undefined> | undefined;
}
export interface SlashCommandsType {
	props: Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;
	execute: (interaction: BaseCommandInteraction) => Promise<void>;
	data: {
		permissions: { bot: string[]; member: string[] };
		userType: string;
		enabled: boolean;
		cooldown: number;
		nsfwChannel: boolean;
	};
}
export class CustomCommands implements CustomCommands {
	constructor(args: { props: CustomCommands['props']; execute: CustomCommands['execute'] }) {
		this.props = args.props;
		this.execute = args.execute;
	}
}
export class SlashCommands implements SlashCommandsType {
	constructor(args: {
		props: SlashCommandsType['props'];
		execute: SlashCommandsType['execute'];
		data: SlashCommandsType['data'];
	}) {
		this.props = args.props;
		this.execute = args.execute;
		this.data = args.data;
	}
	props: SlashCommandsType['props'];
	execute: SlashCommandsType['execute'];
	data: {
		permissions: { bot: string[]; member: string[] };
		userType: string;
		enabled: boolean;
		cooldown: number;
		nsfwChannel: boolean;
	};
}
