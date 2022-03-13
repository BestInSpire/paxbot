import { CustomCommands } from '../../Base/Commands';
import { ClientType } from '../..';
import { Message, MessageSelectMenu, MessageActionRow } from 'discord.js';
import { dataModels } from '../../Structures/database';
import humanizeDuration from 'humanize-duration';

interface warnDataType {
	user: string;
	timeFormatted: number;
	msFormatted: string;
	moderator: string;
	reason: string;
	time: number;
	globalTime: number;
}

export default (client: ClientType) =>
	new CustomCommands({
		props: {
			name: 'uyarı-sil',
			aliases: [
				'uyarı-kaldır',
				'warn-delete',
				'warn-remove',
				'uyarısil',
				'uyarıkaldır',
				'warndelete',
				'warnremove',
			],
			category: 'Moderasyon',
			description: 'Etiketlediğiniz üyenin seçtiğiniz uyarısını silersiniz!',
			usage: '!uyarı-kaldır @üye',
			enabled: true,
			owner: false,
			nsfw: false,
			permissions: { bot: ['SEND_MESSAGES'], user: ['ADMINISTRATOR'] },
			cooldown: 10000,
		},
		execute: async (message: Message, args: string[]) => {
			if (!args[0])
				return message.reply({
					content: 'Bir kullanıcıyı etiketlemelisin!',
				});
			if (!args[0].includes('@'))
				return message.reply({
					content: 'Geçerli bir kullanıcı etiketlemelisin!',
				});

			const data = await dataModels.warn.findOne({
				user: message.mentions.users.first()?.id,
			});
			const roles = {
				first: '901122638439677973',
				second: '901122788084043777',
				three: '901122846737170523',
			};
			if (data && data.warns.length > 0) {
				const row = new MessageActionRow().addComponents(
					new MessageSelectMenu()
						.setCustomId('select')
						.setPlaceholder('Nothing selected')
						.addOptions(
							data.warns.map((x: warnDataType) => {
								return {
									label: x.reason,
									description: `Uyaran yetkili: ${
										client.users.cache.get(x.moderator)?.username
									} | Kalan süre: ${humanizeDuration(Date.now() - x.globalTime, {
										language: 'tr',
										round: true,
									})}`,
									value: `${x.globalTime}`,
								};
							}),
						),
				);

				message
					.reply({
						content: 'Silmek istediğin uyarıyı aşağıdaki listeden seç!',
						components: [row],
					})
					.then((msg: Message) => {
						const filter = (i: { deferUpdate: () => void; user: { id: string } }) => {
							i.deferUpdate();
							return i.user.id === message.author.id;
						};

						const collector = msg.createMessageComponentCollector({
							filter,
							componentType: 'SELECT_MENU',
							time: 15000,
						});
						collector.on('collect', async (i) => {
							const selectedData = data.warns.find(
								(x: warnDataType) => x.globalTime == parseInt(i.values[0]),
							);

							let datawarns = data.warns;
							let indexof = datawarns.indexOf(selectedData);
							datawarns = datawarns.filter((x: warnDataType) => x.globalTime !== parseInt(i.values[0]));
							datawarns.map((_: warnDataType, g: number) => {
								if (g < indexof) {
									datawarns[g].time = datawarns[g].time - selectedData.time;
									datawarns[g].globalTime = datawarns[g].globalTime - selectedData.time;
									if (datawarns[g + 1])
										datawarns[g].globalTime = datawarns[g].globalTime + datawarns[g + 1].time;
								}
							});
							data.warns = null;
							data.save().then(() => {
								data.warns = datawarns;
								data.save().then(async (_x: warnDataType) => {
									if (
										client.guilds.cache
											.get('720690676978810992')
											?.members.cache.get(data.user)
											?.roles.cache.map((x) => x.id)
											.includes(roles.first)
									) {
										await client.guilds.cache
											.get('720690676978810992')
											?.members.cache.get(data.user)
											?.roles.remove(roles.first);
									} else if (
										client.guilds.cache
											.get('720690676978810992')
											?.members.cache.get(data.user)
											?.roles.cache.map((x) => x.id)
											.includes(roles.second)
									) {
										await client.guilds.cache
											.get('720690676978810992')
											?.members.cache.get(data.user)
											?.roles.remove(roles.second);
										await client.guilds.cache
											.get('720690676978810992')
											?.members.cache.get(data.user)
											?.roles.add(roles.first);
									} else if (
										client.guilds.cache
											.get('720690676978810992')
											?.members.cache.get(data.user)
											?.roles.cache.map((x) => x.id)
											.includes(roles.three)
									) {
										await client.guilds.cache
											.get('720690676978810992')
											?.members.cache.get(data.user)
											?.roles.remove(roles.three);
										await client.guilds.cache
											.get('720690676978810992')
											?.members.cache.get(data.user)
											?.roles.add(roles.second);
									}

									msg.edit({
										content: 'Başarıyla kaldırıldı!',
										components: [],
									});
								});
							});
						});
					});
			} else {
				message.reply({
					content: 'Bu kullanıcının herhangi bir uyarı bilgisi bulunamadı!',
				});
			}
		},
	});
