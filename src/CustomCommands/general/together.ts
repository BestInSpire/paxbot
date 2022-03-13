import { CustomCommands } from '../../Base/Commands';
import { ClientType } from '../..';
import {
	Message,
	MessageActionRow,
	MessageSelectMenu,
	MessageButton,
	SelectMenuInteraction,
	CacheType,
} from 'discord.js';
import superagent from 'superagent';

enum APPLICATIONS {
	YOUTUBE = '880218394199220334',
	POKER = '755827207812677713',
	BETRAYAL = '773336526917861400',
	FISHING = '814288819477020702',
	CHESS = '832012774040141894',
	LETTERTILE = '879863686565621790',
	WORDSNACK = '879863976006127627',
	DOODLECREW = '878067389634314250',
	AWKWORD = '879863881349087252',
	SPELLCAST = '852509694341283871',
	CHECKERS = '832013003968348200',
	PUTTYPARTY = '763133495793942528',
	SKETCHHEADS = '902271654783242291',
}

export default (client: ClientType) =>
	new CustomCommands({
		props: {
			name: 'together',
			aliases: ['wg'],
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
			if (!message.member?.voice.channel)
				return message.reply({
					content: 'Öncelikle sesli kanala katılmalısın!',
				});

			const channel = message.member?.voice.channel.id;
			const selectMenu = new MessageActionRow().addComponents(
				new MessageSelectMenu()
					.setCustomId('select')
					.setPlaceholder('Bir etkinlik seç!')
					.addOptions([
						{ label: 'Youtube', value: 'YOUTUBE' },
						{ label: 'Poker', value: 'POKER' },
						{ label: 'Betrayal', value: 'BETRAYAL' },
						{ label: 'Fishing', value: 'FISHING' },
						{ label: 'Chess', value: 'CHESS' },
						{ label: 'Lettertile', value: 'LETTERTILE' },
						{ label: 'Wordsnack', value: 'WORDSNACK' },
						{ label: 'Doodlecrew', value: 'DOODLECREW' },
						{ label: 'Awkword', value: 'AWKWORD' },
						{ label: 'Spellcast', value: 'SPELLCAST' },
						{ label: 'Checkers', value: 'CHECKERS' },
						{ label: 'Puttyparty', value: 'PUTTYPARTY' },
						{ label: 'Sketchheads', value: 'SKETCHHEADS' },
					]),
			);

			message
				.reply({
					content: 'Açmak istediğin etkinliği seç!',
					components: [selectMenu],
				})
				.then((_: Message) => {
					const filter = (i: { deferUpdate: () => void; user: { id: string } }) => {
						i.deferUpdate();
						return i.user.id === message.author.id;
					};

					const collector = message.channel.createMessageComponentCollector({
						filter,
						componentType: 'SELECT_MENU',
						time: 2 * 60 * 1000,
					});

					collector.on('collect', (i: SelectMenuInteraction<CacheType>) => {
						superagent
							.post(`https://discord.com/api/v9/channels/${channel}/invites`)
							.set('Authorization', 'Bot ' + client.token)
							.set('Content-Type', 'application/json')
							.send(
								JSON.stringify({
									max_age: 86400,
									max_uses: 0,
									/**@ts-ignore */
									target_application_id: APPLICATIONS[i.values[0]],
									target_type: 2,
									temporary: false,
									validate: null,
								}),
							)
							.then((response: superagent.Response) => {
								const row = new MessageActionRow().addComponents(
									new MessageButton()
										.setLabel('Davet Linki')
										.setStyle('LINK')
										.setURL(`https://discord.gg/${response.body.code}`),
								);

								_.edit({
									content: 'Kanala davet etmek için alttaki davet linkine tıkla!',
									components: [row],
								});
							});
					});
				});
		},
	});
