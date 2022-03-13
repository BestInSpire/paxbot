import { CustomCommands } from '../../Base/Commands';
import { ClientType } from '../..';
import { Message } from 'discord.js';

export default (_client: ClientType) =>
	new CustomCommands({
		props: {
			name: 'unban',
			aliases: [],
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
					content: "Bir kullanıcının ID'sini yazmalısın!",
				});

			const user: string = args[0];

			message.guild?.members
				.unban(
					user,
					`Yetkili: ${message.author.tag} | Sebep: ${args[1] ? args.slice(1).join(' ') : 'Belirtilmemiş!'}`,
				)
				.then((x) => {
					message.reply({
						content: 'Kullanıcının yasağı başarıyla kaldırıldı!',
					});
				});
		},
	});
