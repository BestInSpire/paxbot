import { EventStructure } from '../Base/Events';
import { ClientType } from '..';
import { dataModels } from '../Structures/database';
import { MessageEmbed } from 'discord.js';
import humanizeDuration from 'humanize-duration';
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
	new EventStructure({
		on: 'ready',
		execute: () => {
			setInterval(() => {
				dataModels.warn.find({}).then(async (x) => {
					const roles = {
						first: '901122638439677973',
						second: '901122788084043777',
						three: '901122846737170523',
					};
					for (const data of x) {
						for (const props of data.warns) {
							if (Date.now() > props.globalTime) {
								const finishedData = await dataModels.warn.findOne({
									user: data.user,
								});
								const selectedData = await finishedData.warns.find(
									(a: warnDataType) => a.globalTime == props.globalTime,
								);
								if (
									client.guilds.cache
										.get('720690676978810992')
										?.members.cache.get(data.user)
										?.roles.cache.map((x) => x.id)
										.includes(roles.first)
								) {
									await client.guilds.cache
										.get('720690676978810992')
										?.members.cache.get(data.user)
										?.roles.remove(roles.first);
								} else if (
									client.guilds.cache
										.get('720690676978810992')
										?.members.cache.get(data.user)
										?.roles.cache.map((x) => x.id)
										.includes(roles.second)
								) {
									await client.guilds.cache
										.get('720690676978810992')
										?.members.cache.get(data.user)
										?.roles.remove(roles.second);
									await client.guilds.cache
										.get('720690676978810992')
										?.members.cache.get(data.user)
										?.roles.add(roles.first);
								} else if (
									client.guilds.cache
										.get('720690676978810992')
										?.members.cache.get(data.user)
										?.roles.cache.map((x) => x.id)
										.includes(roles.three)
								) {
									await client.guilds.cache
										.get('720690676978810992')
										?.members.cache.get(data.user)
										?.roles.remove(roles.three);
									await client.guilds.cache
										.get('720690676978810992')
										?.members.cache.get(data.user)
										?.roles.add(roles.second);
								}
								client.users.cache
									.get(data.user)
									?.send({
										embeds: [
											new MessageEmbed()
												.setColor(`#${process.env.EMBEDCOLOR}`)
												.setAuthor({ name: 'Uyarın sona erdi!' })
												.addField('Uyarı Sebebi:', `${selectedData.reason}`)
												.addField(
													'Uyaran Yetkili:',
													`${client.users.cache.get(selectedData.moderator)}`,
												)
												.setFooter({
													text: 'Tüm geçmiş uyarılarına !tüm-uyarılar komutuyla ulaşabilirsin!',
												}),
										],
									})
									.then(async () => {
										const allWarnData = await dataModels.allWarns.findOne({
											user: selectedData.user,
										});
										if (allWarnData) {
											let allwarnadata = allWarnData.warns;
											allwarnadata.push({
												moderator: selectedData.moderator,
												date: selectedData.timeFormatted,
												reason: selectedData.reason,
												timeStamp: humanizeDuration(selectedData.time, {
													round: true,
													language: 'tr',
												}),
											});
											allWarnData.warns = null;
											allWarnData.save().then(() => {
												allWarnData.warns = allwarnadata;
												allWarnData.save();
											});
										} else {
											await new dataModels.allWarns({
												user: selectedData.user,
												warns: [
													{
														moderator: selectedData.moderator,
														date: selectedData.timeFormatted,
														reason: selectedData.reason,
														timeStamp: humanizeDuration(selectedData.time, {
															round: true,
															language: 'tr',
														}),
													},
												],
											}).save();
										}
									});
								client.users.cache.get(selectedData.moderator)?.send({
									embeds: [
										new MessageEmbed()
											//@ts-ignore
											.setColor(process.env.embedColor)
											.setAuthor({ name: 'Uyardığın bir kullanıcının uyarı süresi sona erdi!' })
											.addField(
												'Uyarılan Kullanıcı',
												`${client.users.cache.get(selectedData.user)}`,
											)
											.addField('Uyarı Sebebi:', `${selectedData.reason}`)
											.setFooter({
												text: 'Tüm geçmiş uyarılarına !tüm-uyarılar komutuyla ulaşabilirsin!',
											}),
									],
								});
								finishedData.warns = finishedData.warns.filter(
									(a: warnDataType) => a.globalTime !== props.globalTime,
								);
								finishedData.save();
							}
						}
					}
				});
				dataModels.mute.find({}).then(async (x) => {
					for (const data of x) {
						if (Date.now() > data.time) {
							await dataModels.mute.findOneAndDelete({
								time: data.time,
							});
						}
					}
				});
			}, 10 * 1000);
		},
	});
