import sequelize from "../utils/db.ts";
import {
	DataTypes,
	Model,
	type CreationOptional,
	type ForeignKey,
	type InferAttributes,
	type InferCreationAttributes,
    type NonAttribute,
} from "sequelize";
import type User from "./user.ts";

class Product extends Model<
	InferAttributes<Product>,
	InferCreationAttributes<Product>
> {
	declare id: CreationOptional<string>;

	declare title: string;
	declare imageUrl: string;
	declare description: string;
	declare price: number;

    declare user?: NonAttribute<User>;
	declare userId: ForeignKey<User["id"]>;

	// timestamps!
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
}

Product.init(
	{
		id: {
			type: DataTypes.UUID,
			primaryKey: true,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
			unique: true,
		},
		title: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		price: {
			type: DataTypes.DOUBLE,
			allowNull: false,
		},
		description: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		imageUrl: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		createdAt: DataTypes.DATE,
		updatedAt: DataTypes.DATE,
	},
	{
		tableName: "products",
		timestamps: true,
		paranoid: true,
		sequelize,
	}
);

export default Product;
