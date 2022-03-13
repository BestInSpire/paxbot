import { CustomCommands } from '../../Base/Commands';
import { ClientType } from '../..';
import { Message } from 'discord.js';

export default (_client: ClientType) =>
	new CustomCommands({
		props: {
			name: 'ban',
			aliases: ['yasakla', 'banla', 'yasak'],
			category: 'Moderasyon',
			description: 'Etiketlediğiniz üyeyi sunucudan kalıcı olarak yasaklarsınız!',
			usage: '!ban @kullanici',
			enabled: true,
			owner: false,
			nsfw: false,
			permissions: { bot: ['SEND_MESSAGES'], user: ['ADMINISTRATOR'] },
			cooldown: 10000,
		},
		execute: async (message: Message, args: string[]) => {
			if (!args[0])
				return message.reply({
					content: "Bir kullanıcıyı etiketlemeli veya ID'sini yazmalısın!",
				});

			const user: string = message.mentions.users.first()?.id || args[0];
			if (message.guild?.members.cache.get(user)?.permissions.has('BAN_MEMBERS'))
				return message.reply({
					content: '`Üyeleri Yasakla` yetkisine sahip üyeleri yasaklayamam!',
				});
			const guildMember = message.guild?.members?.cache.get(user);
			if (
				guildMember &&
				//@ts-ignore
				message.member?.roles.highest.position <= message.guild.members?.cache.get(user).roles.highest.position
			)
				return message.reply({
					content: 'Kendi rolünden üst veya aynı seviyede rolü olan üyeleri yasaklayamazsın!',
				});
			//@ts-ignore
			if (guildMember && user.roles.highest.position <= message.guild.me?.roles.highest.position)
				return message.reply({
					content: 'Bu kullanıcının sahip olduğu rol(ler), benim rolümden daha üst veya aynı seviyede!',
				});

			message.guild?.members
				.ban(user, {
					reason: `Yetkili: ${message.author.tag} | Sebep: ${
						args[1] ? args.slice(1).join(' ') : 'Belirtilmemiş!'
					}`,
				})
				.then((x) => {
					message.reply({
						content: 'Kullanıcı başarıyla yasaklandı!',
					});
				});
		},
	});
