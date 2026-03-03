import type { Request, Response } from "express";
import Product from "../models/product.ts";

export const getProducts = async (req: Request, res: Response) => {
	const products = await Product.findAll();
	console.log(`Fetched ${products.length} products from database.`);

	res.render("shop", { products, path: req.path });
};

export const getMyProducts = async (req: Request, res: Response) => {
	if (!req.user) {
		return res.status(401).send("Unauthorized: No user logged in.");
	}

	const products = await req.user.getProducts();
	console.log(`Fetched ${products.length} products for user ${req.user.id}.`);

	res.render("shop", {
		products,
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
		const product = await Product.findOne({ where: { id: productId } });
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

	const image = await fetch("https://dog.ceo/api/breeds/image/random");
	const imageData = (await image.json()) as { message: string };
	const productImageUrl = imageData.message;

	try {
		const newProduct = await req.user.createProduct({
			title,
			imageUrl: imageUrl || productImageUrl,
			description,
			price: parseFloat(price),
		});
		// const newProduct = await Product.create(product);
		console.log("Product added with ID: ", newProduct);

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
		const [product] = await req.user.getProducts({ where: { id: productId } });
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
		const [affectedRows] = await Product.update(
			{
				title,
				imageUrl,
				description,
				price,
			},
			{ where: { id } }
		);
		if (affectedRows === 0) {
			return res.status(404).send("Product not found or no changes made.");
		}

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
		const result = await req.user
			.getProducts({ where: { id: productId } })
			.then(([product]) => {
				if (product) {
					product.destroy();
					return product.id;
				}
				return 0;
			});
		// const result = await Product.destroy({ where: { id: productId } });
		console.log("Delete operation result:", result);

		if (result === 0) {
			return res.status(404).send("Product not found.");
		}

		res.status(204).send();
	} catch (err: unknown) {
		console.error("Error deleting product:", err);
		return res.status(500).send("Internal server error.");
	}
};
