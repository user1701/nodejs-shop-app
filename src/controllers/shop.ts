import type { Request, Response } from "express";
import { Product } from "@/models/product.ts";
import type OrderItem from "@/models/mysql/order-item.ts";
import type Order from "@/models/mysql/order.ts";

export const getShopHome = async (req: Request, res: Response) => {
	try {
		const products = await Product.findAll();

		res.render("home", { products, path: req.path });
	} catch (err: unknown) {
		console.error("Error fetching products:", err);
		return res.status(500).send("Internal server error.");
	}
};

export const getAddProduct = async (req: Request, res: Response) => {
	res.render("admin", { path: req.path });
};

export const getCheckout = async (req: Request, res: Response) => {
	res.render("checkout", { path: req.path });
};

// -- Cart Controllers
export const getCart = async (req: Request, res: Response) => {
	const cart = await req.user.getCart();

	console.log("Cart fetched:", cart);

	const total = cart.reduce(
		(sum, product) => product.price * product.quantity + sum,
		0
	);

	res.render("cart", {
		cart,
		total: total.toFixed(2),
		path: req.path,
	});
};

export const addCartProduct = async (req: Request, res: Response) => {
	const productId = req.params.id;
	console.log("Adding product to cart", productId);

	if (!productId) {
		return res.status(400).send("Product ID is required.");
	}

	try {
		await req.user.addCartItem(productId);

		res.status(204).send("product added to cart");
	} catch (err: unknown) {
		console.error("Error finding product:", err);
		return res.status(500).send("Internal server error.");
	}
};

export const deleteCartProduct = async (req: Request, res: Response) => {
	const productId = req.params.id;

	try {
		await req.user.deleteCartItem(productId);

		res.redirect("/cart");
	} catch (err: unknown) {
		console.error("Error deleting cart product:", err);
		return res.status(500).send("Internal server error.");
	}
};

// -- Order Controllers
export const getOrder = async (req: Request, res: Response) => {
	const orders = await req.user.getOrders();

	res.render("orders", { path: req.path, orders });
};

export const createOrder = async (req: Request, res: Response) => {
	await req.user.placeOrder();
	console.log("Order created successfully");

	res.redirect("/orders");
};
