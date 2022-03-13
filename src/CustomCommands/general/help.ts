import { CustomCommands } from '../../Base/Commands';
import { ClientType, commands } from '../..';
import { ButtonInteraction, CacheType, Message, MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';

export default (client: ClientType) =>
	new CustomCommands({
		props: {
			name: 'yardım',
			aliases: ['help'],
			category: 'Genel',
			description: 'Mevcut komutları ve açıklamalarını gösterir!',
			usage: '!yardım',
			enabled: true,
			owner: false,
			nsfw: false,
			permissions: { bot: ['SEND_MESSAGES'], user: ['SEND_MESSAGES'] },
			cooldown: 10000,
		},
		execute: (message: Message, args: string[]) => {
			const categories = [
				{ name: 'Genel', emoji: '838492882457329674', id: 'Genel' },
				{ name: 'Çekiliş', emoji: '838492883690455061', id: 'Çekiliş' },
				{
					name: 'Moderasyon',
					emoji: '838492882632441907',
					id: 'Moderasyon',
				},
				{
					name: 'Geliştirici',
					emoji: '887410452651442249',
					id: 'Geliştirici',
				},
				{
					name: 'Ayarlar',
					emoji: '838492883690455060',
					id: 'Ayarlar',
				},
			];
			const buttonRow = new MessageActionRow().addComponents(
				categories.map((x) => {
					return new MessageButton()
						.setCustomId(x.id)
						.setLabel(x.name)
						.setEmoji(`${client.emojis.cache.get(x.emoji)}`)
						.setStyle('SECONDARY');
				}),
			);

			message
				.reply({
					content: '> Komutlarına bakmak istediğin kategoriyi butonlardan seç!',
					components: [buttonRow],
				})
				.then((msg) => {
					const filter = (i: ButtonInteraction<CacheType>) => i.user.id == message.author.id;

					const collector = msg.createMessageComponentCollector({
						filter,
						componentType: 'BUTTON',
						time: 2 * 60 * 1000,
					});
					collector.on('collect', (i) => {
						const commandsList = commands.filter(
							//@ts-ignore
							(x) => x.props.category == i.customId,
						);
						msg.edit({
							embeds: [
								new MessageEmbed()
									.setColor(`#${process.env.EMBEDCOLOR}`)
									.setAuthor({
										name: i.customId,
										iconURL: client.emojis.cache.get(
											`${categories.find((x) => x.id == i.customId)?.emoji}`,
										)?.url,
									})
									.setThumbnail(
										`${
											client.emojis.cache.get(
												`${categories.find((x) => x.id == i.customId)?.emoji}`,
											)?.url
										}`,
									)
									.setDescription(
										commandsList
											.map(
												(x) =>
													//@ts-ignore
													`**!${x.props.name}**: ${x.props.description}`,
											)
											.join('\n'),
									),
							],
						});
					});
				});
		},
	});
