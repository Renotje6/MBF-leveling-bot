import type { BotInterval } from '../../types/bot.types';

export default {
	enabled: false,
	name: 'example',
	interval: 10000,

	run: async (client) => {
		console.log('Example Interval');
	},
} satisfies BotInterval;
