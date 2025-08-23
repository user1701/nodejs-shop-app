import type { IProduct } from "../types.ts";
import { FileStorage } from "../utils/storage.ts";
import { ProductList } from "./product.ts";

export interface ICartProduct {
	id: IProduct["id"];
	quantity: number;
}

interface ReturnCartProducts extends IProduct {
	quantity: number;
}

export class Cart<TCartProduct extends ICartProduct> {
	private storage: FileStorage<TCartProduct>;
	private productList: ProductList;
	private products: Map<TCartProduct["id"], TCartProduct> = new Map();

	constructor(storage: FileStorage<TCartProduct>) {
		this.storage = storage;
		this.productList = ProductList.getInstance();
		this.syncData();
	}

	private save(): void {
		this.storage.save(Array.from(this.products.values()));
	}

	private syncData(): void {
		this.productList.clearProducts();
		const storedProducts = this.storage.getAll();

		if (storedProducts !== null) {
			this.reset();
			for (let i = 0; i < storedProducts.length; i++) {
				const product = storedProducts[i]!;
				this.products.set(product.id, product);
			}
		}
	}

	addProduct(product: TCartProduct): void {
		this.products.set(product.id, product);
		this.save();
	}

	removeProduct(id: string): void {
		if (!this.products.has(id) || this.products.get(id) === undefined) {
			throw new Error(`Product with id ${id} does not exist.`);
		}

		this.products.delete(id);
		this.save();
	}

	getAll(): ReturnCartProducts[] {
		return Array.from(this.products.values()).map((cartProduct) => {
			const product = this.productList.getById(cartProduct.id);

			return { ...product, ...cartProduct };
		});
	}

	getTotalPrice(): number {
		if (this.products.size === 0) {
			return 0;
		}

		const total = Array.from(this.products.values()).reduce(
			(total, cartProduct) => {
				const product = this.productList.getById(cartProduct.id);
				const productCost = product.price * cartProduct.quantity;

				return total + productCost;
			},
			0
		);

		return total;
	}

	reset(): void {
		this.products = new Map();
	}
}

class CartSingleton extends Cart<ICartProduct> {
	private static instance: CartSingleton;

	private constructor() {
		super(new FileStorage("cart"));
	}

	static getInstance(): CartSingleton {
		if (!CartSingleton.instance) {
			CartSingleton.instance = new CartSingleton();
		}
		return CartSingleton.instance;
	}
}

export default CartSingleton.getInstance();
