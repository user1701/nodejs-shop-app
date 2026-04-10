import type { NextFunction, Request, Response } from "express";
import Product from "./../models/product.ts";
import { matchedData, validationResult } from "express-validator";
import mongoose from "mongoose";
import { getUploadedFilePath } from "./../utils/getUploadedFilePath.ts";
import { deleteFile } from "./../utils/fs.ts";
import { ITEMS_PER_PAGE } from "./../constants/index.ts";
import { getPageInfo } from "./../utils/pagination.ts";

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(String(req.query.page ?? ""), 10) || 1;
    const perPage = parseInt(String(req.query.perPage ?? ""), 10) || ITEMS_PER_PAGE;
    try {
        const totalItems = await Product.find().countDocuments();
        const products = await Product.find()
            .skip((page - 1) * perPage)
            .limit(perPage);

        const pager = getPageInfo(page, perPage, totalItems);

        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.setHeader("Pragma", "no-cache"); // For older HTTP/1.0 compatibility
        res.setHeader("Expires", "0");

        return res.render("shop", {
            products,
            path: req.path,
            isAuthenticated: req.session.isAuthenticated,
            pager,
        });
    } catch (err: unknown) {
        if (typeof err === "string") {
            next(new Error(err));
        } else if (err instanceof Error) {
            next(err);
        }
    }
};

export const getMyProducts = async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(String(req.query.page ?? ""), 10) || 1;
    const perPage = parseInt(String(req.query.perPage ?? ""), 10) || ITEMS_PER_PAGE;
    if (!req.session.user) {
        return res.status(401).send("Unauthorized: No user logged in.");
    }

    try {
        const totalItems = await Product.find({
            userId: req.session.user._id,
        }).countDocuments();
        const products = await Product.find({ userId: req.session.user._id })
            .skip((page - 1) * perPage)
            .limit(perPage);

        const pager = getPageInfo(page, perPage, totalItems);
        return res.render("shop", {
            products: products,
            path: req.path,
            title: "My Products",
            isAuthenticated: req.session.isAuthenticated,
            pager,
        });
    } catch (err: unknown) {
        if (typeof err === "string") {
            next(new Error(err));
        } else if (err instanceof Error) {
            next(err);
        }
    }
};

export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
    const productId = req.params.id;

    if (!productId) {
        return res.status(400).send("Product ID is required.");
    }

    if (!mongoose.isValidObjectId(productId)) {
        return res.redirect("/products");
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
        if (typeof err === "string") {
            next(new Error(err));
        } else if (err instanceof Error) {
            next(err);
        }
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

export const postAddProduct = async (req: Request, res: Response, next: NextFunction) => {
    const { title = "", description, price } = req.body;
    const image = req.file;

    const errors = validationResult(req);
    const data = matchedData(req, {
        includeOptionals: true,
        onlyValidData: false,
    });

    if (!errors.isEmpty() || !image) {
        return res.status(422).render("add-product", {
            isAuthenticated: req.session.isAuthenticated,
            errors: errors.mapped(),
            data,
        });
    }

    // const image = await fetch("https://dog.ceo/api/breeds/image/random");
    // const imageData = (await image.json()) as { message: string };
    // const productImageUrl = imageData.message;

    const product = new Product({
        title,
        imageUrl: getUploadedFilePath(image),
        description,
        price: price,
        userId: req.session.user._id,
    });

    try {
        await product.save();
        return res.redirect("/products/my");
    } catch (err: unknown) {
        console.error("Error adding product:", err);

        if (typeof err === "string") {
            next(new Error(err));
        } else if (err instanceof Error) {
            next(err);
        }
    }
};

export const getEditProduct = async (req: Request, res: Response, next: NextFunction) => {
    const productId = req.params.id;
    if (!productId) {
        return res.redirect("/products/my");
    }

    if (!mongoose.isValidObjectId(productId)) {
        return res.redirect("/products/my");
    }

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).send("Product not found.");
        }

        if (product.userId && !product.userId.equals(req.session.user._id)) {
            return res.redirect("/products/my");
        }

        return res.render("edit-product", {
            product: product,
            isAuthenticated: req.session.isAuthenticated,
        });
    } catch (err: unknown) {
        console.error("Error finding product:", err);
        if (typeof err === "string") {
            next(new Error(err));
        } else if (err instanceof Error) {
            next(err);
        }
    }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    const { _id, title, description, price } = req.body;
    const image = req.file;

    try {
        if (!_id) {
            throw new Error("Product ID is required.");
        }

        if (!mongoose.isValidObjectId(_id)) {
            return res.redirect("/products/my");
        }

        const product = await Product.findById(_id);

        if (!product) {
            throw new Error(`Product with an ID: ${_id} not found!`);
        }

        if (product.userId && !product.userId.equals(req.session.user._id)) {
            throw new Error(`Product belongs to another user id: ${product.userId}`);
        }

        const errors = validationResult(req);
        const productData = matchedData(req, {
            includeOptionals: true,
            onlyValidData: false,
        });

        if (!errors.isEmpty()) {
            return res.render("edit-product", {
                product: productData,
                errors: errors.mapped(),
                isAuthenticated: req.session.isAuthenticated,
            });
        }

        product.title = title;
        if (image) {
            await deleteFile("public" + product.imageUrl);
            product.imageUrl = getUploadedFilePath(image);
        }
        product.description = description;
        product.price = price;

        await product.save();

        return res.status(200).redirect("/products/my");
    } catch (err: unknown) {
        console.error("Error finding product:", err);
        if (typeof err === "string") {
            next(new Error(err));
        } else if (err instanceof Error) {
            next(err);
        }
    }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    const productId = req.params.id;

    try {
        if (!productId) {
            throw new Error("Product ID is required.");
        }

        if (!mongoose.isValidObjectId(productId)) {
            throw new Error("Invalid product id");
        }

        const product = await Product.findOne({ _id: productId });

        if (!product) {
            throw new Error(`Product with an id: ${productId} not found.`);
        }

        await deleteFile("public" + product.imageUrl);

        if (product.userId && product.userId.equals(req.session.user._id)) {
            await Product.deleteOne({ _id: productId });
            return res.redirect("/");
        } else {
            throw new Error("Product belongs to another user!");
        }
    } catch (err: unknown) {
        console.error("Error deleting product:", err);
        if (typeof err === "string") {
            next(new Error(err));
        } else if (err instanceof Error) {
            next(err);
        }
    }
};
