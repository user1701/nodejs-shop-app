import { model, Schema, Types } from "mongoose";

interface ICartItem {
	id: Types.ObjectId;
	quantity: number;
}

const CartItemSchema = new Schema<ICartItem>({
	id: { type: Types.ObjectId, ref: "Product", required: true },
	quantity: { type: Number, required: true },
});

const UserSchema = new Schema({
	name: { type: String, required: true },
	email: { type: String, required: true },
	password: { type: String, required: true },
	cart: {
		items: [CartItemSchema],
	},
});

UserSchema.methods.addCartItem = async function (productId: string) {
	const cartItemIndex = this.cart.items.findIndex((item: ICartItem) =>
		item.id.equals(productId)
	);

	if (cartItemIndex < 0) {
		this.cart.items.push({ id: productId, quantity: 1 });
	} else {
		this.cart.items[cartItemIndex].quantity += 1;
	}
	return this.save();
};

UserSchema.methods.deleteCartItem = async function (productId: string) {
	this.cart.items = this.cart.items.filter(
		(item: ICartItem) => !item.id.equals(productId)
	);
	return this.save();
};

const UserModel = model("User", UserSchema);

export default UserModel;
