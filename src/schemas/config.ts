import { z } from 'zod';
import { Logger } from '../lib/utils';

export const configurationSchema = z.object({
	bot_token: z.string().min(50, 'Bot token must be at least 50 characters long'),
	guild_id: z.string().min(18, 'Guild ID must be at least 18 characters long'),
	level_up_channel_id: z.string().min(18, 'Level up channel ID must be at least 18 characters long'),
	level_up_message: z.string().optional(),
	top_role_id: z.string().min(18, 'Level up channel ID must be at least 18 characters long'),
	number_of_top: z.number().min(1).max(50).optional(),
	bot_presence: z.object({
		username: z.optional(z.string()),
		status: z.optional(z.enum(['dnd', 'idle', 'invisible', 'online'])),
		name: z.optional(z.string()),
		type: z.optional(z.enum(['Playing', 'Streaming', 'Listening', 'Watching'])),
	}),
});

export type BotConfig = z.infer<typeof configurationSchema>;

export function ParseConfiguration(configuration: unknown): boolean {
	try {
		const parsed = configurationSchema.parse(configuration);
		if (parsed) {
			Logger({ level: 'SUCCESS', module: 'CONFIGURATION', message: 'Loaded local config file' });
			return true;
		}
		return false;
	} catch (error) {
		if (error instanceof z.ZodError) {
			Logger({ level: 'ERROR', module: 'CONFIGURATION', message: `"${error.issues[0].path.join('.')}" ${error.issues[0].message} in config.json. (Resolve this issue and restart Bot)` });
		} else {
			Logger({ level: 'ERROR', module: 'CONFIGURATION', message: error as string });
		}
		return false;
	}
}
