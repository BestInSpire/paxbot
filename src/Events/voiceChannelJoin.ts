'use strict';
import { EventStructure } from '../Base/Events';
import { ClientType } from '..';
import { GuildMember, MessageEmbed, VoiceChannel } from 'discord.js';
import { dataModels } from '../Structures/database';

export default (client: ClientType) =>
	new EventStructure({
		on: 'voiceChannelJoin',
		execute: async (member: GuildMember, channel: VoiceChannel) => {
			const data = await dataModels.modlog.findOne({
				guild: member.guild?.id,
			});
			if (!data || !data.isActive || !data.settings.voiceChannelJoin) return;

			const embed = new MessageEmbed()
				.setColor(`#${process.env.EMBEDCOLOR}`)
				.setAuthor({ name: 'Bir kullanıcı sesli kanala katıldı!', iconURL: `${member.displayAvatarURL()}` })
				.addField('Sesli kanala katılan kullanıcı:', `${member.user}`, true)
				.addField('Katıldığı kanal:', `${channel}`, true);

			//@ts-ignore
			client.channels?.cache.get(`${data.channel}`)?.send({
				content: null,
				embeds: [embed],
			});
		},
	});
