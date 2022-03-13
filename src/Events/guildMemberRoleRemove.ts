'use strict';
import { EventStructure } from '../Base/Events';
import { ClientType } from '..';
import { GuildMember, MessageEmbed, Role } from 'discord.js';
import { dataModels } from '../Structures/database';

export default (client: ClientType) =>
	new EventStructure({
		on: 'guildMemberRoleRemove',
		execute: async (member: GuildMember, role: Role) => {
			const data = await dataModels.modlog.findOne({
				guild: member.guild?.id,
			});
			if (!data || !data.isActive || !data.settings.guildMemberRoleRemove) return;

			const embed = new MessageEmbed()
				.setColor(`#${process.env.EMBEDCOLOR}`)
				.setAuthor({ name: 'Bir üyenin rolü alındı!', iconURL: `${member?.displayAvatarURL()}` })
				.addField('Rolleri güncellenen üye:', `${member.user}`, true)
				.addField('Alınan Rol', `${role}`, true);
			//@ts-ignore
			client.channels?.cache.get(`${data.channel}`)?.send({
				content: null,
				embeds: [embed],
			});
		},
	});
