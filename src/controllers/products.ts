import type { Request, Response } from "express";
import Product from "@/models/product.ts";

export const getProducts = async (req: Request, res: Response) => {
	const products = await Product.find();
	console.log("Products fetched from database:", products);
	// console.log(`Fetched ${products.length} products.`);
	res.render("shop", { products, path: req.path });
};

export const getMyProducts = async (req: Request, res: Response) => {
	if (!req.session.user) {
		return res.status(401).send("Unauthorized: No user logged in.");
	}

	const products = await Product.find({ userId: req.session.user._id });
	res.render("shop", {
		products: products,
		path: req.path,
		title: "My Products",
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
		console.log("Product fetched from database:", product);

		if (!product) {
			return res.status(404).send("Product not found.");
		} else {
			console.log("Product found:", product);
			res.render("product", { product });
		}
	} catch (err: unknown) {
		console.error("Error fetching product:", err);
		res.status(500).send("Internal server error.");
	}
};

export const getAddProduct = async (req: Request, res: Response) => {
	res.render("add-product", {
		path: req.path,
	});
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

	if (!req.session.user) {
		return res.status(401).send("Unauthorized: No user logged in.");
	}

	const image = await fetch("https://dog.ceo/api/breeds/image/random");
	const imageData = (await image.json()) as { message: string };
	const productImageUrl = imageData.message;

	const product = new Product({
		title,
		imageUrl: imageUrl || productImageUrl,
		description,
		price: parseFloat(price),
		userId: req.session.user._id,
	});

	try {
		await product.save();
		console.log("Product saved successfully:", product);
		res.redirect("/");
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

		res.render("edit-product", { product: product });
	} catch (err: unknown) {
		console.error("Error finding product:", err);
		return res.status(500).send("Internal server error.");
	}
};

export const updateProduct = async (req: Request, res: Response) => {
	const { id, title, imageUrl, description, price } = req.body;
	console.log(`Updating product with ID: ${id}`);
	if (!id) {
		return res.status(400).send("Product ID is required.");
	}

	try {
		const product = await Product.findById(id);

		if (!product) {
			return res.status(404).send("Product not found.");
		}

		product.title = title;
		product.imageUrl = imageUrl;
		product.description = description;
		product.price = price;

		await product.save();

		res.status(200).send("Product updated successfully.");
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
		const result = await Product.deleteOne({ _id: productId });
		console.log("Delete operation result:", result);

		if (result?.deletedCount === 0) {
			return res.status(404).send("Product not found.");
		}

		res.status(204).send();
	} catch (err: unknown) {
		console.error("Error deleting product:", err);
		return res.status(500).send("Internal server error.");
	}
};
