import type { Request, Response } from "express";
import Product from "@/models/product.ts";
import { matchedData, validationResult } from "express-validator";

export const getProducts = async (req: Request, res: Response) => {
	const products = await Product.find();
	console.log(`Fetched ${products.length} products.`);
	return res.render("shop", {
		products,
		path: req.path,
		isAuthenticated: req.session.isAuthenticated,
	});
};

export const getMyProducts = async (req: Request, res: Response) => {
	if (!req.session.user) {
		return res.status(401).send("Unauthorized: No user logged in.");
	}

	const products = await Product.find({ userId: req.session.user._id });
	return res.render("shop", {
		products: products,
		path: req.path,
		title: "My Products",
		isAuthenticated: req.session.isAuthenticated,
	});
};

export const getProduct = async (req: Request, res: Response) => {
	const productId = req.params.id;
	console.log(`Fetching product with ID: ${productId}`);

	if (!productId) {
		return res.status(400).send("Product ID is required.");
	}

	try {
		const product = await Product.findById(productId);

		if (!product) {
			return res.status(404).send("Product not found.");
		}

		return res.render("product", {
			product,
			isAuthenticated: req.session.isAuthenticated,
		});
	} catch (err: unknown) {
		console.error("Error fetching product:", err);
		res.status(500).send("Internal server error.");
	}
};

export const getAddProduct = async (req: Request, res: Response) => {
	return res.render("add-product", {
		path: req.path,
		isAuthenticated: req.session.isAuthenticated,
		errors: {},
		data: {
			title: "",
			imageUrl: "",
			description: "",
			price: "",
		},
	});
};

export const postAddProduct = async (req: Request, res: Response) => {
	const { title = "", imageUrl = "", description, price } = req.body;
	console.log("%s adding a new product", req.path);

	const errors = validationResult(req);
	const data = matchedData(req, {
		includeOptionals: true,
		onlyValidData: false,
	});

	if (!errors.isEmpty()) {
		return res.status(422).render("add-product", {
			isAuthenticated: req.session.isAuthenticated,
			errors: errors.mapped(),
			data,
		});
		// .render("add-product", {
		// 	path: req.path,
		// 	isAuthenticated: req.session.isAuthenticated,
		// 	errors: errors.mapped(),
		// 	data: {
		// 		title,
		// 		imageUrl,
		// 		description,
		// 		price,
		// 	},
		// });
	}

	const image = await fetch("https://dog.ceo/api/breeds/image/random");
	const imageData = (await image.json()) as { message: string };
	const productImageUrl = imageData.message;

	const product = new Product({
		title,
		imageUrl: imageUrl || productImageUrl,
		description,
		price: price,
		userId: req.session.user._id,
	});

	try {
		await product.save();
		console.log("Product saved successfully:", product);
		return res.redirect("/products/my");
	} catch (err: unknown) {
		console.error("Error adding product:", err);
		return res.status(500).send("Internal server error.");
	}
};

export const getEditProduct = async (req: Request, res: Response) => {
	const productId = req.params.id;
	console.log(`Editing product with ID: ${productId}`);
	if (!productId) {
		return res.status(400).send("Product ID is required.");
	}

	try {
		const product = await Product.findById(productId);

		if (!product) {
			return res.status(404).send("Product not found.");
		}

		if (!product.userId.equals(req.session.user._id)) {
			return res.redirect("/products/my");
		}

		return res.render("edit-product", {
			product: product,
			isAuthenticated: req.session.isAuthenticated,
		});
	} catch (err: unknown) {
		console.error("Error finding product:", err);
		return res.status(500).send("Internal server error.");
	}
};

export const updateProduct = async (req: Request, res: Response) => {
	const { _id, title, imageUrl, description, price } = req.body;
	console.log(`Updating product with ID: ${req.params.id}`);

	try {
		if (!_id) {
			return res.status(400).send("Product ID is required.");
		}

		const product = await Product.findById(_id);

		if (!product) {
			return res.redirect("/products/my");
		}

		if (!product.userId.equals(req.session.user._id)) {
			return res.redirect("/products/my");
		}

		const errors = validationResult(req);
		const productData = matchedData(req, {
			includeOptionals: true,
			onlyValidData: false,
		});
        console.log(errors)
		console.log(productData);
		if (!errors.isEmpty()) {
			return res.render("edit-product", {
				product: productData,
				errors: errors.mapped(),
				isAuthenticated: req.session.isAuthenticated,
			});
		}

		product.title = title;
		product.imageUrl = imageUrl;
		product.description = description;
		product.price = price;

		await product.save();

		return res.status(200).redirect("/products/my");
	} catch (err: unknown) {
		console.error("Error finding product:", err);
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
		const product = await Product.findOne({ _id: productId });
		if (!product) {
			return res.status(400).send("Product not found.");
		}
		if (product.userId.equals(req.session.user._id)) {
			await Product.deleteOne({ _id: productId });
			return res.redirect("/products/my");
		} else {
			req.flash("error", "Product not found.");
			return res.redirect("/products/my");
		}
	} catch (err: unknown) {
		console.error("Error deleting product:", err);
		return res.status(500).send("Internal server error.");
	}
};
