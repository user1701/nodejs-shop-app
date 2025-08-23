import type { IProduct } from "../types.ts";
import Storage, { FileStorage } from "../utils/storage.ts";
import { v4 as uuid } from "uuid";

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
	private storage: FileStorage<Product>;
	private productList = ProductList.getInstance();

	private constructor(storage: FileStorage<Product>) {
		this.storage = storage;
		this.syncData();
        // console.log('Shop: ', this.productList.getProducts())
	}

    static getInstance() {
        if(!Shop.instance) {
            Shop.instance = new Shop(new Storage("products"))
        }

        return this.instance
    }

	save(): void {
		this.storage.save(this.productList.getProducts());
	}

	syncData(): void {
		this.productList.clearProducts();
		const storedProducts = this.storage.getAll();

		if (storedProducts) {
			for (const product of storedProducts) {
				this.productList.addProduct(product);
			}
		}
	}

	addProduct(product: Omit<Product, "id">): void {
		const newProduct = new Product(
			product.title,
			product.imageUrl,
			product.description,
			product.price
		);

		this.productList.addProduct(newProduct);
		this.save();
	}

	removeProduct(id: string): void {
		this.productList.removeProduct(id);
		this.save();
	}

	getById(id: string): Product | undefined {
		return this.productList.getProducts().find((product) => product.id === id);
	}

	getAll(): Product[] {
		return this.productList.getProducts();
	}

	reset(): void {
		this.productList.clearProducts();
	}
}

export default Shop;
