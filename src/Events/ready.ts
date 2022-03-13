import { EventStructure } from '../Base/Events';
import { ClientType, slashData } from '..';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';

export default (client: ClientType) =>
	new EventStructure({
		on: 'ready',
		execute: () => {
			//@ts-ignore
			client.user.setStatus('online');
			client.user.setActivity('twitch.tv/glopax', {
				type: 'STREAMING',
				url: 'https://www.twitch.tv/glopax',
			});
			console.log('this bot is active');
			//@ts-ignore
			const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

			(async () => {
				try {
					rest.get(Routes.applicationGuildCommands(client.user.id, '838458558290329671'))
						/*.then((/**@type {any} data) => {
                for (const command of data) {
                  // @ts-ignore
                  client.api.applications(client.user.id).guilds("838458558290329671").commands(command.id).delete()
                }
              })*/
						.then(async (x) => {
							await rest.put(Routes.applicationGuildCommands(client.user.id, '838458558290329671'), {
								body: slashData,
							});
						})
						.then(async (x) => {
							await rest.put(Routes.applicationGuildCommands(client.user.id, '914929854980427788'), {
								body: slashData,
							});
						})
						.then(async (x) => {
							await rest.put(Routes.applicationGuildCommands(client.user.id, '720690676978810992'), {
								body: slashData,
							});
						});

					console.log('Successfully loaded application (/) commands.');
				} catch (error) {
					console.error(error);
				}
			})();
		},
	});
