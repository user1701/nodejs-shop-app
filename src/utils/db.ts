import { Sequelize } from "sequelize";

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

const sequlize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
	host: DB_HOST,
	dialect: "mysql",
	logging: false,
});

export default sequlize;
