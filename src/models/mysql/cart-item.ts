import {
    DataTypes,
	Model,
	type CreationOptional,
	type ForeignKey,
	type InferAttributes,
	type InferCreationAttributes,
} from "sequelize";
import sequelize from "../../utils/db.ts";
import type Cart from "./cart.ts";
import type Product from "./product.ts";

class CartItem extends Model<
	InferAttributes<CartItem>,
	InferCreationAttributes<CartItem>
> {
	declare id: CreationOptional<string>;
	declare quantity: number;

    declare cartId: ForeignKey<Cart["id"]>;
    declare productId: ForeignKey<Product["id"]>;
}

CartItem.init(
	{
		id: {
			type: DataTypes.UUID,
			primaryKey: true,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
			unique: true,
		},
		quantity: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 1,
		},
	},
	{
		sequelize,
		tableName: "cart_item",
	}
);

export default CartItem;
