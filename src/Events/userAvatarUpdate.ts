'use strict';
import { EventStructure } from '../Base/Events';
import { ClientType } from '..';
import { MessageEmbed, User } from 'discord.js';
import { dataModels } from '../Structures/database';

export default (client: ClientType) =>
	new EventStructure({
		on: 'userAvatarUpdate',
		execute: async (user: User, oldAvatarURL: string, newAvatarURL: string) => {
			const data = await dataModels.modlog.findOne({
				guild: '720690676978810992',
			});
			if (!data || !data.isActive || !data.settings.userAvatarUpdate) return;

			const embed = new MessageEmbed()
				.setColor(`#${process.env.EMBEDCOLOR}`)
				.setAuthor({ name: 'Bir üye avatarını güncelledi!', iconURL: `${user?.displayAvatarURL()}` })
				.setDescription(`[Eski Avatarı](${oldAvatarURL}) => [Yeni Avatarı](${newAvatarURL})`);
			//@ts-ignore
			client.channels?.cache.get(`${data.channel}`)?.send({
				content: null,
				embeds: [embed],
			});
		},
	});
