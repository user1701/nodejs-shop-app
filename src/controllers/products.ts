import type { Request, Response } from "express";
import edgeEngine from "../utils/edgeEngine.ts";
import Shop, { Product } from "../model/product.ts";

const ShopProducts = Shop.getInstance()

const edge = edgeEngine.getInstance();

export const getProducts = async (req: Request, res: Response) => {
	const products = ShopProducts.getAll();
    console.log('ProductsController: ', ShopProducts)

	const html = await edge.render("shop", { products, path: req.path });

	res.status(200).send(html);
};

export const getProduct = async (req: Request, res: Response) => {
	const productId = req.params.id;
	console.log(`Fetching product with ID: ${productId}`);

	if (!productId) {
		return res.status(400).send("Product ID is required.");
	}

	const product = ShopProducts.getById(productId);
	if (!product) {
		return res.status(404).send("Product not found.");
	}
	const html = await edge.render("product", { product });
	res.status(200).send(html);
};

export const getAddProduct = async (req: Request, res: Response) => {
	const html = await edge.render("add-product");

	res.status(200).send(html);
};

export const postAddProduct = async (req: Request, res: Response) => {
	const { title = "", imageUrl, description, price } = req.body;

	if (!title) {
		return res.status(400).send("Product title is required.");
	}

	if (!price || isNaN(parseFloat(price))) {
		return res.status(400).send("Valid product price is required.");
	}

	const image = await fetch("https://dog.ceo/api/breeds/image/random");
	const imageData = (await image.json()) as { message: string };
	const productImageUrl = imageData.message;

	const product = {
		title,
		imageUrl: imageUrl || productImageUrl,
		description,
		"price": parseFloat(price),
	} satisfies Omit<Product, "id">;

	ShopProducts.addProduct(product);

	res.redirect("/");
};

export const deleteProduct = async (req: Request, res: Response) => {
	const productId = req.params.id;
	console.log(`Deleting product with ID: ${productId}`);
	if (!productId) {
		return res.status(400).send("Product ID is required.");
	}

	const product = ShopProducts.getById(productId);
	if (!product) {
		return res.status(404).send("Product not found.");
	}

	ShopProducts.removeProduct(productId);
	res.status(204).send();
};
