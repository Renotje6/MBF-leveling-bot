import { Font, RankCardBuilder } from 'canvacord';
import bot from '../../bot';
import { getRequiredXP } from '../../lib/leveling/utils';
import type { BotCommand } from '../../types/bot.types';
import type { User } from '../../types/user';

export default {
	enabled: true,
	name: 'level',
	description: 'View your level and XP progress',
	options: [],
	autocomplete: (interaction) => {},
	run: async (client, interaction, options) => {
		if (!interaction.deferred) await interaction.deferReply();

		const userId = interaction.user.id;
		let user = await client.db('users').select().where('id', userId).first();
		if (!user) {
			if (!user) {
				console.log('User not found in database, inserting...');
				await bot.db('users').insert({
					id: `${interaction.user.id}`,
					xp: 0,
					level: 0,
				});

				user = (await bot.db('users').select().where('id', interaction.user.id).first()) as User;
			}
		}

		const member = await interaction.guild?.members.fetch(userId).catch(() => null);
		const rank = await client.db('users').count('* as rank').where('xp', '>', user.xp).first();

		if (!member) {
			await interaction.editReply({
				content: 'You are not a member of this server.',
			});
			return;
		}

		const xpNeeded = getRequiredXP(user.level + 1); // XP needed for next level
		Font.loadDefault();

		const card = new RankCardBuilder()
			.setDisplayName(member.displayName)
			.setUsername(member.user.username)
			.setAvatar(member.user.displayAvatarURL({ size: 512 }))
			.setCurrentXP(user.xp)
			.setRequiredXP(xpNeeded)
			.setLevel(user.level)
			.setBackground(interaction.guild?.splashURL({ size: 512 }) ?? '#23272a')
			.setStatus(member.presence?.status ?? 'online')
			.setRank(Number(rank?.rank) + 1);

		const image = await card.build({ format: 'png' });

		await interaction.editReply({
			files: [
				{
					attachment: image,
					name: 'rank.png',
				},
			],
		});

		return;
	},
} satisfies BotCommand;
