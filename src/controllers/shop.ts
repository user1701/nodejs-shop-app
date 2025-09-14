import type { Request, Response } from "express";
import edgeEngine from "../utils/edgeEngine.ts";
import Product from "../models/product.ts";
import CartStorage from "../models/cart.ts";

const edge = edgeEngine.getInstance();

export const getShopHome = async (req: Request, res: Response) => {
	try {
		const products = await Product.findAll();
		const html = await edge.render("home", { products, path: req.path });

		res.status(200).send(html);
	} catch (err: unknown) {
		console.error("Error fetching products:", err);
		return res.status(500).send("Internal server error.");
	}
};

export const getAddProduct = async (req: Request, res: Response) => {
	const html = await edge.render("admin");

	res.status(200).send(html);
};

export const getCheckout = async (req: Request, res: Response) => {
	const html = await edge.render("checkout", {});

	res.status(200).send(html);
};

// -- Cart Controllers
export const getCart = async (req: Request, res: Response) => {
	const cart = [];

	const html = await edge.render("cart", {
		cart,
		// total: CartStorage.getTotalPrice(),
	});

	res.status(200).send(html);
};

export const postAddToCart = async (req: Request, res: Response) => {
	const productId = req.params.id;
	console.log("Adding product to cart", productId);
	if (!productId) {
		return res.status(400).send("Product ID is required.");
	}

	const product = Product.findOne({ where: { id: productId } });
	if (!product) {
		return res.status(404).send("Product not found.");
	}

	res.redirect("/cart");
};
