'use strict';
import { EventStructure } from '../Base/Events';
import { ClientType } from '..';
import { GuildChannel, MessageEmbed } from 'discord.js';
import { dataModels } from '../Structures/database';

export default (client: ClientType) =>
	new EventStructure({
		on: 'channelDelete',
		execute: async (channel: GuildChannel) => {
			const data = await dataModels.modlog.findOne({
				guild: channel.guild?.id,
			});
			if (!data || !data.isActive || !data.settings.channelDelete) return;

			const embed = new MessageEmbed()
				.setColor(`#${process.env.EMBEDCOLOR}`)
				.setAuthor({ name: 'Bir kanal silindi!' })
				.addField('Silinen kanal adı:', channel.name)
				.addField("Silinen kanal ID'si", channel.id);

			//@ts-ignore
			client.channels?.cache.get(`${data.channel}`)?.send({
				content: null,
				embeds: [embed],
			});
		},
	});
