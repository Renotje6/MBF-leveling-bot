import type { BotComponent } from '../../types/bot.types';

export default {
	enabled: false,
	customId: 'example_component',

	run: async (client, interaction, options) => {
		interaction.reply({
			ephemeral: true,
			content: 'Example Component',
		});
	},
} satisfies BotComponent;
