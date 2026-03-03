import sequelize from "../utils/db.ts";
import {
	Association,
	DataTypes,
	Model,
	type BelongsToCreateAssociationMixin,
	type BelongsToGetAssociationMixin,
	type BelongsToSetAssociationMixin,
	type CreationOptional,
	type HasManyAddAssociationMixin,
	type HasManyAddAssociationsMixin,
	type HasManyCountAssociationsMixin,
	type HasManyCreateAssociationMixin,
	type HasManyGetAssociationsMixin,
	type HasManyHasAssociationMixin,
	type HasManyHasAssociationsMixin,
	type HasManyRemoveAssociationMixin,
	type HasManyRemoveAssociationsMixin,
	type HasManySetAssociationsMixin,
	type InferAttributes,
	type InferCreationAttributes,
	type NonAttribute,
} from "sequelize";
import Product from "./product.ts";
import type Cart from "./cart.ts";
import type Order from "./order.ts";

class User extends Model<
	InferAttributes<User, { omit: "products" | "cart" }>,
	InferCreationAttributes<User, { omit: "products" | "cart" }>
> {
	declare id: CreationOptional<string>;
	declare name: string;
	declare email: string;
	declare password: string;

	// timestamps!
	// createdAt can be undefined during creation
	// updatedAt can be undefined during creation
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
	declare deletedAt: CreationOptional<Date>;

	// Since TS cannot determine model association at compile time
	// we have to declare them here purely virtually
	// these will not exist until `Model.init` was called.
	// https://sequelize.org/docs/v6/core-concepts/assocs/#special-methodsmixins-added-to-instances

	// Product mixins
	declare products?: NonAttribute<Product[]>;
	declare getProducts: HasManyGetAssociationsMixin<Product>;
	declare addProduct: HasManyAddAssociationMixin<Product, string>;
	declare addProducts: HasManyAddAssociationsMixin<Product, string>;
	declare setProducts: HasManySetAssociationsMixin<Product, string>;
	declare removeProduct: HasManyRemoveAssociationMixin<Product, string>;
	declare removeProducts: HasManyRemoveAssociationsMixin<Product, string>;
	declare hasProduct: HasManyHasAssociationMixin<Product, string>;
	declare hasProducts: HasManyHasAssociationsMixin<Product, string>;
	declare countProducts: HasManyCountAssociationsMixin;
	declare createProduct: HasManyCreateAssociationMixin<Product, "userId">;

	// Possible inclusions from other associations
	declare cart?: NonAttribute<Cart>;
	declare getCart: BelongsToGetAssociationMixin<Cart>;
	declare setCart: BelongsToSetAssociationMixin<Cart, string>;
	declare createCart: BelongsToCreateAssociationMixin<Cart>;

    declare orders?: NonAttribute<Order[]>;
    declare getOrders: HasManyGetAssociationsMixin<Order>;
    declare createOrder: HasManyCreateAssociationMixin<Order, "userId">;

	declare static associations: {
		products: Association<User, Product>;
		cart: Association<User, Cart>;
		orders: Association<User, Order>;
	};
}

User.init(
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
		createdAt: DataTypes.DATE,
		updatedAt: DataTypes.DATE,
		deletedAt: DataTypes.DATE,
	},
	{
		tableName: "users",
		timestamps: true,
		paranoid: true,
		sequelize,
	}
);

export async function createDefaultUser(userId: string, log: boolean = false) {
	const [user, created] = await User.findOrCreate({
		where: { id: userId },
		defaults: {
			id: userId,
			email: "ivan@gmail.com",
			name: "Ivan",
			password: "test123",
		},
	});

	if (log) {
		if (created) {
			console.log("Default user created:", user.toJSON());
		} else {
			console.log("Default user already exists:", user.toJSON());
		}
	}

	return user;
}

export default User;
