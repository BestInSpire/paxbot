'use strict';
import { EventStructure } from '../Base/Events';
import { ClientType } from '..';
import { Message } from 'discord.js';
import { dataModels } from '../Structures/database';
const linkReg: RegExp =
	/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

export default (client: ClientType) =>
	new EventStructure({
		on: 'messageCreate',
		execute: async (message: Message) => {
			if (message.author.bot) return;
			if (message.member?.permissions.has('MANAGE_MESSAGES') || message.member?.permissions.has('ADMINISTRATOR'))
				return;

			const linkData = await dataModels.automode.findOne({
				guild: message.guild?.id,
			});
			if (linkData ? linkData.link : false) {
				const check = isInviteURL(message.content);
				if (check) {
					message.delete();
					message.channel
						.send({
							content: `${message.author}, All Links!`,
						})
						.then((msg) =>
							setTimeout(() => {
								msg.delete();
							}, 2000),
						);
				}
			}
		},
	});

const isInviteURL = (text: string) => {
	if (text.match(linkReg)) return true;
	else false;
};
