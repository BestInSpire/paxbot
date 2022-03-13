import { CustomCommands } from '../../Base/Commands';
import { ClientType } from '../..';
import { ButtonInteraction, CacheType, Message, MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import { dataModels } from '../../Structures/database';

export default (client: ClientType) =>
	new CustomCommands({
		props: {
			name: 'log',
			aliases: ['audit-log', 'modlog'],
			category: 'Ayarlar',
			description: 'Sunucu için detaylı bir log kanalı ayarlarsınız!',
			usage: '!log',
			enabled: true,
			owner: false,
			nsfw: false,
			permissions: { bot: ['SEND_MESSAGES'], user: ['ADMINISTRATOR'] },
			cooldown: 10000,
		},
		execute: async (message: Message, args: string[]) => {
			const logData = await dataModels.modlog.findOne({
				guild: message.guild?.id,
			});

			let buttonRow: MessageActionRow;

			if (logData && logData.isActive)
				buttonRow = new MessageActionRow().addComponents(
					new MessageButton().setCustomId('settings').setLabel('Düzenle').setStyle('SECONDARY'),
					new MessageButton().setCustomId('edit').setLabel('Kanalı Değiştir').setStyle('PRIMARY'),
					new MessageButton().setCustomId('remove').setLabel('Devredışı Bırak').setStyle('DANGER'),
				);
			else
				buttonRow = new MessageActionRow().addComponents(
					new MessageButton().setCustomId('add').setLabel('Ekle').setStyle('SUCCESS'),
				);

			message
				.reply({
					content: 'Yapmak istediğiniz işlemi seçin!',
					components: [buttonRow],
					embeds: [],
				})
				.then((msg) => {
					const filter = (i: ButtonInteraction<CacheType>) => i.user.id === message.author.id;
					const collector = msg.createMessageComponentCollector({
						filter,
						time: 2 * 60 * 1000,
						componentType: 'BUTTON',
					});

					collector.on('collect', async (data) => {
						if (data.customId === 'add') {
							msg.edit({
								content: null,
								components: [],
								embeds: [embedCreator('Detaylı denetim kaydı için kanal etiketle!')],
							}).then((setLog) => {
								const setLogFilter = (m: Message<boolean>) => m.author.id === message.author?.id;
								setLog.channel
									.awaitMessages({
										filter: setLogFilter,
										max: 1,
										time: 2 * 60 * 1000,
										errors: ['time'],
									})
									.then(async (answer) => {
										const channel = answer.first()?.mentions.channels.first();
										await answer.first()?.delete();
										if (!channel)
											return msg.edit({
												content: 'Geçerli bir kanal etiketlemediğiniz için işlem iptal edildi!',
												components: [],
												embeds: [],
											});
										if (logData) {
											dataModels.modlog
												.findOneAndUpdate({
													guild: message.guild?.id,
													channel: channel?.id,
													isActive: true,
												})
												.then(() => {
													msg.edit({
														content: 'Başarıyla ayarlandı!',
														components: [],
														embeds: [],
													});
												});
										} else {
											new dataModels.modlog({
												channel: channel?.id,
												isActive: true,
												guild: message.guild?.id,
												settings: {
													channelCreate: true,
													channelDelete: true,
													guildBanAdd: true,
													guildBanRemove: true,
													guildMemberAdd: true,
													guildMemberNicknameUpdate: true,
													guildMemberRemove: true,
													guildMemberRoleAdd: true,
													guildMemberRoleRemove: true,
													guildMemberUnboost: true,
													messageDelete: true,
													messageDeleteBulk: true,
													rolePermissionsUpdate: true,
													userAvatarUpdate: true,
													voiceChannelJoin: true,
													voiceChannelLeave: true,
													voiceChannelSwitch: true,
												},
											})
												.save()
												.then(() =>
													msg.edit({
														content: 'Başarıyla ayarlandı!',
														components: [],
														embeds: [],
													}),
												);
										}
									})
									.catch((error) => {
										msg.edit({
											content: 'Bir hata oluştu tekrar deneyin!',
											components: [],
											embeds: [],
										});
										console.error(error);
									});
							});
						} else if (data.customId === 'edit') {
							msg.edit({
								content: null,
								components: [],
								embeds: [embedCreator('Denetim kaydı için ayarlanacak yeni kanalı etiketle!')],
							}).then((editLog) => {
								const setLogFilter = (m: Message<boolean>) => m.author.id === message.author?.id;
								editLog.channel
									.awaitMessages({
										filter: setLogFilter,
										max: 1,
										time: 2 * 60 * 1000,
										errors: ['time'],
									})
									.then(async (answer) => {
										const channel = answer.first()?.mentions.channels.first();
										await answer.first()?.delete();
										if (!channel)
											return msg.edit({
												content: 'Geçerli bir kanal etiketlemediğiniz için işlem iptal edildi!',
												components: [],
												embeds: [],
											});
										logData.channel = channel?.id;
										logData.save().then(() =>
											msg.edit({
												content: 'Başarıyla değiştirildi!',
												components: [],
												embeds: [],
											}),
										);
									})
									.catch((error) => {
										msg.edit({
											content: 'Bir hata oluştu tekrar deneyin!',
											components: [],
											embeds: [],
										});
										console.error(error);
									});
							});
						} else if (data.customId === 'remove') {
							await dataModels.modlog
								.findOneAndUpdate({
									guild: message.guild?.id,
									isActive: false,
								})
								.then(() =>
									msg.edit({
										content: 'Başarıyla devredışı bırakıldı!',
										components: [],
										embeds: [],
									}),
								);
						} else if (data.customId === 'settings') {
							const dataSettings = await dataModels.modlog.findOne({
								guild: message.guild?.id,
							});
							const settings = [
								{ name: 'Kanal Oluşturuldu', data: 'channelCreate', id: '1' },
								{ name: 'Kanal Silindi', data: 'channelDelete', id: '2' },
								{ name: 'Üye Yasaklandı', data: 'guildBanAdd', id: '3' },
								{ name: 'Üye Yasağı Kaldırıldı', data: 'guildBanRemove', id: '4' },
								{ name: 'Yeni Üye Geldi', data: 'guildMemberAdd', id: '5' },
								{ name: 'Üye Kullanıcı Adını Güncelledi', data: 'guildMemberNicknameUpdate', id: '6' },
								{ name: 'Üye Sunucudan Ayrıldı', data: 'guildMemberRemove', id: '7' },
								{ name: 'Yeni Rol Eklendi', data: 'guildMemberRoleAdd', id: '8' },
								{ name: 'Rol Silindi', data: 'guildMemberRoleRemove', id: '9' },
								{ name: 'Üye Sunucudan Boostunu Çekti', data: 'guildMemberUnboost', id: '10' },
								{ name: 'Mesaj Silindi', data: 'messageDelete', id: '11' },
								{ name: 'Toplu Mesaj Silindi', data: 'messageDeleteBulk', id: '12' },
								{ name: 'Rol İzinleri Güncellendi', data: 'rolePermissionsUpdate', id: '13' },
								{ name: 'Üye Avatarını Güncelledi', data: 'userAvatarUpdate', id: '14' },
								{ name: 'Sesliye Bağlandı', data: 'voiceChannelJoin', id: '15' },
								{ name: 'Sesliden Ayrıldı', data: 'voiceChannelLeave', id: '16' },
								{ name: 'Ses Kanalını Değiştirdi', data: 'voiceChannelSwitch', id: '17' },
							];
							const embed = new MessageEmbed()
								.setFooter({
									text: 'Cevaplamak için 2 dakikanız var!',
								})
								.setColor(`#${process.env.EMBEDCOLOR}`)
								.setDescription(
									settings
										.map(
											(x, i) =>
												`\`${i + 1}.\` **${x.name}**: ${
													dataSettings.settings[x.data] ? 'Açık' : 'Kapalı'
												}`,
										)
										.join('\n'),
								);
							msg.edit({
								content:
									'Değerini tersine çevirmek istediğin ayarları boşluk olmadan virgülle ayırarak yaz örneğin: `1,2,3`',
								embeds: [embed],
								components: [],
							}).then((settingMsg) => {
								const settingsFilter = (i: Message<boolean>) => i.author.id == message.author.id;
								settingMsg.channel
									.awaitMessages({
										filter: settingsFilter,
										max: 1,
										time: 2 * 60 * 1000,
									})
									.then(async (settingRes) => {
										const response = settingRes.first()?.content.split(',');
										await settingRes.first()?.delete();
										//@ts-ignore
										response.map(async (x: string) => {
											const selectedSettings = settings.find((a) => a.id == x);
											dataSettings.settings[`${selectedSettings?.data}`] =
												!dataSettings.settings[`${selectedSettings?.data}`];
										});
										dataSettings.save().then(() => {
											msg.edit({
												content: 'Başarıyla kaydedildi!',
												embeds: [],
												components: [],
											});
										});
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
