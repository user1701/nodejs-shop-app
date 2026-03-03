import type { Request, Response } from "express";
import Product from "../models/product.ts";
import type OrderItem from "@/models/order-item.ts";
import type Order from "@/models/order.ts";

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
	const products = await cart.getProducts({ nest: true });

	console.log("Cart fetched:", cart?.toJSON());

	const jsonProducts = products.map((p) => p.toJSON());
	console.log("Cart products (JSON):", jsonProducts);
	const total = jsonProducts.reduce(
		(sum, product) => product.price * product.CartItem.quantity + sum,
		0
	);

	res.render("cart", {
		cart: jsonProducts,
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
		const cart = await req.user.getCart();
		const [product] = await cart.getProducts({ where: { id: productId } });

		if (!product) {
			await cart.addProduct(productId);
		} else {
			await cart.addProduct(productId, {
				through: { quantity: (product.CartItem?.quantity || 1) + 1 },
			});
		}

		res.status(204).send("product added to cart");
	} catch (err: unknown) {
		console.error("Error finding product:", err);
		return res.status(500).send("Internal server error.");
	}
};

export const deleteCartProduct = async (req: Request, res: Response) => {
	const productId = req.params.id;

	try {
		const cart = await req.user.getCart();
		const [product] = await cart.getProducts({
			where: {
				id: productId,
			},
		});

		if (product) {
			product.CartItem?.destroy();
		}

		res.redirect("/cart");
	} catch (err: unknown) {
		console.error("Error deleting cart product:", err);
		return res.status(500).send("Internal server error.");
	}
};

// -- Order Controllers
export const getOrder = async (req: Request, res: Response) => {
	const orders = await req.user.getOrders({
		include: [Product],
		raw: true,
		nest: true,
	});

	res.render("orders", { path: req.path, orders });
};

export const createOrder = async (req: Request, res: Response) => {
	const cart = await req.user.getCart();
	const products = await cart.getProducts({ raw: true, nest: true });

	const order = await req.user.createOrder();

	await order.addProducts(
		// products.map((product) => {
		// 	product.OrderItem = {
		// 		quantity: product.CartItem!.quantity,
		// 	} as OrderItem;
		// 	return product;
		// })
        products
	);

	cart.setProducts(null);

	console.log("Order created:", order.toJSON());

	res.redirect("/orders");
};
