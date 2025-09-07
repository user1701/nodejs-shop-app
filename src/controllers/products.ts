import type { Request, Response } from "express";
import edgeEngine from "../utils/edgeEngine.ts";
import ShopProducts, { Product } from "../model/product.ts";

const edge = edgeEngine.getInstance();

export const getProducts = async (req: Request, res: Response) => {
	const [products] = await ShopProducts.getAll();
	console.log(`Fetched ${products.length} products from database.`);

	const html = await edge.render("shop", { products, path: req.path });

	res.status(200).send(html);
};

export const getProduct = async (req: Request, res: Response) => {
	const productId = req.params.id;
	console.log(`Fetching product with ID: ${productId}`);

	if (!productId) {
		return res.status(400).send("Product ID is required.");
	}

	try {
		const [products] = await ShopProducts.getById(productId);
		const product = products[0] as Product | undefined;

		if (!product) {
			return res.status(404).send("Product not found.");
		} else {
			console.log("Product found:", product);
			const html = await edge.render("product", { product });
			res.status(200).send(html);
		}
	} catch (err: unknown) {
		console.error("Error fetching product:", err);
		res.status(500).send("Internal server error.");
	}
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
		return res.status(400).send("Product price is required.");
	}

	if (!description || description.trim().length === 0) {
		return res.status(400).send("Product description is required.");
	}

	const image = await fetch("https://dog.ceo/api/breeds/image/random");
	const imageData = (await image.json()) as { message: string };
	const productImageUrl = imageData.message;

	const product = {
		title,
		imageUrl: imageUrl || productImageUrl,
		description,
		price: parseFloat(price),
	} satisfies Omit<Product, "id">;

	try {
		const [result] = await ShopProducts.addProduct(product);
		console.log("Product added with ID:", result.insertId);

		res.redirect("/");
	} catch (err: unknown) {
		console.error("Error adding product:", err);
		return res.status(500).send("Internal server error.");
	}
};

export const deleteProduct = async (req: Request, res: Response) => {
	const productId = req.params.id;
	console.log(`Deleting product with ID: ${productId}`);
	if (!productId) {
		return res.status(400).send("Product ID is required.");
	}

	try {
		const [result] = await ShopProducts.removeProduct(productId);
		if (result.affectedRows === 0) {
			return res.status(404).send("Product not found.");
		}

		res.status(204).send();
	} catch (err: unknown) {
		console.error("Error deleting product:", err);
		return res.status(500).send("Internal server error.");
	}
};
