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
import { dataModels } from '../../Structures/database';

export default (client: ClientType) =>
	new CustomCommands({
		props: {
			name: 'özel-komut',
			aliases: ['özelkomut', 'custom-commands', 'customcommands'],
			category: 'Ayarlar',
			description: 'Sunucuda kullanılabilecek yeni komutlar oluşturursunuz',
			usage: '!özel-komut [ekle / düzenle / sil]',
			enabled: true,
			owner: false,
			nsfw: false,
			permissions: { bot: ['SEND_MESSAGES'], user: ['ADMINISTRATOR'] },
			cooldown: 10000,
		},
		execute: async (message: Message, args: string[]) => {
			const buttonRow = new MessageActionRow().addComponents(
				new MessageButton().setLabel('Ekle').setCustomId('add').setStyle('SUCCESS'),
				new MessageButton().setLabel('Düzenle').setCustomId('edit').setStyle('PRIMARY'),
				new MessageButton().setLabel('Sil').setCustomId('remove').setStyle('DANGER'),
			);
			message
				.reply({
					content: 'Gerçekleştirmek istediğin işlemi butonlardan seç!',
					components: [buttonRow],
				})
				.then(async (msg) => {
					const filter = (i: ButtonInteraction<CacheType>) => i.user.id === message.author.id;

					const collector = msg.createMessageComponentCollector({
						filter,
						componentType: 'BUTTON',
						time: 2 * 60 * 1000,
					});
					collector.on('collect', async (i) => {
						if (i.customId == 'add') {
							msg.edit({
								content: null,
								components: [],
								embeds: [embedCreator('Eklemek istediğin komutun adını gir')],
							}).then(() => {
								const commandFilter = (m: Message<boolean>) => m.author.id == message.author.id;
								msg.channel
									.awaitMessages({
										filter: commandFilter,
										max: 1,
										time: 2 * 60 * 1000,
										errors: ['time'],
									})
									.then(async (nameAnswer) => {
										let namexd: Message<boolean> | undefined = nameAnswer.first();
										await nameAnswer.first()?.delete();
										const data = await dataModels.customCommands.findOne({
											name: namexd,
										});
										if (data)
											msg.edit({
												content:
													'Bu isimde komut zaten bulunuyor! Onu düzenlemeyi tercih edebilirsiniz.',
												components: [],
												embeds: [],
											});
										if (!data) {
											msg.edit({
												content: null,
												components: [],
												embeds: [embedCreator('Eklemek istediğin komutun açıklamasını gir')],
											}).then(() => {
												msg.channel
													.awaitMessages({
														filter: commandFilter,
														max: 1,
														time: 2 * 60 * 1000,
														errors: ['time'],
													})
													.then(async (answerDescription) => {
														await answerDescription.first()?.delete();
														await new dataModels.customCommands({
															name: `${namexd}`,
															description: `${answerDescription.first()}`,
														})
															.save()
															.then(() =>
																msg.edit({
																	content: 'Başarıyla eklendi!',
																	components: [],
																	embeds: [],
																}),
															);
													});
											});
										}
									});
							});
						} else if (i.customId == 'edit') {
							const dataArray = await dataModels.customCommands.find({});
							if (dataArray.length < 1) {
								msg.edit({
									content: 'Eklenmiş komut bulunamadı!',
									components: [],
									embeds: [],
								});
							} else {
								const channelSelectMenu = new MessageActionRow().addComponents(
									new MessageSelectMenu()
										.setCustomId('select')
										.setPlaceholder('Bir komut seç')
										.addOptions(
											//@ts-ignore
											await dataModels.customCommands.find({}).then(async (x) => {
												let arr = [];
												for (const datax of x) {
													arr.push({
														label: `${datax.name}`,
														value: datax.name,
													});
												}
												return arr;
											}),
										),
								);
								msg.edit({
									content: 'Düzenlemek istediğin komutu seç!',
									components: [channelSelectMenu],
									embeds: [],
								}).then(() => {
									const selectMenuCollector = msg.createMessageComponentCollector({
										filter: (i: SelectMenuInteraction<CacheType>) => i.user.id == message.author.id,
										componentType: 'SELECT_MENU',
										time: 2 * 60 * 1000,
									});

									selectMenuCollector.on('collect', async (i: SelectMenuInteraction<CacheType>) => {
										const selectedDataxd = await dataModels.customCommands.findOne({
											name: i.values[0],
										});
										msg.edit({
											content: null,
											components: [],
											embeds: [
												embedCreator(
													`**${selectedDataxd.name}** adlı komut için yeni açıklama gir!`,
												),
											],
										}).then(() => {
											const filter = (m: { author: { id: string } }) =>
												m.author.id == message.author.id;

											msg.channel
												.awaitMessages({
													filter,
													max: 1,
													time: 2 * 60 * 1000,
													errors: ['time'],
												})
												.then(async (answerNewDescription) => {
													await answerNewDescription.first()?.delete();
													const newDescription = answerNewDescription.first();
													selectedDataxd.description = newDescription;
													selectedDataxd.save().then(() => {
														msg.edit({
															content: 'Başarıyla düzenlendi!',
															components: [],
															embeds: [],
														});
													});
												});
										});
									});
								});
							}
						} else if (i.customId == 'remove') {
							const dataArray = await dataModels.customCommands.find({});
							if (dataArray.length < 1)
								msg.edit({
									content: 'Eklenmiş komut bulunamadı!',
								});
							const channelSelectMenu = new MessageActionRow().addComponents(
								new MessageSelectMenu()
									.setCustomId('select')
									.setPlaceholder('Bir komut seç')
									.addOptions(
										//@ts-ignore
										await dataModels.customCommands.find({}).then(async (x) => {
											let arr = [];
											for (const datax of x) {
												arr.push({
													label: `${datax.name}`,
													value: datax.name,
												});
											}
											return arr;
										}),
									),
							);

							msg.edit({
								content: 'Silinecek olan komutu seçmelisin',
								components: [channelSelectMenu],
								embeds: [],
							}).then((msg) => {
								const filter = (i: { deferUpdate: () => void; user: { id: string } }) => {
									i.deferUpdate();
									return i.user.id === message.author.id;
								};
								const collector = msg.createMessageComponentCollector({
									filter,
									componentType: 'SELECT_MENU',
									time: 2 * 60 * 1000,
								});

								collector.on('collect', async (i: SelectMenuInteraction<CacheType>) => {
									await dataModels.customCommands
										.findOneAndDelete({
											name: i.values[0],
										})
										.then(() =>
											msg.edit({
												content: 'Başarıyla silindi!',
												components: [],
											}),
										);
								});
							});
						}
					});
				});
		},
	});

const embedCreator = (description: string) => {
	return new MessageEmbed()
		.setColor(`#${process.env.EMBEDCOLOR}`)
		.setDescription(description)
		.setFooter({ text: 'Cevaplamak için 2 dakikanız var!' });
};
