import { CustomCommands } from '../../Base/Commands';
import { ClientType } from '../..';
import {
	ButtonInteraction,
	CacheType,
	CollectorFilter,
	Message,
	MessageActionRow,
	MessageButton,
	MessageEmbed,
	MessageSelectMenu,
	SelectMenuInteraction,
} from 'discord.js';
import { dataModels } from '../../Structures/database';

export default (client: ClientType) =>
	new CustomCommands({
		props: {
			name: 'oto-mod',
			aliases: ['automoderation', 'auto-moderation', 'otomod'],
			category: 'Ayarlar',
			description: 'Otomatik moderasyon özellikleri.',
			usage: '!oto-mod',
			enabled: true,
			owner: false,
			nsfw: false,
			permissions: { bot: ['SEND_MESSAGES'], user: ['ADMINISTRATOR'] },
			cooldown: 10000,
		},
		execute: async (message: Message, args: string[]) => {
			const data = await dataModels.automode.findOne({
				guild: message.guild?.id,
			});
			const selectMenu = new MessageActionRow().addComponents(
				new MessageSelectMenu()
					.setCustomId('select')
					.setPlaceholder('Seçim yapılmadı!')
					.addOptions([
						{
							label: 'Duplicated Text',
							description: 'Duplicated Text Description',
							value: 'duplicated-text',
						},
						{
							label: 'Discord Invites',
							description: 'Discord Invites Description',
							value: 'discord-invites',
						},
						{
							label: 'All Links',
							description: 'All Links Description',
							value: 'all-links',
						},
						{
							label: 'All Caps',
							description: 'All Caps Description',
							value: 'all-caps',
						},
						{
							label: 'Fast Message Spam',
							description: 'Fast Message Spam Description',
							value: 'message-spam',
						},
						{
							label: 'Spoilers',
							description: 'Spoilers Description',
							value: 'spoilers',
						},
						{
							label: 'Stickers',
							description: 'Stickers Description',
							value: 'stickers',
						},
					]),
			);
			message
				.reply({
					content: 'Listeden düzenlemek istediğin ayarı seç!',
					components: [selectMenu],
					embeds: [],
				})
				.then((msg) => {
					const selectMenufilter = (i: SelectMenuInteraction<CacheType>) => i.user.id == message.author.id;
					const buttonFilter = (i: ButtonInteraction<CacheType>) => i.user.id == message.author.id;
					const collector = msg.createMessageComponentCollector({
						filter: selectMenufilter,
						componentType: 'SELECT_MENU',
						time: 2 * 60 * 1000,
					});

					collector.on('collect', (i: SelectMenuInteraction<CacheType>) => {
						if (i.values[0] == 'duplicated-text') {
							const status = data ? (data.duplicatedText ? 'Açık' : 'Kapalı') : 'Kapalı';
							const buttonRow = new MessageActionRow().addComponents(
								new MessageButton()
									.setCustomId(status == 'Kapalı' ? 'open' : 'close')
									.setLabel(status == 'Kapalı' ? 'Aç' : 'Kapat')
									.setStyle(status == 'Kapalı' ? 'SUCCESS' : 'DANGER'),
							);
							msg.edit({
								content: `Duplicated Text şuanda: **${status}**`,
								components: [buttonRow],
								embeds: [],
							}).then((m) => {
								const buttonCollector = m.createMessageComponentCollector({
									filter: buttonFilter,
									componentType: 'BUTTON',
									time: 2 * 60 * 1000,
								});
								buttonCollector.on('collect', (buttonData) => {
									if (buttonData.customId == 'open') {
										if (data) {
											data.duplicatedText = true;
											data.save().then(() => {
												msg.edit({
													content: `Duplicated Text başarıyla açıldı!`,
													components: [],
													embeds: [],
												});
											});
										} else
											new dataModels.automode({
												duplicatedText: true,
												guild: message.guild?.id,
											})
												.save()
												.then(() => {
													msg.edit({
														content: `Duplicated Text başarıyla açıldı!`,
														components: [],
														embeds: [],
													});
												});
									} else if (buttonData.customId == 'close') {
										if (data) {
											data.duplicatedText = false;
											data.save().then(() => {
												msg.edit({
													content: `Duplicated Text başarıyla kapatıldı!`,
													components: [],
													embeds: [],
												});
											});
										}
									} else return;
								});
							});
						}

						if (i.values[0] == 'discord-invites') {
							const status = data ? (data.discordInvites ? 'Açık' : 'Kapalı') : 'Kapalı';
							const buttonRow = new MessageActionRow().addComponents(
								new MessageButton()
									.setCustomId(status == 'Kapalı' ? 'open' : 'close')
									.setLabel(status == 'Kapalı' ? 'Aç' : 'Kapat')
									.setStyle(status == 'Kapalı' ? 'SUCCESS' : 'DANGER'),
							);
							msg.edit({
								content: `Discord Invites şuanda: **${status}**`,
								components: [buttonRow],
								embeds: [],
							}).then((m) => {
								const buttonCollector = m.createMessageComponentCollector({
									filter: buttonFilter,
									componentType: 'BUTTON',
									time: 2 * 60 * 1000,
								});
								buttonCollector.on('collect', (buttonData) => {
									if (buttonData.customId == 'open') {
										if (data) {
											data.discordInvites = true;
											data.save().then(() => {
												msg.edit({
													content: `Discord Invites başarıyla açıldı!`,
													components: [],
													embeds: [],
												});
											});
										} else
											new dataModels.automode({
												discordInvites: true,
												guild: message.guild?.id,
											})
												.save()
												.then(() => {
													msg.edit({
														content: `Discord Invites başarıyla açıldı!`,
														components: [],
														embeds: [],
													});
												});
									} else if (buttonData.customId == 'close') {
										if (data) {
											data.discordInvites = false;
											data.save().then(() => {
												msg.edit({
													content: `Discord Invites başarıyla kapatıldı!`,
													components: [],
													embeds: [],
												});
											});
										}
									} else return;
								});
							});
						}

						if (i.values[0] == 'all-links') {
							const status = data ? (data.link ? 'Açık' : 'Kapalı') : 'Kapalı';
							const buttonRow = new MessageActionRow().addComponents(
								new MessageButton()
									.setCustomId(status == 'Kapalı' ? 'open' : 'close')
									.setLabel(status == 'Kapalı' ? 'Aç' : 'Kapat')
									.setStyle(status == 'Kapalı' ? 'SUCCESS' : 'DANGER'),
							);
							msg.edit({
								content: `All Links şuanda: **${status}**`,
								components: [buttonRow],
								embeds: [],
							}).then((m) => {
								const buttonCollector = m.createMessageComponentCollector({
									filter: buttonFilter,
									componentType: 'BUTTON',
									time: 2 * 60 * 1000,
								});
								buttonCollector.on('collect', (buttonData) => {
									if (buttonData.customId == 'open') {
										if (data) {
											data.link = true;
											data.save().then(() => {
												msg.edit({
													content: `All Links başarıyla açıldı!`,
													components: [],
													embeds: [],
												});
											});
										} else
											new dataModels.automode({
												link: true,
												guild: message.guild?.id,
											})
												.save()
												.then(() => {
													msg.edit({
														content: `All Links başarıyla açıldı!`,
														components: [],
														embeds: [],
													});
												});
									} else if (buttonData.customId == 'close') {
										if (data) {
											data.link = false;
											data.save().then(() => {
												msg.edit({
													content: `All Links başarıyla kapatıldı!`,
													components: [],
													embeds: [],
												});
											});
										}
									} else return;
								});
							});
						}

						if (i.values[0] == 'all-caps') {
							const status = data ? (data.caps ? 'Açık' : 'Kapalı') : 'Kapalı';
							const buttonRow = new MessageActionRow().addComponents(
								new MessageButton()
									.setCustomId(status == 'Kapalı' ? 'open' : 'close')
									.setLabel(status == 'Kapalı' ? 'Aç' : 'Kapat')
									.setStyle(status == 'Kapalı' ? 'SUCCESS' : 'DANGER'),
							);
							msg.edit({
								content: `All Caps şuanda: **${status}**`,
								components: [buttonRow],
								embeds: [],
							}).then((m) => {
								const buttonCollector = m.createMessageComponentCollector({
									filter: buttonFilter,
									componentType: 'BUTTON',
									time: 2 * 60 * 1000,
								});
								buttonCollector.on('collect', (buttonData) => {
									if (buttonData.customId == 'open') {
										if (data) {
											data.caps = true;
											data.save().then(() => {
												msg.edit({
													content: `All Caps başarıyla açıldı!`,
													components: [],
													embeds: [],
												});
											});
										} else
											new dataModels.automode({
												caps: true,
												guild: message.guild?.id,
											})
												.save()
												.then(() => {
													msg.edit({
														content: `All Links başarıyla açıldı!`,
														components: [],
														embeds: [],
													});
												});
									} else if (buttonData.customId == 'close') {
										if (data) {
											data.caps = false;
											data.save().then(() => {
												msg.edit({
													content: `All Links başarıyla kapatıldı!`,
													components: [],
													embeds: [],
												});
											});
										}
									} else return;
								});
							});
						}

						if (i.values[0] == 'message-spam') {
							const status = data ? (data.messageSpam ? 'Açık' : 'Kapalı') : 'Kapalı';
							const buttonRow = new MessageActionRow().addComponents(
								new MessageButton()
									.setCustomId(status == 'Kapalı' ? 'open' : 'close')
									.setLabel(status == 'Kapalı' ? 'Aç' : 'Kapat')
									.setStyle(status == 'Kapalı' ? 'SUCCESS' : 'DANGER'),
							);
							msg.edit({
								content: `Fast Message Spam şuanda: **${status}**`,
								components: [buttonRow],
								embeds: [],
							}).then((m) => {
								const buttonCollector = m.createMessageComponentCollector({
									filter: buttonFilter,
									componentType: 'BUTTON',
									time: 2 * 60 * 1000,
								});
								buttonCollector.on('collect', (buttonData) => {
									if (buttonData.customId == 'open') {
										if (data) {
											data.messageSpam = true;
											data.save().then(() => {
												msg.edit({
													content: `Fast Message Spam başarıyla açıldı!`,
													components: [],
													embeds: [],
												});
											});
										} else
											new dataModels.automode({
												messageSpam: true,
												guild: message.guild?.id,
											})
												.save()
												.then(() => {
													msg.edit({
														content: `Fast Message Spam başarıyla açıldı!`,
														components: [],
														embeds: [],
													});
												});
									} else if (buttonData.customId == 'close') {
										if (data) {
											data.messageSpam = false;
											data.save().then(() => {
												msg.edit({
													content: `Fast Message Spam başarıyla kapatıldı!`,
													components: [],
													embeds: [],
												});
											});
										}
									} else return;
								});
							});
						}

						if (i.values[0] == 'spoilers') {
							const status = data ? (data.spoilers ? 'Açık' : 'Kapalı') : 'Kapalı';
							const buttonRow = new MessageActionRow().addComponents(
								new MessageButton()
									.setCustomId(status == 'Kapalı' ? 'open' : 'close')
									.setLabel(status == 'Kapalı' ? 'Aç' : 'Kapat')
									.setStyle(status == 'Kapalı' ? 'SUCCESS' : 'DANGER'),
							);
							msg.edit({
								content: `Spoilers şuanda: **${status}**`,
								components: [buttonRow],
								embeds: [],
							}).then((m) => {
								const buttonCollector = m.createMessageComponentCollector({
									filter: buttonFilter,
									componentType: 'BUTTON',
									time: 2 * 60 * 1000,
								});
								buttonCollector.on('collect', (buttonData) => {
									if (buttonData.customId == 'open') {
										if (data) {
											data.spoilers = true;
											data.save().then(() => {
												msg.edit({
													content: `Spoilers başarıyla açıldı!`,
													components: [],
													embeds: [],
												});
											});
										} else
											new dataModels.automode({
												spoilers: true,
												guild: message.guild?.id,
											})
												.save()
												.then(() => {
													msg.edit({
														content: `Spoilers başarıyla açıldı!`,
														components: [],
														embeds: [],
													});
												});
									} else if (buttonData.customId == 'close') {
										if (data) {
											data.spoilers = false;
											data.save().then(() => {
												msg.edit({
													content: `Spoilers başarıyla kapatıldı!`,
													components: [],
													embeds: [],
												});
											});
										}
									} else return;
								});
							});
						}

						if (i.values[0] == 'stickers') {
							const status = data ? (data.stickers ? 'Açık' : 'Kapalı') : 'Kapalı';
							const buttonRow = new MessageActionRow().addComponents(
								new MessageButton()
									.setCustomId(status == 'Kapalı' ? 'open' : 'close')
									.setLabel(status == 'Kapalı' ? 'Aç' : 'Kapat')
									.setStyle(status == 'Kapalı' ? 'SUCCESS' : 'DANGER'),
							);
							msg.edit({
								content: `Stickers şuanda: **${status}**`,
								components: [buttonRow],
								embeds: [],
							}).then((m) => {
								const buttonCollector = m.createMessageComponentCollector({
									filter: buttonFilter,
									componentType: 'BUTTON',
									time: 2 * 60 * 1000,
								});
								buttonCollector.on('collect', (buttonData) => {
									if (buttonData.customId == 'open') {
										if (data) {
											data.stickers = true;
											data.save().then(() => {
												msg.edit({
													content: `Stickers başarıyla açıldı!`,
													components: [],
													embeds: [],
												});
											});
										} else
											new dataModels.automode({
												stickers: true,
												guild: message.guild?.id,
											})
												.save()
												.then(() => {
													msg.edit({
														content: `Stickers başarıyla açıldı!`,
														components: [],
														embeds: [],
													});
												});
									} else if (buttonData.customId == 'close') {
										if (data) {
											data.stickers = false;
											data.save().then(() => {
												msg.edit({
													content: `Stickers başarıyla kapatıldı!`,
													components: [],
													embeds: [],
												});
											});
										}
									} else return;
								});
							});
						}
					});
				});
		},
	});
