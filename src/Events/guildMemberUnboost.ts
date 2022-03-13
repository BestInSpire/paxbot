'use strict';
import { EventStructure } from '../Base/Events';
import { ClientType } from '..';
import { GuildMember, MessageEmbed } from 'discord.js';
import { dataModels } from '../Structures/database';

export default (client: ClientType) =>
	new EventStructure({
		on: 'guildMemberUnboost',
		execute: async (member: GuildMember) => {
			const data = await dataModels.modlog.findOne({
				guild: member.guild?.id,
			});
			if (!data || !data.isActive || !data.settings.guildMemberUnboost) return;

			const embed = new MessageEmbed()
				.setColor(`#${process.env.EMBEDCOLOR}`)
				.setAuthor({ name: 'Bir üye sunucudaki boostunu çekti!', iconURL: `${member?.displayAvatarURL()}` })
				.addField('Boostlayan üye:', `${member.user}`);
			//@ts-ignore
			client.channels?.cache.get(`${data.channel}`)?.send({
				content: null,
				embeds: [embed],
			});
		},
	});
