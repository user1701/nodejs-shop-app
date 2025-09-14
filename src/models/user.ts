import sequelize from "../utils/db.ts";
import {
	Association,
	DataTypes,
	type CreationOptional,
	type HasManyAddAssociationMixin,
	type HasManyCountAssociationsMixin,
	type HasManyCreateAssociationMixin,
	type HasManyGetAssociationsMixin,
	type InferAttributes,
	type InferCreationAttributes,
	Model,
	type NonAttribute,
} from "sequelize";
import Product from "./product.ts";

class User extends Model<
	InferAttributes<User, { omit: "products" }>,
	InferCreationAttributes<User, { omit: "products" }>
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
	declare getProducts: HasManyGetAssociationsMixin<Product>;
	declare addProduct: HasManyAddAssociationMixin<Product, string>;
	declare addProducts: HasManyAddAssociationMixin<Product, string>;
	declare setProducts: HasManyAddAssociationMixin<Product, string>;
	declare removeProduct: HasManyAddAssociationMixin<Product, string>;
	declare removeProducts: HasManyAddAssociationMixin<Product, string>;
	declare hasProduct: HasManyAddAssociationMixin<Product, string>;
	declare hasProducts: HasManyAddAssociationMixin<Product, string>;
	declare countProducts: HasManyCountAssociationsMixin;
	declare createProduct: HasManyCreateAssociationMixin<Product, "userId">;

	declare products?: NonAttribute<Product[]>;

	declare static associations: { products: Association<User, Product> };
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

export async function createDefaultUser(userId: string) {
	const [user, created] = await User.findOrCreate({
		where: { id: userId },
		defaults: {
			id: userId,
			email: "ivan@gmail.com",
			name: "Ivan",
			password: "test123",
		},
	});

	if (created) {
		console.log("Default user created:", user.toJSON());
	} else {
		console.log("Default user already exists:", user.toJSON());
	}

	return user;
}

export default User;
