'use strict';
import { EventStructure } from '../Base/Events';
import { ClientType } from '..';
import { GuildMember, MessageEmbed, Role } from 'discord.js';
import { dataModels } from '../Structures/database';

export default (client: ClientType) =>
	new EventStructure({
		on: 'rolePermissionsUpdate',
		execute: async (role: Role, oldPermissions: number, newPermissions: number) => {
			const data = await dataModels.modlog.findOne({
				guild: role.guild?.id,
			});
			if (!data || !data.isActive || !data.settings.rolePermissionsUpdate) return;

			const embed = new MessageEmbed()
				.setColor(`#${process.env.EMBEDCOLOR}`)
				.setAuthor({ name: 'Bir rolün izinleri düzenlendi!' })
				.addField('Düzenlenen rol:', `${role}`, true)
				.addField('Eski izinler:', `${oldPermissions}`)
				.addField('Yeni izinler:', `${newPermissions}`);

			//@ts-ignore
			client.channels?.cache.get(`${data.channel}`)?.send({
				content: null,
				embeds: [embed],
			});
		},
	});
