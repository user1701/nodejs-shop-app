import { Router } from "express";
import { getProduct, getProducts } from "../controllers/products.ts";
import {
	addCartProduct,
	createOrder,
	deleteCartProduct,
	getCart,
	getOrder,
	getShopHome,
} from "../controllers/shop.ts";

const router = Router();

router.get("/", getShopHome);

router.get("/products", getProducts);
router.get("/products/:id", getProduct);

router.post("/cart/:id", addCartProduct).delete("/cart/:id", deleteCartProduct);
router.get("/cart", getCart);

router.get("/orders", getOrder).post("/orders", createOrder);

export default router;
