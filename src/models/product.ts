import sequelize from "../utils/db.ts";
import { DataTypes, type ModelDefined } from "sequelize";

export interface IProduct {
	id: string;
	title: string;
	imageUrl: string;
	description: string;
	price: number;
}

export type ProductCreationAttributes = Omit<IProduct, "id">;

export type ProductModel = ModelDefined<IProduct, ProductCreationAttributes>;

export const Product: ProductModel = sequelize.define("product", {
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
});

// {
//     paranoid: true,
// }

export default Product;
