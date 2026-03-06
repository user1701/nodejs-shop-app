import { getDb } from "@/utils/mongoDB.ts";
import { ObjectId } from "mongodb";

export class Product {
	title: string;
	imageUrl: string;
	description: string;
	price: number;
	userId: string;
	_id?: ObjectId;

	constructor({
		title,
		imageUrl,
		description,
		price,
		userId,
		id = undefined,
	}: {
		title: string;
		imageUrl: string;
		description: string;
		price: number;
		userId: string;
		id?: string;
	}) {
		this.title = title;
		this.imageUrl = imageUrl;
		this.description = description;
		this.price = price;
		this.userId = userId;
		if (id) {
			this._id = new ObjectId(id);
		}
	}

	static findAll() {
		const db = getDb();
		return db
			?.collection("products")
			.find()
			.toArray()
			.then((products) => products)
			.catch((err) => {
				console.error("Error fetching products from database:", err);
				return [];
			});
	}

	static findOne(id: string) {
		const db = getDb();
		return db
			?.collection("products")
			.findOne({ _id: new ObjectId(id) })
			.then((product) => product)
			.catch((err) => {
				console.error(
					`Error fetching product with ID ${id} from database:`,
					err
				);
				return null;
			});
	}

	static deleteById(id: string) {
		const db = getDb();
		return db
			?.collection("products")
			.deleteOne({ _id: new ObjectId(id) })
			.then((result) => {
				console.log(`Product with ID ${id} deleted from database:`, result);
				return result;
			})
			.catch((err) => {
				console.error(
					`Error deleting product with ID ${id} from database:`,
					err
				);
			});
	}

	save() {
		const db = getDb();
		const collection = db?.collection("products");

		if (this._id) {
			return collection!
				.updateOne({ _id: this._id }, { $set: this })
				.then((result) => {
					console.log("Product updated in database:", result);
				})
				.catch((err) => {
					console.error("Error updating product to database:", err);
				});
		}

		return collection!
			.insertOne(this)
			.then((result) => {
				console.log("Product saved to database:", result);
			})
			.catch((err) => {
				console.error("Error saving product to database:", err);
			});
	}
}
