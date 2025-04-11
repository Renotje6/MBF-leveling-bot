import { Font, LeaderboardBuilder } from 'canvacord';
import type { BotCommand } from '../../types/bot.types';
import type { User } from '../../types/user';

export default {
	enabled: true,
	name: 'leaderboard',
	description: 'View the Top 10 users in the server',
	options: [],
	autocomplete: (interaction) => {},
	run: async (client, interaction, options) => {
		if (!interaction.deferred) await interaction.deferReply();

		const users = await client.db<User>('users').select().orderBy('level', 'desc').orderBy('xp', 'desc').limit(10);
		Font.loadDefault();

		const results = await Promise.all(
			users.map(async (user, index) => {
				let displayName: string;
				let username: string;

				const member = await interaction.guild?.members.fetch(user.id).catch(() => null);
				if (member) {
					displayName = member.displayName;
					username = member.user.username;
				} else {
					displayName = 'Unknown User';
					username = 'Unknown User';
				}

				return {
					avatar: member?.user.displayAvatarURL({ size: 512 }) || 'https://cdn.discordapp.com/embed/avatars/0.png',
					level: user.level,
					xp: user.xp,
					rank: index + 1,
					displayName,
					username,
				};
			})
		);

		try {
			const leaderboard = new LeaderboardBuilder()
				.setHeader({
					title: `${interaction.guild?.name}'s leaderboard`,
					image: interaction.guild?.iconURL({ forceStatic: true, extension: 'png', size: 256 })!,
					subtitle: 'Top 10 users',
				})
				.setPlayers(results);

			const image = await leaderboard.build({ format: 'png' });

			await interaction.editReply({
				files: [
					{
						attachment: image,
						name: 'leaderboard.png',
					},
				],
			});
		} catch (e) {
			console.log('Error generating leaderboard:');
			console.error(e);
			await interaction.editReply({
				content: 'An error occurred while generating the leaderboard.',
			});
		}
	},
} satisfies BotCommand;
