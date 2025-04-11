import { Client, Collection, IntentsBitField, Partials } from 'discord.js';
import type { Knex } from 'knex';
import config from '../config.json';
import InitDatabase from './lib/database';
import handler from './lib/handler';
import { type BotConfig, ParseConfiguration } from './schemas/config';
import type { BotCommand, BotComponent, BotContext, BotEvent, BotInterval, BotModal } from './types/bot.types';

declare module 'discord.js' {
	export interface Client {
		config: BotConfig;
		commands: Collection<string, BotCommand>;
		components: Collection<string, BotComponent>;
		contexts: Collection<string, BotContext>;
		events: Collection<string, BotEvent>;
		intervals: Collection<string, BotInterval>;
		modals: Collection<string, BotModal>;
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		db: Knex<any, unknown[]>;
		cooldowns: Map<string, number>;
	}
}

// Create the bot instance
const bot = new Client({
	intents: [IntentsBitField.Flags.MessageContent, IntentsBitField.Flags.GuildMembers, IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages],
	partials: [Partials.Message, Partials.GuildMember],
});

(async () => {
	// Parse configuration file
	const configurationResponse = ParseConfiguration(config);
	if (!configurationResponse) return;

	// Initialize database
	const database = await InitDatabase();
	if (!database) return;

	// Set bot properties
	bot.config = config as unknown as BotConfig;
	bot.commands = new Collection();
	bot.events = new Collection();
	bot.contexts = new Collection();
	bot.components = new Collection();
	bot.modals = new Collection();
	bot.intervals = new Collection();
	bot.db = database;
	bot.cooldowns = new Map<string, number>();

	// Load handler
	handler();
})();

export default bot;
