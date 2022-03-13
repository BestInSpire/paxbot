'use strict';
import { EventStructure } from '../Base/Events';
import { ClientType } from '..';
import { GuildMember, MessageEmbed } from 'discord.js';
import { dataModels } from '../Structures/database';
import moment from 'moment';

export default (client: ClientType) =>
	new EventStructure({
		on: 'guildMemberRemove',
		execute: async (member: GuildMember) => {
			const data = await dataModels.modlog.findOne({
				guild: member.guild?.id,
			});
			if (!data || !data.isActive || !data.settings.guildMemberRemove) return;
			await import('moment-duration-format');

			var audit = await member.guild.fetchAuditLogs();
			var auditLog = await audit.entries.first();

			var currentTime = Date.now();
			var auditTime = Date.parse(`${audit.entries.first()?.createdAt}`);

			var wasKick = false;
			//@ts-ignore
			if (auditLog?.action === 'MEMBER_KICK') {
				if (currentTime - 1500 < auditTime && auditTime < currentTime + 1500) {
					wasKick = true;
				}
			}

			var channel = client.channels.cache.get(data.channel);
			if (wasKick) {
				const reason = auditLog?.reason || 'Sebep belirtilmedi';
				const Embed = new MessageEmbed()
					.setColor(`#${process.env.EMBEDCOLOR}`)
					.setAuthor({
						name: 'Bir üye sunucudan atıldı',
						iconURL: `${member.user.displayAvatarURL({ dynamic: true, size: 512 })}`,
					})
					.addField('Atılan Üye:', `<@${member.user.id}>`)
					.addField("Atılan üyenin ID'si:", member.user.id)
					.addField(
						'Discord kayıt tarihi:',
						moment(member.user.createdAt).format('DD/MM/YYYY HH:mm:ss'),
						true,
					)
					.addField('Sunucuya katıldığı tarih:', moment(member.joinedAt).format('DD/MM/YYYY HH:mm:ss'), true)
					.addField('Sebep:', reason, true)
					.addField(
						'Yeni mevcut üye sayısı:',
						`${member.guild.memberCount - member.guild.members.cache.filter((x) => x.user.bot).size}`,
						true,
					);
				//@ts-ignore
				channel.send({ embeds: [Embed] });
			} else {
				const Embed = new MessageEmbed()
					.setColor(`#${process.env.EMBEDCOLOR}`)
					.setAuthor({
						name: 'Bir üye sunucudan ayrıldı',
						iconURL: `${member.user.displayAvatarURL({ dynamic: true, size: 512 })}`,
					})
					.addField('Ayrılan üye:', `<@${member.user.id}>`, false)
					.addField("Ayrılan üyenin ID'si:", member.user.id, false)
					.addField(
						'Discord kayıt tarihi:',
						moment(member.user.createdAt).format('DD/MM/YYYY HH:mm:ss'),
						true,
					)
					.addField('Sunucuya katıldığı tarih:', moment(member.joinedAt).format('DD/MM/YYYY HH:mm:ss'), true)
					.addField(
						'Yeni mevcut üye sayısı:',
						`${member.guild.memberCount - member.guild.members.cache.filter((x) => x.user.bot).size}`,
						true,
					);
				//@ts-ignore
				channel.send({ embeds: [Embed] });
			}
		},
	});
