import { CustomCommands } from '../../Base/Commands';
import { ClientType } from '../..';
import { ButtonInteraction, CacheType, Message, MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import { dataModels } from '../../Structures/database';

interface warnDataType {
	date: number;
	timeStamp: number;
	moderator: string;
	reason: string;
}

export default (client: ClientType) =>
	new CustomCommands({
		props: {
			name: 'tüm-uyarılar',
			aliases: ['tümuyarılar', 'all-warns', 'allwarns'],
			category: 'Moderasyon',
			description: 'Sunucu içerisinde yapılmış tüm uyarıları listeler',
			usage: '!tüm-uyarılar',
			enabled: true,
			owner: false,
			nsfw: false,
			permissions: { bot: ['SEND_MESSAGES'], user: ['SEND_MESSAGES'] },
			cooldown: 5000,
		},
		execute: async (message: Message, args: string[]) => {
			const user = message.mentions.users.first() || message.guild?.members.cache.get(args[0]) || message.author;
			const warnsData = await dataModels.allWarns.findOne({
				user: user.id,
			});
			if (warnsData) {
				let pageCount: number;
				Math.ceil(warnsData.warns.length / 5) == 0
					? (pageCount = 1)
					: (pageCount = Math.ceil(warnsData.warns.length / 5));
				let currentPage = 0;

				const warnlist = warnsData.warns.slice(currentPage * 5, currentPage * 5 + 5);
				const currentEmbed = new MessageEmbed()
					.setColor(`#${process.env.EMBEDCOLOR}`)
					.setAuthor({ name: `${client.users.cache.get(user.id)?.username} Uyarı Listesi!` })
					.setDescription(
						`${warnlist
							.map(
								(x: warnDataType, i: number) =>
									`**\`${
										currentPage * 5 + i + 1
									}.\` Uyarı**\nUyaran Yetkili: ${client.users.cache.get(
										x.moderator,
									)}\nUyarı Tarihi: ${x.date}\nUyarı Sebebi: ${x.reason}\nUyarı Süresi: ${
										x.timeStamp
									}`,
							)
							.join('\n\n')}`,
					)
					.setFooter({ text: `Sayfa: ${currentPage + 1} / ${pageCount}` })
					.setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512, format: 'png' }))
					.setTimestamp();

				const row = new MessageActionRow().addComponents(
					new MessageButton().setCustomId('left').setEmoji('⬅️').setStyle('SECONDARY'),
					new MessageButton().setCustomId('right').setEmoji('➡️').setStyle('SECONDARY'),
				);

				message
					.reply({
						embeds: [currentEmbed],
						components: [row],
					})
					.then(async (msg) => {
						const filter = (i: ButtonInteraction<CacheType>) => i.user.id == message.author.id;
						const collector = msg.createMessageComponentCollector({
							filter,
							componentType: 'BUTTON',
							time: 3 * 60 * 500,
						});

						collector.on('collect', (i) => {
							if (i.customId == 'left') {
								if (currentPage + 1 < pageCount) {
									currentPage = currentPage + 1;
								} else {
									currentPage = 0;
								}
								const editedEmbed = new MessageEmbed()
									.setColor(`#${process.env.EMBEDCOLOR}`)
									.setAuthor({ name: `${client.users.cache.get(user.id)?.username} Uyarı Listesi!` })
									.setDescription(
										`${warnsData.warns
											.slice(currentPage * 5, currentPage * 5 + 5)
											.map(
												(x: warnDataType, i: number) =>
													`**\`${
														currentPage * 5 + i + 1
													}.\` Uyarı**\nUyaran Yetkili: ${client.users.cache.get(
														x.moderator,
													)}\nUyarı Tarihi: ${x.date}\nUyarı Sebebi: ${
														x.reason
													}\nUyarı Süresi: ${x.timeStamp}`,
											)
											.join('\n\n')}`,
									)
									.setFooter({ text: `Sayfa: ${currentPage + 1} / ${pageCount}` })
									.setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512, format: 'png' }))
									.setTimestamp();
								msg.edit({
									embeds: [editedEmbed],
								});
							} else if (i.customId == 'right') {
								if (currentPage + 1 <= 1) {
									currentPage = pageCount - 1;
								} else {
									currentPage = currentPage + -1;
								}
								const editedEmbed = new MessageEmbed()
									.setColor(`#${process.env.EMBEDCOLOR}`)
									.setAuthor({ name: `${client.users.cache.get(user.id)?.username} Uyarı Listesi!` })
									.setDescription(
										`${warnsData.warns
											.slice(currentPage * 5, currentPage * 5 + 5)
											.map(
												(x: warnDataType, i: number) =>
													`**\`${
														currentPage * 5 + i + 1
													}.\` Uyarı**\nUyaran Yetkili: ${client.users.cache.get(
														x.moderator,
													)}\nUyarı Tarihi: ${x.date}\nUyarı Sebebi: ${
														x.reason
													}\nUyarı Süresi: ${x.timeStamp}`,
											)
											.join('\n\n')}`,
									)
									.setFooter({ text: `Sayfa: ${currentPage + 1} / ${pageCount}` })
									.setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512, format: 'png' }))
									.setTimestamp();
								msg.edit({
									embeds: [editedEmbed],
								});
							}
						});
					});
			} else
				return message.reply({
					content: `**${user}** adlı kullanıcının geçmişte herhangi bir uyarısı bulunamadı! Aktif uyarılarına \`!uyarılar\` komutuyla ulaşabilirsin!`,
				});
		},
	});
