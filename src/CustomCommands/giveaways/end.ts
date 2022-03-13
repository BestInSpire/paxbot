import { CustomCommands } from '../../Base/Commands';
import { ClientType } from '../..';
import { CacheType, Message, MessageActionRow, MessageSelectMenu, SelectMenuInteraction } from 'discord.js';
import { giveawaysManager } from '../../Structures/giveaways';
import humanizeDuration from 'humanize-duration';

export default (client: ClientType) =>
	new CustomCommands({
		props: {
			name: 'çekiliş-bitir',
			aliases: ['giveaway-end', 'çekilişbitir', 'giveawayend'],
			category: 'Çekiliş',
			description: 'Devam eden bir çekilişi anında sonuçlandırırsınız!',
			usage: '!çekiliş-bitir',
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
					content: 'Anında tamamlamak istediğin çekilişi listeden seç!',
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
						giveawaysManager
							.end(`${selectedGiveaway?.messageId}`)
							.then(() => {
								msg.edit({
									content: 'Çekiliş başarıyla sonuçlandırıldı!',
									embeds: [],
									components: [],
								});
							})
							.catch((error) => {
								console.error(error);
								msg.edit({
									content: 'Bir hata oluştu!',
									embeds: [],
									components: [],
								});
							});
					});
				});
		},
	});
