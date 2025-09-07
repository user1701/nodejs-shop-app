import type { IProduct } from "../types.ts";
import { v4 as uuid } from "uuid";
import Database from "../utils/db.ts";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
export class Product implements IProduct {
	public id: string;

	constructor(
		public title: string,
		public imageUrl: string = "",
		public description: string = "",
		public price: number = 0
	) {
		if (!title) {
			throw new Error("Product title is required.");
		}

		this.id = uuid();
		this.title = title;
		this.imageUrl = imageUrl;
		this.description = description;
		this.price = price;
	}
}

export class ProductList {
	private static instance: ProductList;
	private products: Map<Product["id"], Product> = new Map();

	private constructor() {}

	static getInstance(): ProductList {
		if (!ProductList.instance) {
			ProductList.instance = new ProductList();
		}

		return this.instance;
	}

	addProduct(product: Product): void {
		this.products.set(product.id, product);
	}

	removeProduct(id: string): void {
		if (!this.products.has(id) || this.products.get(id) === undefined) {
			throw new Error(`Product with id ${id} does not exist.`);
		}

		this.products.delete(id);
	}

	getById(id: string) {
		if (!this.products.has(id) || this.products.get(id) === undefined) {
			throw new Error(`Product with id ${id} does not exist.`);
		}

		return this.products.get(id)!;
	}

	getProducts(): Product[] {
		return this.products.values() ? Array.from(this.products.values()) : [];
	}

	clearProducts(): void {
		this.products = new Map();
	}
}

export class Shop {
	private static instance: Shop;
	private db = Database.getInstance().pool;

	private constructor() {}

	static getInstance() {
		if (!Shop.instance) {
			Shop.instance = new Shop();
		}

		return this.instance;
	}

	addProduct(product: Omit<IProduct, "id">) {
		return this.db.execute<ResultSetHeader>(
			"INSERT INTO products (title, imageUrl, description, price) VALUES (?, ?, ?, ?)",
			[product.title, product.imageUrl, product.description, product.price]
		);
	}

	removeProduct(id: string) {
		if (!id) {
			throw new Error("Product ID is required.");
		}

		return this.db.execute<ResultSetHeader>("DELETE FROM products WHERE id = ?", [id]);
	}

	getById(id: string) {
		return this.db.execute<RowDataPacket[]>(
			"SELECT * FROM products WHERE id = ?",
			[id]
		);
	}

	getAll() {
		return this.db.execute<RowDataPacket[]>("SELECT * FROM products");
	}
}

export default Shop.getInstance();
