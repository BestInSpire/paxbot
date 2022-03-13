import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const schemas = {
	warn: new Schema(
		{
			user: { type: String, required: true, unique: true },
			warns: { type: Array },
		},
		{ collection: 'Warns' },
	),

	allWarns: new Schema(
		{
			user: { type: Schema.Types.Mixed, required: true, unique: true },
			warns: { type: Schema.Types.Mixed },
		},
		{ collection: 'AllWarns' },
	),

	otorol: new Schema(
		{
			guild: { type: String, required: true, unique: true },
			role: { type: String, required: true },
		},
		{ collection: 'Otorol' },
	),

	mute: new Schema(
		{
			member: { type: String, required: true, unique: true },
			time: { type: String },
		},
		{ collection: 'Mutes' },
	),

	customCommands: new Schema(
		{
			name: { type: String, required: true, unique: true },
			description: { type: String, required: true },
		},
		{ collection: 'Custom Commands' },
	),

	reactionRole: new Schema(
		{
			channel: { type: String, required: true },
			message: { type: String, required: true },
			role: { type: String, required: true },
			emoji: { type: String, required: true },
		},
		{ collection: 'Reaction Roles' },
	),

	automode: new Schema(
		{
			duplicatedText: { type: Boolean },
			discordInvites: { type: Boolean },
			link: { type: Boolean },
			caps: { type: Boolean },
			messageSpam: { type: Boolean },
			spoilers: { type: Boolean },
			stickers: { type: Boolean },
			guild: { type: String, unique: true, required: true },
		},
		{ collection: 'Auto Moderations' },
	),
	modlog: new Schema(
		{
			channel: { type: String },
			isActive: { type: Boolean },
			guild: { type: String, unique: true, required: true },
			settings: {
				channelCreate: { type: Boolean },
				channelDelete: { type: Boolean },
				guildBanAdd: { type: Boolean },
				guildBanRemove: { type: Boolean },
				guildMemberAdd: { type: Boolean },
				guildMemberNicknameUpdate: { type: Boolean },
				guildMemberRemove: { type: Boolean },
				guildMemberRoleAdd: { type: Boolean },
				guildMemberRoleRemove: { type: Boolean },
				guildMemberUnboost: { type: Boolean },
				messageDelete: { type: Boolean },
				messageDeleteBulk: { type: Boolean },
				rolePermissionsUpdate: { type: Boolean },
				userAvatarUpdate: { type: Boolean },
				voiceChannelJoin: { type: Boolean },
				voiceChannelLeave: { type: Boolean },
				voiceChannelSwitch: { type: Boolean },
			},
		},
		{ collection: 'Mod Log' },
	),
	giveaways: new Schema(
		{
			messageId: { type: String },
			channelId: { type: String },
			guildId: { type: String },
			startAt: { type: Number },
			endAt: { type: Number },
			ended: { type: Boolean },
			winnerCount: { type: Number },
			prize: { type: String },
			messages: {
				giveaway: { type: String },
				giveawayEnded: { type: String },
				inviteToParticipate: { type: String },
				drawing: { type: String },
				dropMessage: { type: String },
				winMessage: { type: Schema.Types.Mixed },
				embedFooter: { type: Schema.Types.Mixed },
				noWinner: { type: String },
				winners: { type: String },
				endedAt: { type: String },
				hostedBy: { type: String },
			},
			thumbnail: { type: String },
			hostedBy: { type: String },
			winnerIds: { type: [String], default: undefined },
			reaction: { type: Schema.Types.Mixed },
			botsCanWin: Boolean,
			embedColor: { type: Schema.Types.Mixed },
			embedColorEnd: { type: Schema.Types.Mixed },
			exemptPermissions: { type: [], default: undefined },
			exemptMembers: { type: String },
			bonusEntries: { type: String },
			extraData: { type: Schema.Types.Mixed },
			lastChance: {
				enabled: { type: Boolean },
				content: { type: String },
				threshold: { type: Number },
				embedColor: { type: Schema.Types.Mixed },
			},
			pauseOptions: {
				isPaused: { type: Boolean },
				content: { type: String },
				unPauseAfter: { type: Number },
				embedColor: { type: Schema.Types.Mixed },
				durationAfterPause: { type: Number },
			},
			isDrop: { type: Boolean },
			allowedMentions: {
				parse: { type: [String], default: undefined },
				users: { type: [String], default: undefined },
				roles: { type: [String], default: undefined },
			},
		},
		{ id: false, collection: 'Cekilis' },
	),
};

export default () => {
	mongoose.connect(`${process.env.MONGO}`);
	mongoose.connection.on('connected', () => console.log('✔ Database has been connected!'));
	mongoose.connection.on('disconnected', () => console.warn('ℹ Database has been disconnected!'));
	mongoose.connection.on('reconnected', () => console.info('✔ Database has been reconnected!'));
};

export const dataModels = {
	warn: mongoose.model('Warns', schemas.warn),
	otorol: mongoose.model('Otorol', schemas.otorol),
	mute: mongoose.model('Mute', schemas.mute),
	customCommands: mongoose.model('Custom Commands', schemas.customCommands),
	giveaway: mongoose.model('giveaways', schemas.giveaways),
	allWarns: mongoose.model('AllWarns', schemas.allWarns),
	reactionRole: mongoose.model('Reaction Role', schemas.reactionRole),
	automode: mongoose.model('Auto Moderations', schemas.automode),
	modlog: mongoose.model('Mod Log', schemas.modlog),
};
