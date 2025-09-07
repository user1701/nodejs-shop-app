import mysql from "mysql2/promise";

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

class Database {
	static instance: Database;
	pool: mysql.Pool;

	private constructor(
		host: string | undefined,
		user: string | undefined,
		password: string | undefined,
		database: string | undefined
	) {
		if (!host || !user || !password || !database) {
			throw new Error(
				"Database configuration is missing in environment variables"
			);
		}

		this.pool = mysql.createPool({
			host: host,
			user: user,
			database: database,
			password: password,
			waitForConnections: true,
			connectionLimit: 10,
			maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
			idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
			queueLimit: 0,
			enableKeepAlive: true,
			keepAliveInitialDelay: 0,
		});
	}

	static getInstance() {
		if (!Database.instance) {
			Database.instance = new Database(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);
		}
		return Database.instance;
	}
}

export default Database;
