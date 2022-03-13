'use strict';
import { EventStructure } from '../Base/Events';
import { ClientType } from '..';
import { dataModels } from '../Structures/database';
import { Message, MessageEmbed } from 'discord.js';

export default (client: ClientType) =>
	new EventStructure({
		on: 'messageDelete',
		execute: async (message: Message) => {
			if (message.author.bot) return;
			const data = await dataModels.modlog.findOne({
				guild: message.guild?.id,
			});
			if (!data || !data.isActive || !data.settings.messageDelete) return;

			var audit = await message.guild?.fetchAuditLogs();
			var auditLog = await audit?.entries.first();
			var wasKick = false;
			//@ts-ignore
			if (auditLog?.action === 'MESSAGE_DELETE') {
				if (auditLog?.executor?.id !== message.author.id) wasKick = true;
			}

			var Attachment: string[] | string = [];

			try {
				var guildID = message.guild?.id;
			} catch (err) {
				console.error(err);
			}

			if (message.attachments) {
				Attachment = message.attachments.map((m) => m.url);
				Attachment = Attachment.join(', ');
			}

			if (Attachment[0]) {
				if (wasKick) {
					//@ts-ignore
					if (wasKick.target.bot) return;
					const Embed = new MessageEmbed()
						.setAuthor({
							name: 'Bir yetkili tarafından mesaj silindi!',
							iconURL: `${message.author.avatarURL({ dynamic: true, size: 1024 })}`,
						})
						.setColor(`#${process.env.EMBEDCOLOR}`)
						.addField('Mesajın silindiği kanal:', `<#${message.channel.id}>`, true)
						.addField(
							'Mesajı silen yetkili:',
							`<@${auditLog?.executor?.id}> (${auditLog?.executor?.tag})\n`,
							true,
						)
						.addField(
							'Mesajı silinen kullanıcı:',
							`<@${message.author.id}> (${message.author.tag})\n`,
							true,
						)
						.addField('Mesajın içeriği:', `\`\`\`${message.content}\`\`\``)
						.addField('Ek(ler)', `\`\`\`${Attachment}\`\`\``);

					client.guilds.cache
						.get(`${guildID}`)
						?.channels.cache.get(data.channel)
						//@ts-ignore
						?.send({
							embeds: [Embed],
						});
				} else {
					const Embed = new MessageEmbed()
						.setAuthor({
							name: 'Bir mesaj silindi!',
							iconURL: `${message.author.avatarURL({ dynamic: true, size: 1024 })}`,
						})
						.setColor(`#${process.env.EMBEDCOLOR}`)
						.addField('Mesajın silindiği kanal:', `<#${message.channel.id}>`, true)
						.addField('Mesajı silen kullanıcı:', `<@${message.author.id}> (${message.author.tag})\n`, true)
						.addField('Mesajın içeriği:', `\`\`\`${message.content}\`\`\``)
						.addField('Ek(ler)', `\`\`\`${Attachment}\`\`\``);

					client.guilds.cache
						.get(`${guildID}`)
						?.channels.cache.get(data.channel)
						//@ts-ignore
						?.send({
							embeds: [Embed],
						});
				}
			} else {
				if (wasKick) {
					const Embed = new MessageEmbed()
						.setAuthor({
							name: 'Bir yetkili tarafından mesaj silindi!',
							iconURL: `${message.author.avatarURL({ dynamic: true, size: 1024 })}`,
						})
						.setColor(`#${process.env.EMBEDCOLOR}`)
						.addField('Mesajın silindiği kanal', `<#${message.channel.id}>`, true)
						.addField('Mesajı silen yetkili:', `<@${auditLog?.executor?.id}>`, true)
						.addField('Mesajı silinen kullanıcı:', `<@${message.author.id}>`, true)
						.addField('Ek(ler)', `\`\`\`${message.content}\`\`\``);

					client.guilds.cache
						.get(`${guildID}`)
						?.channels.cache.get(data.channel)
						//@ts-ignore
						?.send({
							embeds: [Embed],
						});
				} else {
					const Embed = new MessageEmbed()
						.setAuthor({
							name: 'Bir mesaj silindi!',
							iconURL: `${message.author.avatarURL({ dynamic: true, size: 1024 })}`,
						})
						.setColor(`#${process.env.EMBEDCOLOR}`)
						.addField('Mesajın silindiği kanal:', `<#${message.channel.id}>`, true)
						.addField('Mesajı silen kullanıcı:', `<@${message.author.id}>`, true)
						.addField('Mesajın içeriği:', `\`\`\`${message.content}\`\`\``);
					client.guilds.cache
						.get(`${guildID}`)
						?.channels.cache.get(data.channel)
						//@ts-ignore
						?.send({
							embeds: [Embed],
						});
				}
			}
		},
	});
