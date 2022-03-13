import { GiveawayData, GiveawaysManager } from 'discord-giveaways';
import { client } from '..';
import { dataModels } from './database';

const GiveawayManagerWithOwnDatabase = class extends GiveawaysManager {
	async getAllGiveaways() {
		return await dataModels.giveaway.find().lean().exec();
	}
	async saveGiveaway(messageId: string, giveawayData: GiveawayData) {
		await dataModels.giveaway.create(giveawayData);
		return true;
	}

	async editGiveaway(messageId: string, giveawayData: GiveawayData) {
		await dataModels.giveaway.updateOne({ messageId }, giveawayData, { omitUndefined: true }).exec();
		return true;
	}
	async deleteGiveaway(messageId: string) {
		await dataModels.giveaway.deleteOne({ messageId }).exec();
		return true;
	}
};
/** @ts-ignore */
export const giveawaysManager = new GiveawayManagerWithOwnDatabase(client, {
	default: {
		botsCanWin: false,
		embedColor: `#${process.env.EMBEDCOLOR}`,
		embedColorEnd: '#000000',
		reaction: '🎉',
	},
});
