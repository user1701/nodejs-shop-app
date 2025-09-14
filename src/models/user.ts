import sequlize from "../utils/db.ts";
import { DataTypes, type ModelDefined } from "sequelize";

export interface IUser {
	id: string;
	name: string;
	email: string;
	password: string;
}

export type UserCreationAttributes = Omit<IUser, "id">;

export type UserModel = ModelDefined<IUser, UserCreationAttributes>;

export const User: UserModel = sequlize.define(
	"user",
	{
		id: {
			type: DataTypes.UUID,
			primaryKey: true,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
			unique: true,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				isEmail: true,
			},
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	},
	{
		timestamps: true,
		paranoid: true,
	}
);

export default User;
