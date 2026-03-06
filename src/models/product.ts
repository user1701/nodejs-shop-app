import { model, Schema } from "mongoose";

const ProductSchema = new Schema({
	title: { type: String, required: true },
	imageUrl: { type: String, required: true },
	description: { type: String, required: true },
	price: { type: Number, required: true },
	userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

const ProductModel = model("Product", ProductSchema);

export default ProductModel;
