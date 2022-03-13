import { CustomCommands } from '../../Base/Commands';
import { ClientType } from '../..';
import { Message, MessageEmbed } from 'discord.js';

export default (client: ClientType) =>
	new CustomCommands({
		props: {
			name: 'ping',
			aliases: ['delay'],
			category: 'Genel',
			description: 'Botun anlık api gecikmesini gösterir!',
			usage: '!ping',
			enabled: true,
			owner: false,
			nsfw: false,
			permissions: { bot: ['SEND_MESSAGES'], user: ['SEND_MESSAGES'] },
			cooldown: 10000,
		},
		execute: (message: Message) => {
			message.reply({
				embeds: [
					new MessageEmbed()
						.setColor(`#${process.env.EMBEDCOLOR}`)
						.setDescription(
							`Api Gecikmesi: **${client.ws.ping}ms**\nMesaj Gecikmesi: **${
								Date.now() - message.createdTimestamp
							}ms**`,
						)
						.setTimestamp(),
				],
			});
		},
	});
