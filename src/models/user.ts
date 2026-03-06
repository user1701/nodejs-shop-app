import { getDb, isSameProduct } from "@/utils/mongoDB.ts";
import { ObjectId } from "mongodb";

interface ICart {
	items: Array<ICartItem>;
}

interface ICartItem {
	id: ObjectId;
	quantity: number;
}

export class User {
	name: string;
	email: string;
	password: string;
	_id?: ObjectId = undefined;
	cart: ICart = { items: [] };

	constructor({ name, email, password, _id, cart = { items: [] } }: User) {
		this.name = name;
		this.email = email;
		this.password = password;
		this.cart = cart;
		if (_id) {
			this._id = _id;
		}
	}

	save() {
		const db = getDb();
		return db
			?.collection("users")
			.insertOne(this)
			.then((result) => {
				console.log("User saved to database:", result);
				return result;
			})
			.catch((err) => {
				console.error("Error saving user to database:", err);
				throw err;
			});
	}

	getCart() {
		const db = getDb();
		return db
			?.collection("products")
			.find({ _id: { $in: this.cart.items.map((item) => item.id) } })
			.toArray()
			.then((products) => {
				return products.map((product) => {
					const cartItem = this.cart.items.find((item) =>
						isSameProduct(item.id, product._id)
					);
					return { ...product, quantity: cartItem ? cartItem.quantity : 1 };
				});
			})
			.catch((err) => {
				console.error("Error fetching cart products from database:", err);
				return [];
			});
	}

	addCartItem(id: string) {
		const newCartItem: ICartItem = {
			id: new ObjectId(id),
			quantity: 1,
		};

		const newCartItemIdx = this.cart.items.findIndex(
			(item) => item.id.toString() === id
		);
		if (newCartItemIdx >= 0) {
			this.cart.items[newCartItemIdx]!.quantity += 1;
		} else {
			this.cart.items.push(newCartItem);
		}

		const db = getDb();
		return db
			?.collection<User>("users")
			.updateOne({ _id: new ObjectId(this._id) }, { $set: { cart: this.cart } })
			.catch((err) => {
				console.error("Error updating user cart in database:", err);
				throw err;
			});
	}

	deleteCartItem(id: string) {
		this.cart.items = this.cart.items.filter(
			(item) => item.id.toString() !== id
		);

		const db = getDb();
		return db
			?.collection<User>("users")
			.updateOne({ _id: new ObjectId(this._id) }, { $set: { cart: this.cart } })
			.catch((err) => {
				console.error("Error updating user cart in database:", err);
				throw err;
			});
	}

	getOrders() {
		const db = getDb();
		return db
			?.collection("orders")
			.find({ "user._id": new ObjectId(this._id) })
			.toArray()
			.then((orders) => orders)
			.catch((err) => {
				console.error("Error fetching user orders from database:", err);
				return [];
			});
	}

	placeOrder() {
		const db = getDb();

		this.getCart()
			?.then((products) => {
				if (!products || products.length === 0) {
					console.warn("No products in cart to place an order.");
					return;
				}
				const order = {
					items: products,
					user: { _id: new ObjectId(this._id), name: this.name },
				};

				db?.collection("orders").insertOne(order);
			})
			.then(() => {
				console.log("Order saved to database:");
				this.cart = { items: [] };
				return db
					?.collection<User>("users")
					.updateOne(
						{ _id: new ObjectId(this._id) },
						{ $set: { cart: this.cart } }
					);
			})
			.catch((err) => {
				console.error("Error saving order to database:", err);
				throw err;
			});
	}

	static findById(id: string) {
		const db = getDb();
		return db
			?.collection<User>("users")
			.findOne({ _id: new ObjectId(id) })
			.then((user) => user)
			.catch((err) => {
				console.error(`Error fetching user with ID ${id} from database:`, err);
				return null;
			});
	}
}
