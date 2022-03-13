'use strict';
import {
	Client,
	Collection,
	Intents,
	WebSocketManager,
	ChannelManager,
	UserManager,
	ClientUser,
	ClientApplication,
	BaseGuildEmojiManager,
	ClientOptions,
	ShardClientUtil,
	ClientVoiceManager,
	GuildManager,
} from 'discord.js';

import { CustomCommands, SlashCommands } from './Base/Commands';
import { readdirSync, readdir } from 'fs';
import logs from 'discord-logs';
import database from './Structures/database';
import dotenv from 'dotenv';
dotenv.config();
export interface ClientType {
	channels: ChannelManager;
	application: ClientApplication;
	users: UserManager;
	user: ClientUser;
	ws: WebSocketManager;
	client: Client<boolean>;
	emojis: BaseGuildEmojiManager;
	guilds: GuildManager;
	options: ClientOptions;
	readyAt: Date;
	readyTimestamp: number;
	shard: ShardClientUtil;
	token: string;
	uptime: number;
	voice: ClientVoiceManager;
}
export const commands: Collection<unknown, CustomCommands> = new Collection();
export const slashCommands: Collection<unknown, SlashCommands> = new Collection();
export const slashData: string[] = [];
export const client: ClientType['client'] = new Client({
	intents: [
		Intents.FLAGS.GUILD_INTEGRATIONS,
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.DIRECT_MESSAGES,
		Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
		Intents.FLAGS.GUILD_BANS,
		Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
		Intents.FLAGS.GUILD_INVITES,
		Intents.FLAGS.GUILD_MESSAGE_TYPING,
		Intents.FLAGS.GUILD_PRESENCES,
		Intents.FLAGS.GUILD_VOICE_STATES,
		Intents.FLAGS.GUILD_WEBHOOKS,
	],
	allowedMentions: {
		users: [],
		roles: [],
		parse: ['everyone'],
		repliedUser: true,
	},
});
logs(client);
export const developers: string[] = JSON.parse(`${process.env.DEVELOPERS}`);
database();
readdir(__dirname + '/CustomCommands/', async (err: NodeJS.ErrnoException | null, allFiles: string[]) => {
	if (err) return console.log(err);
	else
		for (let file of allFiles) {
			const props: string[] = readdirSync(`${__dirname}/CustomCommands/${file}`);
			for (let i of props) {
				const Load = await import(`${__dirname}/CustomCommands/${file}/${i}`);
				const Command = await Load.default(client);
				commands.set(Command.props.name, Command);
			}
		}
});
readdir(__dirname + '/SlashCommands/', async (err: NodeJS.ErrnoException | null, allFiles: string[]) => {
	if (err) return console.log(err);
	else
		for (let file of allFiles) {
			const props: string[] = readdirSync(`${__dirname}/SlashCommands/${file}`);
			for (let i of props) {
				const Load = await import(`${__dirname}/SlashCommands/${file}/${i}`);
				const Command = await Load.default(client);
				slashData.push(Command.props);
				slashCommands.set(Command.props.name, Command);
			}
		}
});
readdir(__dirname + '/Events', async (error: NodeJS.ErrnoException | null, allFiles: string[]) => {
	if (error) return console.error(error);
	else {
		for (let eventFile of allFiles) {
			const Load = await import(`${__dirname}/Events/${eventFile.split('.ts')[0]}`);
			const event = await Load.default(client);
			client.on(event.on, (...args: string[]) => event.execute(...args));
		}
	}
});
readdir(__dirname + '/Constants', async (error: NodeJS.ErrnoException | null, allFiles: string[]) => {
	if (error) return console.error(error);
	else {
		for (let eventFile of allFiles) {
			const Load = await import(`${__dirname}/Constants/${eventFile.split('.ts')[0]}`);
			const event = await Load.default(client);
			client.on(event.on, (...args: string[]) => event.execute(...args));
		}
	}
});
client.login(process.env.TOKEN);
