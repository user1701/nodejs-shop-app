import { model, Schema, Document, type PopulatedDoc } from "mongoose";
import type { IUser } from "@/models/user.ts";
import type { IProduct } from "@/models/product.ts";

export interface IOrder extends Document {
    items: {
        product: IProduct;
        quantity: number;
    }[];
    quantity: number;
    user: PopulatedDoc<IUser & Document>;
}

const OrderSchema = new Schema<IOrder>({
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
