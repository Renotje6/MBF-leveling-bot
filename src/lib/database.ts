import knex from 'knex';
import { Logger } from './utils';

const InitDatabase = async () => {
	try {
		const db = knex({
			client: 'better-sqlite3',
			useNullAsDefault: true,
			connection: {
				filename: './db.db',
			},
		});

		Logger({ level: 'SUCCESS', module: 'DATABASE', message: 'Database initialized' });

		await db.schema.createTableIfNotExists('users', (table) => {
			table.string('id');
			table.integer('level');
			table.integer('xp');
		});

		return db;
	} catch (error) {
		if (error instanceof Error) {
			Logger({ level: 'ERROR', module: 'DATABASE', message: error.message });
		}
	}
};

export default InitDatabase;
