import { Router } from "express";
import { getProduct, getProducts } from "@/controllers/products.ts";
import {
	addCartProduct,
	createOrder,
	deleteCartProduct,
	getCart,
	getOrder,
	getShopHome,
} from "../controllers/shop.ts";
import { isAuthenticated } from "@/middleware/protectedRoutes.ts";

const router = Router();

router.get("/", getShopHome);

router.get("/products", getProducts);
router.get("/products/:id", getProduct);

router.post("/cart/:id", isAuthenticated, addCartProduct).delete("/cart/:id", isAuthenticated, deleteCartProduct);
router.get("/cart", isAuthenticated, getCart);

router.get("/orders", isAuthenticated, getOrder).post("/orders", isAuthenticated, createOrder);

export default router;
