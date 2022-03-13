'use strict';
import { EventStructure } from '../Base/Events';
import { ClientType } from '..';
import { dataModels } from '../Structures/database';
import reactionAdd from '../EventsRaw/messageReactionAdd';
import reactionRemove from '../EventsRaw/messageReactionRemove';

export default (client: ClientType) =>
	new EventStructure({
		on: 'raw',
		execute: async (data: { t: string }) => {
			switch (data.t) {
				case 'MESSAGE_REACTION_ADD':
					reactionAdd(client).execute(data);
					break;

				case 'MESSAGE_REACTION_REMOVE':
					reactionRemove(client).execute(data);
					break;
			}
		},
	});
