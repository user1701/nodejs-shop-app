import { model, Schema } from "mongoose";

const OrderSchema = new Schema({
	items: [
		{
			product: { type: Object, required: true },
			quantity: { type: Number, required: true },
		},
	],
	user: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

const OrderModel = model("Order", OrderSchema);

export default OrderModel;
