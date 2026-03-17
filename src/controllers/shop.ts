import type { NextFunction, Request, Response } from "express";
import User, { type IUser } from "@/models/user.ts";
import Product, { type IProduct } from "@/models/product.ts";
import Order from "@/models/order.ts";
import type { Document, PopulatedDoc } from "mongoose";
import path from "path";
import * as fs from "node:fs";

export const getShopHome = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const products = await Product.find();
		res.render("home", {
			products,
			path: req.path,
			isAuthenticated: req.session.isAuthenticated,
		});
	} catch (err: unknown) {
		console.error("Error fetching products:", err);
		if (typeof err === "string") {
			next(new Error(err));
		} else if (err instanceof Error) {
			next(err);
		}
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

function isPopulatedProduct(
	id: PopulatedDoc<IProduct & Document>
): id is IProduct {
	return id != null && typeof id === "object" && "price" in id;
}

function calcTotal(
	items: { quantity: number; id: PopulatedDoc<IProduct & Document> }[]
): number {
	console.log(items);
	return items.reduce((sum, product) => {
		if (isPopulatedProduct(product.id)) {
			return product.id.price * product.quantity + sum;
		} else {
			return sum;
		}
	}, 0);
}

export const getCart = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const cart = await User.findOne({ _id: req.session.user._id })
		.populate("cart.items.id")
		.orFail()
		.then((user: IUser) => {
			if (user) {
				return user.cart.items.filter((item) => item.id !== null);
			} else {
				throw new Error("User not found");
			}
		})
		.then((items) => {
			const total = calcTotal(items);

			res.render("cart", {
				cart: items,
				total: total.toFixed(2),
				path: req.path,
				isAuthenticated: req.session.isAuthenticated,
			});
		})
		.catch((err) => {
			if (typeof err === "string") {
				next(new Error(err));
			} else if (err instanceof Error) {
				next(err);
			}
		});

	console.log("Cart fetched:", cart);

	try {
		// if (Array.isArray(cart)) {
		// 	const total = cart.reduce(
		// 		(sum, product) => product.id.price * product.quantity + sum,
		// 		0
		// 	);
		// 	res.render("cart", {
		// 		cart,
		// 		total: total.toFixed(2),
		// 		path: req.path,
		// 		isAuthenticated: req.session.isAuthenticated,
		// 	});
		// } else {
		// 	throw new Error("Error cart fetching");
		// }
	} catch (err) {
		console.error("Error fetching products:", err);
		if (typeof err === "string") {
			next(new Error(err));
		} else if (err instanceof Error) {
			next(err);
		}
	}
};

export const addCartProduct = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const productId = req.params.id;
	console.log("Adding product to cart", productId);

	if (!productId) {
		return res.status(400).send("Product ID is required.");
	}

	try {
		await User.findOne({ _id: req.session.user._id }).then((user) => {
			if (user) {
				user.addCartItem(productId);
			} else {
				throw new Error("User not found");
			}
		});

		res.status(204).send("product added to cart");
	} catch (err: unknown) {
		console.error("Error finding product:", err);
		if (typeof err === "string") {
			next(new Error(err));
		} else if (err instanceof Error) {
			next(err);
		}
	}
};

export const deleteCartProduct = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const productId = req.params.id;

	try {
		if (productId === undefined) {
			throw new Error("Missing product id");
		}

		await User.findOne({ _id: req.session.user._id }).then((user) => {
			if (user) {
				user.deleteCartItem(productId);
			} else {
				throw new Error("User not found");
			}
		});

		res.redirect("/cart");
	} catch (err: unknown) {
		console.error("Error deleting cart product:", err);
		if (typeof err === "string") {
			next(new Error(err));
		} else if (err instanceof Error) {
			next(err);
		}
	}
};

// -- Order Controllers
export const getOrder = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const orders = await Order.find({ user: req.session.user._id });

		res.render("orders", {
			path: req.path,
			orders,
			isAuthenticated: req.session.isAuthenticated,
		});
	} catch (err) {
		if (typeof err === "string") {
			next(new Error(err));
		} else if (err instanceof Error) {
			next(err);
		}
	}
};

export const createOrder = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	User.findOne({ _id: req.session.user._id })
		.populate("cart.items.id")
		.then((user) => {
			if (!user) {
				throw new Error("Error populating user cart items from db");
			}

			type CartItem = IUser["cart"]["items"][number];
			const orderItems = user.cart.items
				.filter(
					(item): item is CartItem & { id: IProduct } =>
						item.id != null && typeof item.id !== "string"
				)
				.map((item) => ({
					quantity: item.quantity,
					product: item.id.toObject(),
				}));

			const order = new Order({
				user: req.session.user._id,
				items: orderItems,
			});

			console.log("Creating order with items:", order);
			order.save();

			user.cart.items = [];
			user.save();
		})
		.catch((err) => {
			if (typeof err === "string") {
				next(new Error(err));
			} else if (err instanceof Error) {
				next(err);
			}
		});

	res.redirect("/orders");
};

export const getInvoice = (req: Request, res: Response, next: NextFunction) => {
	const { id } = req.params;
    const invoiceName = `invoice-${id}.pdf`;
	try {
        const invoicePath = path.join(__dirname, "..", "data", "invoices", invoiceName);
        fs.readFile(invoicePath, (err, data) => {
            if (err) {
                throw new Error("Invoice not found");
            }
            res.setHeader("Content-Type", "application/pdf");
            res.send(data);
        });
	} catch (err) {
		if (typeof err === "string") {
			next(new Error(err));
		} else if (err instanceof Error) {
			next(err);
		}
	}
};
