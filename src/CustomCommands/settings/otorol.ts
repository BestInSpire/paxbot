import { CustomCommands } from '../../Base/Commands';
import { ClientType } from '../..';
import { Message } from 'discord.js';
import { dataModels } from '../../Structures/database';

export default (client: ClientType) =>
	new CustomCommands({
		props: {
			name: 'otorol',
			aliases: [],
			category: 'Ayarlar',
			description: 'Sunucuya yeni katılan üyelere otomatik verilecek rolü ayarlarsınız!',
			usage: '!otorol @rol',
			enabled: true,
			owner: false,
			nsfw: false,
			permissions: { bot: ['SEND_MESSAGES'], user: ['ADMINISTRATOR'] },
			cooldown: 10000,
		},
		execute: async (message: Message, args: string[]) => {
			if (!args[0])
				return message.reply({
					content: 'Yeni katılan üyelere otomatik olarak verilecek rolü etiketlemelisin!',
				});
			if (!args[0].includes('@'))
				return message.reply({
					content: 'Geçerli bir rol etiketlemelisin!',
				});

			const selectedRole = message.mentions.roles.first()?.id || message.guild?.roles.cache.get(args[0]);

			const data = await dataModels.otorol.findOne({
				guild: message.guild?.id,
			});

			if (data) {
				data.role = selectedRole;
				data.save().then(() => {
					message.reply({
						content: 'Otorol başarıyla güncellendi!',
					});
				});
			} else {
				await new dataModels.otorol({
					guild: message.guild?.id,
					role: selectedRole,
				})
					.save()
					.then(() => {
						message.reply({
							content: 'Otorol başarıyla ayarlandı!',
						});
					});
			}
		},
	});
