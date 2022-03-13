'use strict';
import { EventStructure } from '../Base/Events';
import { ClientType } from '..';
import { Message } from 'discord.js';
import { dataModels } from '../Structures/database';
const discordReg: RegExp = /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/.+[a-z]/g;

export default (client: ClientType) =>
	new EventStructure({
		on: 'messageCreate',
		execute: async (message: Message) => {
			if (message.author.bot) return;
			if (message.member?.permissions.has('MANAGE_MESSAGES') || message.member?.permissions.has('ADMINISTRATOR'))
				return;

			const discordInvitesData = await dataModels.automode.findOne({
				guild: message.guild?.id,
			});
			if (discordInvitesData ? discordInvitesData.discordInvites : false) {
				const check = isInviteURL(message.content);
				if (check) {
					message.delete();
					message.channel
						.send({
							content: `${message.author}, Discord Invites!`,
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
	if (text.match(discordReg)) return true;
	else false;
};
