import { CustomCommands } from '../../Base/Commands';
import { ClientType } from '../..';
import {
	ButtonInteraction,
	CacheType,
	Message,
	MessageActionRow,
	MessageButton,
	MessageEmbed,
	MessageSelectMenu,
	SelectMenuInteraction,
} from 'discord.js';
import { giveawaysManager } from '../../Structures/giveaways';
import humanizeDuration from 'humanize-duration';
import ms from 'ms';

export default (client: ClientType) =>
	new CustomCommands({
		props: {
			name: 'çekiliş-düzenle',
			aliases: ['giveaway-edit', 'çekilişliste', 'giveawayedit'],
			category: 'Çekiliş',
			description: 'Sunucuda devam eden bir çekilişi düzenlersiniz!',
			usage: '!çekiliş-liste',
			enabled: true,
			owner: false,
			nsfw: false,
			permissions: { bot: ['SEND_MESSAGES'], user: ['ADMINISTRATOR'] },
			cooldown: 10000,
		},
		execute: (message: Message, args: string[]) => {
			const giveaways1 = giveawaysManager.giveaways.filter((g) => g.guildId === message.guild?.id);
			const giveaways2 = giveaways1.filter((g) => !g.ended);
			if (giveaways2.length < 1)
				return message.reply({
					content: 'Devam eden aktif bir çekiliş bulunamadı!',
				});
			const selectMenu = new MessageActionRow().addComponents(
				new MessageSelectMenu()
					.setCustomId('select')
					.setPlaceholder('Nothing selected')
					.addOptions(
						//@ts-ignore
						giveaways2?.map((x) => {
							return {
								label: `Ödül: ${x.prize}`,
								description: `Kazanan sayısı: ${x.winnerCount} | Kalan süresi: ${humanizeDuration(
									x.remainingTime,
									{ language: 'tr', round: true },
								)}`,
								value: x.messageId,
							};
						}),
					),
			);
			message
				.reply({
					content: 'Düzenlemek istediğin çekilişi listeden seç!',
					components: [selectMenu],
				})
				.then((msg) => {
					const filter = (i: SelectMenuInteraction<CacheType>) => i.user.id == message.author.id;
					const collector = msg.createMessageComponentCollector({
						filter,
						componentType: 'SELECT_MENU',
						time: 2 * 60 * 1000,
					});

					collector.on('collect', (i) => {
						const selectedGiveaway = giveawaysManager.giveaways.find((g) => g.messageId === i.values[0]);

						const embed = new MessageEmbed()
							.addField(
								'Çekilişin Süresi:',
								humanizeDuration(
									//@ts-ignore
									selectedGiveaway?.remainingTime,
									{ language: 'tr', round: false },
								),
							)
							.addField('Çekilişin Ödülü:', `${selectedGiveaway?.prize}`)
							.addField('Çekilişin Kazanan Sayısı:', `${selectedGiveaway?.winnerCount}`)
							.setColor(`#${process.env.EMBEDCOLOR}`);

						const buttons = new MessageActionRow().addComponents(
							new MessageButton().setCustomId('süre').setLabel('Süre').setStyle('PRIMARY'),
							new MessageButton().setCustomId('ödül').setLabel('Ödül').setStyle('PRIMARY'),
							new MessageButton().setCustomId('kazanan').setLabel('Kazanan Sayısı').setStyle('PRIMARY'),
						);
						msg.edit({
							content: 'Hangi özelliğini değiştirmek istediğinizi butonlardan seçin!',
							components: [buttons],
							embeds: [embed],
						}).then((msg2) => {
							const filter = (i: ButtonInteraction<CacheType>) => i.user.id == message.author.id;
							const buttonCollector = msg2.createMessageComponentCollector({
								filter,
								componentType: 'BUTTON',
								time: 2 * 60 * 1000,
							});
							buttonCollector.on('collect', (i) => {
								if (i.customId == 'süre') {
									msg.edit({
										components: [],
										embeds: [
											new MessageEmbed()
												.setColor(`#${process.env.EMBEDCOLOR}`)
												.setDescription(
													'> Eklenecek veya azaltılacak süreyi belirtin! Örn: `15m` yazarsanız çekilişe 15 dakika ekler, `-15s` yazarsanız çekilişten 15 saniye azaltır',
												)
												.setFooter({
													text: 'Bu mesajı cevaplandırmak için 2 dakikanız var!',
												}),
										],
									}).then(() => {
										const timeFilter = (i: Message<boolean>) => i.author.id === message.author.id;
										msg.channel
											.awaitMessages({
												filter: timeFilter,
												max: 1,
												time: 2 * 60 * 1000,
												errors: ['time'],
											})
											.then(async (x) => {
												const newDuration = x.first();
												await x.first()?.delete();
												giveawaysManager
													.edit(`${selectedGiveaway?.messageId}`, {
														addTime: ms(`${newDuration}`),
													})
													.then(() =>
														msg.edit({
															content: `Çekiliş süresine başarıyla **${
																`${newDuration}`.includes('-') ? '-' : ''
															}${humanizeDuration(ms(`${newDuration}`), {
																language: 'tr',
																round: true,
															})}** eklendi!`,
															components: [],
															embeds: [],
														}),
													)
													.catch((err) => {
														console.error(err);
														msg.edit({
															content: 'Bir hata oluştu!',
															embeds: [],
															components: [],
														});
													});
											});
									});
								} else if (i.customId == 'kazanan') {
									msg.edit({
										components: [],
										embeds: [
											new MessageEmbed()
												.setColor(`#${process.env.EMBEDCOLOR}`)
												.setDescription('> Seçilecek yeni kazanan sayısını yaz!')
												.setFooter({
													text: 'Bu mesajı cevaplandırmak için 2 dakikanız var!',
												}),
										],
									}).then(() => {
										const winnerFilter = (m: Message<boolean>) =>
											!isNaN(parseInt(m.content)) && m.author.id === message.author.id;
										msg.channel
											.awaitMessages({
												filter: winnerFilter,
												max: 1,
												time: 2 * 60 * 1000,
												errors: ['time'],
											})
											.then(async (x) => {
												const winnerCount = parseInt(`${x.first()}`);
												await x.first()?.delete();
												if (isNaN(winnerCount) || winnerCount <= 0)
													return msg.edit({
														content: 'Bir hata oluştu!',
													});
												giveawaysManager
													.edit(`${selectedGiveaway?.messageId}`, {
														newWinnerCount: winnerCount,
													})
													.then(() =>
														msg.edit({
															embeds: [],
															components: [],
															content: `Çekilişin kazanan sayısı başarıyla **${winnerCount}** olarak değiştirildi!`,
														}),
													)
													.catch((err) => {
														console.error(err);
														msg.edit({
															content: 'Bir hata oluştu!',
															embeds: [],
															components: [],
														});
													});
											});
									});
								} else if (i.customId == 'ödül') {
									msg.edit({
										components: [],
										embeds: [
											new MessageEmbed()
												.setColor(`#${process.env.EMBEDCOLOR}`)
												.setDescription('> Çekilişin yeni ödülünü yaz!')
												.setFooter({
													text: 'Bu mesajı cevaplandırmak için 2 dakikanız var!',
												}),
										],
									}).then(() => {
										const prizeFilter = (m: Message<boolean>) => m.author.id === message.author.id;
										msg.channel
											.awaitMessages({
												filter: prizeFilter,
												max: 1,
												time: 2 * 60 * 1000,
												errors: ['time'],
											})
											.then(async (x) => {
												const newPrize = `${x.first()}`;
												await x.first()?.delete();
												giveawaysManager
													.edit(`${selectedGiveaway?.messageId}`, {
														newPrize: newPrize,
													})
													.then(() =>
														msg.edit({
															content: `Çekilişin yeni ödülü başarıyla **${newPrize}** olarak ayarlandı!`,
															components: [],
															embeds: [],
														}),
													)
													.catch((err) => {
														console.error(err);
														msg.edit({
															content: 'Bir hata oluştu!',
															embeds: [],
															components: [],
														});
													});
											});
									});
								} else return;
							});
						});
					});
				});
		},
	});
