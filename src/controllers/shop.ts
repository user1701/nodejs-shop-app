import type { Request, Response } from "express";
import edgeEngine from "../utils/edgeEngine.ts";
import Shop from "../model/product.ts";
import CartStorage from "../model/cart.ts";

const ProductStorage = Shop.getInstance()

const edge = edgeEngine.getInstance();

export const getShopHome = async (req: Request, res: Response) => {
	const products = ProductStorage.getAll();

	const html = await edge.render("home", { products, path: req.path });

	res.status(200).send(html);
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
	const cart = CartStorage.getAll();
	console.log('getCart: ', cart);
	const html = await edge.render("cart", {
		cart,
		total: CartStorage.getTotalPrice(),
	});

	res.status(200).send(html);
};

export const postAddToCart = async (req: Request, res: Response) => {
	const productId = req.params.id;
	console.log("Adding product to cart", productId);
	if (!productId) {
		return res.status(400).send("Product ID is required.");
	}

	const product = ProductStorage.getById(productId);
	if (!product) {
		return res.status(404).send("Product not found.");
	}

	CartStorage.addProduct({ id: product.id, quantity: 1 });
	res.redirect("/cart");
};
