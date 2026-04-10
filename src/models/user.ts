import { Document, model, Schema, Types, type InferSchemaType, type PopulatedDoc } from "mongoose";
import type { IProduct } from "./product.ts";

interface ICartItem {
    id: PopulatedDoc<IProduct & Document>;
    quantity: number;
}

const CartItemSchema = new Schema<ICartItem>({
    id: { type: Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true },
});

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    resetToken?: string | null;
    resetTokenExpiration?: Date | null;
    cart: {
        items: ICartItem[];
    };
    addCartItem(id: string): void;
    deleteCartItem(id: string): void;
}

const UserSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    resetToken: String,
    resetTokenExpiration: Date,
    cart: {
        items: [CartItemSchema],
    },
});

export type UserType = InferSchemaType<typeof UserSchema>;

UserSchema.methods.addCartItem = async function (productId: string) {
    const len = this.cart.items.length;
    const cartItemIndex =
        len === 0
            ? 0
            : this.cart.items.findIndex((item: ICartItem) => {
                  if (typeof item.id === "object") {
                      return item.id._id.equals(productId);
                  }

                  return item.id === productId;
              });

    if (cartItemIndex < 0 || len === 0) {
        this.cart.items.push({ id: productId, quantity: 1 });
    } else {
        this.cart.items[cartItemIndex].quantity += 1;
    }

    this.save();
};

UserSchema.methods.deleteCartItem = async function (productId: string) {
    this.cart.items = this.cart.items.filter((item: ICartItem) => {
        if (typeof item.id === "string") {
            return item.id !== productId;
        } else {
            return !item.id?._id.equals(productId);
        }
    });

    this.save();
};

export const UserModel = model<IUser>("User", UserSchema);

export default UserModel;
