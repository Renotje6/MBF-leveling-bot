import { ChannelType, Events, type Message } from 'discord.js';
import bot from '../../bot';
import { getRequiredXP } from '../../lib/leveling/utils';
import type { BotEvent } from '../../types/bot.types';
import type { User } from '../../types/user';
import {syncRole} from "../../lib/leveling/assignTopRoles";

export default {
	enabled: true,
	name: 'give_xp',
	type: Events.MessageCreate,
	once: false,

	run: async (message: Message) => {
		if (message.author.bot) return;

		const userId = message.author.id;

		// Check database for user
		let user = await bot.db<User>('users').select().where('id', message.author.id).first();
		if (!user) {
			console.log('User not found in database, inserting...');
			await bot.db('users').insert({
				id: `${message.author.id}`,
				xp: 0,
				level: 0,
			});

			user = (await bot.db('users').select().where('id', message.author.id).first()) as User;
		}

		// Check cooldowns
		const lastUsed = bot.cooldowns.get(userId);

		if (lastUsed && Date.now() - lastUsed < 60 * 1000) {
			console.log(`User ${userId} is on cooldown.`);
			return;
		} // 1 minute cooldown

		bot.cooldowns.set(userId, Date.now());

		//Give XP
		const xpToAdd = Math.floor(Math.random() * 31) + 10;
		const xpNeeded = getRequiredXP(user.level + 1); // XP needed for next level

		if (user.xp + xpToAdd >= xpNeeded) {
			await bot
				.db('users')
				.update({ xp: 0, level: user.level + 1 })
				.where('id', userId);

			const channel = await bot.channels.fetch(bot.config.level_up_channel_id);

			await syncRole()

			if (channel?.type === ChannelType.GuildText) {
				return channel.send({
					content: bot.config.level_up_message?.replacer({ user: `<@${userId}>`, level: user.level + 1 }) ?? `Congratulations <@${userId}>! You leveled up to level ${user.level + 1}!`,
				});
			} else {
				return message.channel.isSendable() ? message.channel.send({
					content: ""
				}) : bot.config.level_up_message?.replacer({ user: `<@${userId}>`, level: user.level + 1 }) ?? `Congratulations <@${userId}>! You leveled up to level ${user.level + 1}!`;
			}
		} else {
			await bot
				.db('users')
				.update({ xp: user.xp + xpToAdd })
				.where('id', userId);
		}
	},
} satisfies BotEvent;
