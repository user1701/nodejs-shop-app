import type { Request, Response } from "express";
import User from "@/models/user.ts";
import Product from "@/models/product.ts";
import Order from "@/models/order.ts";

export const getShopHome = async (req: Request, res: Response) => {
	try {
		const products = await Product.find();

		res.render("home", {
			products,
			path: req.path,
			isAuthenticated: req.session.isAuthenticated,
		});
	} catch (err: unknown) {
		console.error("Error fetching products:", err);
		return res.status(500).send("Internal server error.");
	}
};

export const getAddProduct = async (req: Request, res: Response) => {
	res.render("admin", {
		path: req.path,
		isAuthenticated: req.session.isAuthenticated,
		title: "Add Product",
	});
};

export const getCheckout = async (req: Request, res: Response) => {
	res.render("checkout", {
		path: req.path,
		isAuthenticated: req.session.isAuthenticated,
	});
};

// -- Cart Controllers
export const getCart = async (req: Request, res: Response) => {
	const cart = await User.findOne({ _id: req.session.user._id })
		.populate("cart.items.id")
		.then((user) => user.cart.items);

	console.log("Cart fetched:", cart);

	const total = cart.reduce(
		(sum, product) => product.id.price * product.quantity + sum,
		0
	);

	res.render("cart", {
		cart,
		total: total.toFixed(2),
		path: req.path,
		isAuthenticated: req.session.isAuthenticated,
	});
};

export const addCartProduct = async (req: Request, res: Response) => {
	const productId = req.params.id;
	console.log("Adding product to cart", productId);

	if (!productId) {
		return res.status(400).send("Product ID is required.");
	}

	try {
		await User.findOne({ _id: req.session.user._id }).then((user) =>
			user.addCartItem(productId)
		);

		res.status(204).send("product added to cart");
	} catch (err: unknown) {
		console.error("Error finding product:", err);
		return res.status(500).send("Internal server error.");
	}
};

export const deleteCartProduct = async (req: Request, res: Response) => {
	const productId = req.params.id;

	try {
		await User.findOne({ _id: req.session.user._id }).then((user) =>
			user.deleteCartItem(productId)
		);

		res.redirect("/cart");
	} catch (err: unknown) {
		console.error("Error deleting cart product:", err);
		return res.status(500).send("Internal server error.");
	}
};

// -- Order Controllers
export const getOrder = async (req: Request, res: Response) => {
	const orders = await Order.find({ user: req.session.user._id });

	res.render("orders", {
		path: req.path,
		orders,
		isAuthenticated: req.session.isAuthenticated,
	});
};

export const createOrder = async (req: Request, res: Response) => {
	User.findOne({ _id: req.session.user._id })
		.populate("cart.items.id")
		.then((user) => {
			return user;
		})
		.then((user) => {
			const orderItems = user?.cart?.items.map((item: any) => ({
				quantity: item.quantity,
				product: { ...item.id._doc },
			}));

			const order = new Order({
				user: req.session.user._id,
				items: orderItems,
			});

			console.log("Creating order with items:", order);
			order.save();

			user.cart.items = [];
			return user.save();
		});

	res.redirect("/orders");
};
