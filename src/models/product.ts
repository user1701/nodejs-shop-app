import sequelize from "../utils/db.ts";
import {
	DataTypes,
	Model,
	type BelongsToCreateAssociationMixin,
	type BelongsToGetAssociationMixin,
	type BelongsToSetAssociationMixin,
	type CreationOptional,
	type ForeignKey,
	type InferAttributes,
	type InferCreationAttributes,
	type NonAttribute,
} from "sequelize";
import type User from "./user.ts";
import type CartItem from "./cart-item.ts";
import type OrderItem from "./order-item.ts";

class Product extends Model<
	InferAttributes<Product, { omit: "user" }>,
	InferCreationAttributes<Product, { omit: "user" }>
> {
	declare id: CreationOptional<string>;

	declare title: string;
	declare imageUrl: string;
	declare description: string;
	declare price: number;

	declare user?: NonAttribute<User>;
	declare userId: ForeignKey<User["id"]>;
	declare getUser: BelongsToGetAssociationMixin<User>;
	declare setUser: BelongsToSetAssociationMixin<User, string>;
	declare createUser: BelongsToCreateAssociationMixin<User>;

	// timestamps!
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;

	declare CartItem?: NonAttribute<CartItem>;
	declare OrderItem?: NonAttribute<OrderItem>;
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
			validate: { isUrl: true },
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
