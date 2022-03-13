'use strict';
import { EventStructure } from '../Base/Events';
import { ClientType } from '..';
import { GuildMember, MessageEmbed } from 'discord.js';
import { dataModels } from '../Structures/database';

export default (client: ClientType) =>
	new EventStructure({
		on: 'guildMemberNicknameUpdate',
		execute: async (member: GuildMember, oldNickname: string, newNickname: string) => {
			const data = await dataModels.modlog.findOne({
				guild: member.guild?.id,
			});
			if (!data || !data.isActive || !data.settings.guildMemberNicknameUpdate) return;

			const embed = new MessageEmbed()
				.setColor(`#${process.env.EMBEDCOLOR}`)
				.setAuthor({
					name: 'Bir kullanıcının sunucudaki adı değiştirildi!',
					iconURL: `${member?.displayAvatarURL()}`,
				})
				.addField('Eski adı:', oldNickname, true)
				.addField('Yeni adı:', newNickname, true);
			//@ts-ignore
			client.channels?.cache.get(`${data.channel}`)?.send({
				content: null,
				embeds: [embed],
			});
		},
	});
