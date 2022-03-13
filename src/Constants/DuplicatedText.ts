'use strict';
import { EventStructure } from '../Base/Events';
import { ClientType } from '..';
import { Message, Collection } from 'discord.js';
import { dataModels } from '../Structures/database';
const savedMessages = new Collection();

export default (client: ClientType) =>
	new EventStructure({
		on: 'messageCreate',
		execute: async (message: Message) => {
			if (message.author.bot) return;
			if (message.member?.permissions.has('MANAGE_MESSAGES') || message.member?.permissions.has('ADMINISTRATOR'))
				return;

			const duplicatedTextData = await dataModels.automode.findOne({
				guild: message.guild?.id,
			});
			if (duplicatedTextData ? duplicatedTextData.duplicatedText : false) {
				const userID: string = message.author?.id;
				if (savedMessages.get(`${userID}_${message.content}`)) {
					message.delete();
					message.channel.send(`${message.author}, duplicated text!`).then((msg) =>
						setTimeout(() => {
							msg.delete();
						}, 2000),
					);
				} else {
					savedMessages.set(`${userID}_${message.content}`, message.content);
					setTimeout(() => {
						savedMessages.delete(`${userID}_${message.content}`);
					}, 15000);
				}
			}
		},
	});
