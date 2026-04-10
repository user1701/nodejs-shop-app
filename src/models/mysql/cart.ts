import {
	Association,
	DataTypes,
	Model,
	type BelongsToManyAddAssociationMixin,
	type BelongsToManyAddAssociationsMixin,
	type BelongsToManyCountAssociationsMixin,
	type BelongsToManyCreateAssociationMixin,
	type BelongsToManyGetAssociationsMixin,
	type BelongsToManyHasAssociationMixin,
	type BelongsToManyHasAssociationsMixin,
	type BelongsToManyRemoveAssociationMixin,
	type BelongsToManyRemoveAssociationsMixin,
	type BelongsToManySetAssociationsMixin,
	type CreationOptional,
	type ForeignKey,
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
	type HasOneCreateAssociationMixin,
	type HasOneGetAssociationMixin,
	type HasOneSetAssociationMixin,
	type InferAttributes,
	type InferCreationAttributes,
	type NonAttribute,
} from "sequelize";
import sequelize from "../../utils/db.ts";
import type Product from "./product.ts";
import type User from "./user.ts";

class Cart extends Model<
	InferAttributes<Cart, { omit: "products" | "user" }>,
	InferCreationAttributes<Cart, { omit: "products" | "user" }>
> {
	declare id: CreationOptional<string>;

	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
	declare deletedAt: CreationOptional<Date>;

	declare userId: ForeignKey<User["id"]>;
	declare user?: NonAttribute<User>;
	declare getUser: HasOneGetAssociationMixin<User>;
	declare setUser: HasOneSetAssociationMixin<User, string>;
	declare createUser: HasOneCreateAssociationMixin<User>;

	declare products?: NonAttribute<Product[]>;
	declare getProducts:
		| HasManyGetAssociationsMixin<Product>
		| BelongsToManyGetAssociationsMixin<Product>;
	declare addProduct:
		| HasManyAddAssociationMixin<Product, string>
		| BelongsToManyAddAssociationMixin<Product, string>;
	declare addProducts:
		| HasManyAddAssociationsMixin<Product, string>
		| BelongsToManyAddAssociationsMixin<Product, string>;
	declare setProducts:
		| HasManySetAssociationsMixin<Product, string>
		| BelongsToManySetAssociationsMixin<Product, string>;
	declare removeProduct:
		| HasManyRemoveAssociationMixin<Product, string>
		| BelongsToManyRemoveAssociationMixin<Product, string>;
	declare removeProducts:
		| HasManyRemoveAssociationsMixin<Product, string>
		| BelongsToManyRemoveAssociationsMixin<Product, string>;
	declare hasProduct:
		| HasManyHasAssociationMixin<Product, string>
		| BelongsToManyHasAssociationMixin<Product, string>;
	declare hasProducts:
		| HasManyHasAssociationsMixin<Product, string>
		| BelongsToManyHasAssociationsMixin<Product, string>;
	declare countProducts:
		| HasManyCountAssociationsMixin
		| BelongsToManyCountAssociationsMixin;
	declare createProduct:
		| HasManyCreateAssociationMixin<Product, "userId">
		| BelongsToManyCreateAssociationMixin<Product>;

	declare static associations: {
		products: Association<Cart, Product>;
		user: Association<Cart, User>;
	};
}

Cart.init(
	{
		id: {
			type: DataTypes.UUID,
			primaryKey: true,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
			unique: true,
		},
		createdAt: DataTypes.DATE,
		updatedAt: DataTypes.DATE,
		deletedAt: DataTypes.DATE,
	},
	{
		sequelize,
		tableName: "cart",
		timestamps: true,
		paranoid: true,
	}
);

export default Cart;
