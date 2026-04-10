import { model, Schema, Document, type PopulatedDoc } from "mongoose";
import type { IUser } from "./user.ts";

export interface IProduct extends Document {
    title: string;
    imageUrl: string;
    description: string;
    price: number;
    userId: PopulatedDoc<IUser & Document>;
}

const ProductSchema = new Schema<IProduct>({
    title: { type: String, required: true },
    imageUrl: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

const ProductModel = model("Product", ProductSchema);

export default ProductModel;
