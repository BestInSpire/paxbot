import { CustomCommands } from '../../Base/Commands';
import { ClientType } from '../..';
import { Message, MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu } from 'discord.js';
import ms from 'ms';
import { giveawaysManager } from '../../Structures/giveaways';

export default (client: ClientType) =>
	new CustomCommands({
		props: {
			name: 'çekiliş-başlat',
			aliases: ['giveaway-start', 'çekilişbaşlat', 'giveawaystart'],
			category: 'Çekiliş',
			description: 'Yepyeni bir çekiliş başlatırsınız!',
			usage: '!çekiliş-başlat',
			enabled: true,
			owner: false,
			nsfw: false,
			permissions: { bot: ['SEND_MESSAGES'], user: ['ADMINISTRATOR'] },
			cooldown: 10000,
		},
		execute: (message: Message, args: string[]) => {
			const embedCreate = (description: string) => {
				return new MessageEmbed()
					.setDescription(description)
					.setFooter({ text: 'Bu mesajı cevaplamak için 2 dakikanız var!' })
					.setColor('#fbbd08');
			};
			const channelSelectMenu = new MessageActionRow().addComponents(
				new MessageSelectMenu()
					.setCustomId('select')
					.setPlaceholder('Bir kanal seçmelisin')
					.addOptions(
						//@ts-ignore
						message.guild.channels?.cache.map((x) => {
							return {
								label: `#${x.name}`,
								value: `${x.id}`,
							};
						}),
					),
			);
			message
				.reply({
					embeds: [embedCreate('Çekilişin yapılacağı kanalı etiketlemelisin!')],
				})
				.then(async (msg) => {
					const channelFilter = (m: Message<boolean>) =>
						m.content.includes('#') && m.author.id === message.author.id;
					const timeFilter = (m: Message<boolean>) =>
						(m.content.includes('d') ||
							m.content.includes('h') ||
							m.content.includes('m') ||
							m.content.includes('s')) &&
						m.author.id === message.author.id;
					const winnerFilter = (m: Message<boolean>) =>
						!isNaN(parseInt(m.content)) && m.author.id === message.author.id;
					const prizeFilter = (m: Message<boolean>) => m.author.id === message.author.id;

					msg.channel
						.awaitMessages({
							filter: channelFilter,
							max: 1,
							time: 2 * 60 * 1000,
							errors: ['time'],
						})
						.then(async (channelAnswer) => {
							const channel = client.channels.cache.get(
								`${channelAnswer.first()?.mentions.channels.first()?.id}`,
							);
							await channelAnswer.first()?.delete();
							msg.edit({
								embeds: [embedCreate('Çekiliş süresini girmelisin! Örn: `15m` (15 dakika)')],
							}).then(() => {
								msg.channel
									.awaitMessages({
										filter: timeFilter,
										max: 1,
										time: 2 * 60 * 1000,
										errors: ['time'],
									})
									.then(async (timeAnswer) => {
										const time = ms(`${timeAnswer.first()}`);
										await timeAnswer.first()?.delete();
										msg.edit({
											embeds: [embedCreate('Kazanan sayısı girmelisin!')],
										}).then(() => {
											msg.channel
												.awaitMessages({
													filter: winnerFilter,
													max: 1,
													time: 2 * 60 * 1000,
													errors: ['time'],
												})
												.then(async (winnerAnswer) => {
													const winner = parseInt(`${winnerAnswer.first()}`);
													await winnerAnswer.first()?.delete();
													msg.edit({
														embeds: [embedCreate('Ödülü girmelisin!')],
													}).then(() => {
														msg.channel
															.awaitMessages({
																filter: prizeFilter,
																max: 1,
																time: 2 * 60 * 1000,
																errors: ['time'],
															})
															.then(async (prizeAnswer) => {
																const prize = prizeAnswer.first();
																await prizeAnswer.first()?.delete();

																const buttonRow = new MessageActionRow().addComponents(
																	new MessageButton()
																		.setCustomId('resolve')
																		.setLabel('Başlat')
																		.setEmoji(`✅`)
																		.setStyle('SUCCESS'),
																	new MessageButton()
																		.setCustomId('İptal et')
																		.setEmoji(
																			`${client.emojis.cache.get(
																				'914758636948037672',
																			)}`,
																		)
																		.setLabel('İptal et')
																		.setStyle('DANGER'),
																);
																msg.edit({
																	content:
																		'Çekilişi başlatmak veya reddetmek için bilgileri kontrol edip uygun butona tıklayınız!',
																	components: [buttonRow],
																	embeds: [
																		new MessageEmbed()
																			.setThumbnail(
																				`${message.guild?.iconURL({
																					dynamic: true,
																					format: 'png',
																					size: 512,
																				})}`,
																			)
																			.setColor('#fbbd08')
																			.setFooter({
																				text: 'Cevaplamak için 1 dakikan var!',
																			})
																			.addField(
																				'Çekilişin Yapılacağı Kanal',
																				`${channel}`,
																			)
																			.addField(
																				'Çekiliş süresi',
																				`${timeAnswer.first()}`
																					.replace('s', ' saniye')
																					.replace('m', ' dakika')
																					.replace('h', ' saat')
																					.replace('d', ' gün'),
																			)
																			.addField('Kazanan Sayısı', `${winner}`)
																			.addField('Ödül', `${prize}`),
																	],
																}).then((lastMsg) => {
																	const collector =
																		lastMsg.createMessageComponentCollector({
																			componentType: 'BUTTON',
																			time: 60 * 1000,
																		});
																	collector.on('collect', async (i) => {
																		if (i.user.id === message.author?.id) {
																			if (i.customId == 'resolve') {
																				await msg.delete();
																				giveawaysManager.start(
																					//@ts-ignore
																					channel,
																					{
																						duration: time,
																						winnerCount: winner,
																						prize: `${prize}`,
																						hostedBy: message.author,
																						botsCanWin: false,
																						embedColor: '#fbbd08',
																						embedColorEnd: '#000',
																						reaction: '🎉',
																						thumbnail:
																							message.guild?.iconURL({
																								dynamic: true,
																								format: 'png',
																								size: 512,
																							}),
																						messages: {
																							giveaway:
																								'🎉 | Çekiliş Başladı! | 🎉',
																							giveawayEnded:
																								'Çekiliş Sona Erdi!',
																							inviteToParticipate:
																								'Çekilişe katılmak için 🎉 tepkisine tıkla!!',
																							winMessage:
																								'Tebrikler {winners}! Ödülü **{this.prize}** olan çekilişi kazandın!\n{this.messageURL}',
																							drawing:
																								'Kalan süre: {timestamp}',
																							dropMessage:
																								'🎉 tepkisine tıkla ve ilk katılan sen ol!',
																							embedFooter:
																								'{this.winnerCount} kaznan seçilecek!',
																							noWinner:
																								'Geçerli bir kazanan seçilemediği için çekiliş iptal edildi!',
																							winners: 'Kazanan(lar)',
																							endedAt: 'Sona erdi!',
																							hostedBy:
																								'Çekilişi başlatan: {this.hostedBy}',
																						},
																					},
																				);
																			} else {
																				collector.stop();
																				msg.edit({
																					content: 'İptal edildi!',
																					embeds: [],
																					components: [],
																				});
																			}
																		}
																	});
																});
															})
															.catch(() =>
																msg.edit({
																	content: 'Süre doldu veya başka bir hata oluştu!',
																	embeds: [],
																	components: [],
																}),
															);
													});
												})
												.catch(() =>
													msg.edit({
														content: 'Süre doldu veya başka bir hata oluştu!',
														embeds: [],
														components: [],
													}),
												);
										});
									})
									.catch(() =>
										msg.edit({
											content: 'Süre doldu veya başka bir hata oluştu!',
											embeds: [],
											components: [],
										}),
									);
							});
						})
						.catch(() =>
							msg.edit({
								content: 'Süre doldu veya başka bir hata oluştu!',
								embeds: [],
								components: [],
							}),
						);
				});
		},
	});
