import { CustomCommands } from '../../Base/Commands';
import { ClientType } from '../..';
import { Message, MessageEmbed } from 'discord.js';
import { dataModels } from '../../Structures/database';
import ms from 'ms';
import humanizeDuration from 'humanize-duration';
//@ts-ignore
import TrDate from 'tr-date';

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
			name: 'uyar',
			aliases: ['uyarı', 'warn'],
			category: 'Moderasyon',
			description: 'Etiketlediğiniz kullanıcıyı belirttiğiniz süre ve sebeple uyarırsınız!',
			usage: '!warn @üye [süre] [sebep]',
			enabled: true,
			owner: false,
			nsfw: false,
			permissions: { bot: ['SEND_MESSAGES'], user: ['ADMINISTRATOR'] },
			cooldown: 10000,
		},
		execute: async (message: Message, args: string[]) => {
			let mention = message.mentions.users.first();
			let member = message.mentions.members?.first();
			const roles = {
				first: '901122638439677973',
				second: '901122788084043777',
				three: '901122846737170523',
			};
			if (!args[0])
				return message.reply({
					content: 'Bir kullanıcıyı etiketlemelisin!',
				});
			if (!args[0].includes('@'))
				return message.reply({
					content: 'Geçerli bir kullanıcı etiketlemelisin!',
				});
			if (!args[1])
				return message.reply({
					content: 'Bir süre girmelisin! Örn: `!uyarı @kullanıcı 15m [Sebep]` (15 dakika)',
				});
			if (isNaN(ms(args[1])))
				return message.reply({
					content: 'Geçerli bir süre girmelisin! Örn: `!uyarı @kullanıcı 15m [Sebep]` (15 dakika)',
				});

			const data = await dataModels.warn.findOne({
				user: mention?.id,
			});
			const msFormatted = ms(args[1]);
			if (!data) {
				new dataModels.warn({
					user: mention?.id,
					warns: [
						{
							user: mention?.id,
							timeFormatted: new TrDate().getTime(),
							msFormatted: humanizeDuration(msFormatted, { round: true, language: 'tr' }),
							moderator: message.author.id,
							reason: args[2] ? args.slice(2).join(' ') : 'Sebep belirtilmemiş!',
							time: msFormatted,
							globalTime: msFormatted + Date.now(),
						},
					],
				})
					.save()
					.then(() => {
						if (
							message.mentions.members
								?.first()
								?.roles.cache.map((x) => x.id)
								.includes(roles.first)
						) {
							message.mentions.members?.first()?.roles.add(roles.second);
							message.mentions.members?.first()?.roles.remove(roles.first);
						} else if (
							message.mentions.members
								?.first()
								?.roles.cache.map((x) => x.id)
								.includes(roles.second)
						) {
							message.mentions.members?.first()?.roles.add(roles.three);
							message.mentions.members?.first()?.roles.remove(roles.second);
						} else {
							message.mentions.members?.first()?.roles.add(roles.first);
						}
						message.reply({
							content: 'Kullanıcı başarıyla uyarıldı!',
						});
						client.users.cache.get(`${`${mention?.id}`}`)?.send({
							embeds: [
								new MessageEmbed()
									.setAuthor({ name: message.guild?.name + ' Sunucusunda Uyarıldın' })
									.addField('Sebep:', args[2] ? args.slice(2).join(' ') : 'Sebep belirtilmemiş!')
									.addField('Süre', humanizeDuration(ms(args[1]), { language: 'tr', round: true }))
									.addField('Uyaran Yetkili', `${message.member}`)
									.setFooter({
										text: 'Kalan süreyi öğrenmek için sunucuda !uyarılar komutunu kullanabilirsin!',
									})
									.setColor('#fbbd08'),
							],
						});
					});
			} else {
				let datawarns = data.warns;
				datawarns.map((_: warnDataType, i: number) => {
					datawarns[i].time = datawarns[i].time + msFormatted;
					datawarns[i].globalTime = Date.now() + datawarns[i].time;
				});
				datawarns.map((_: warnDataType, i: number) => {
					if (datawarns[i + 1] && datawarns[i].globalTime == datawarns[i + 1].globalTime)
						datawarns[i].globalTime = datawarns[i].globalTime + datawarns[i + 1].time - msFormatted;
				});

				datawarns.push({
					user: mention?.id,
					timeFormatted: new TrDate().getTime(),
					msFormatted: humanizeDuration(msFormatted, { round: true, language: 'tr' }),
					moderator: message.author.id,
					reason: args[2] ? args.slice(2).join(' ') : 'Sebep belirtilmemiş!',
					time: msFormatted,
					globalTime: msFormatted + Date.now(),
				});
				data.warns = null;
				data.save().then(() => {
					data.warns = datawarns;
					data.save().then(() => {
						if (
							message.mentions.members
								?.first()
								?.roles.cache.map((x) => x.id)
								.includes(roles.first)
						) {
							message.mentions.members?.first()?.roles.add(roles.second);
							message.mentions.members?.first()?.roles.remove(roles.first);
						} else if (
							message.mentions.members
								?.first()
								?.roles.cache.map((x) => x.id)
								.includes(roles.second)
						) {
							message.mentions.members?.first()?.roles.add(roles.three);
							message.mentions.members?.first()?.roles.remove(roles.second);
						} else {
							message.mentions.members?.first()?.roles.add(roles.first);
						}
						message.reply({
							content: 'Kullanıcı başarıyla uyarıldı!',
						});
						client.users.cache.get(`${`${mention?.id}`}`)?.send({
							embeds: [
								new MessageEmbed()
									.setAuthor({ name: message.guild?.name + ' Sunucusunda Uyarıldın' })
									.addField('Sebep:', args[2] ? args.slice(2).join(' ') : 'Sebep belirtilmemiş!')
									.addField('Süre', humanizeDuration(ms(args[1]), { language: 'tr', round: true }))
									.addField('Uyaran Yetkili', `${message.member}`)
									.setFooter({
										text: 'Kalan süreyi öğrenmek için sunucuda !uyarılar komutunu kullanabilirsin!',
									})
									.setColor('#fbbd08'),
							],
						});
					});
				});
			}
		},
	});
