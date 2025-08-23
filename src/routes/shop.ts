import { Router } from "express";
import { getProduct, getProducts } from "../controllers/products.ts";
import { getCart, getShopHome, postAddToCart } from "../controllers/shop.ts";

const router = Router();

router.get("/", getShopHome);

router.get("/products", getProducts);
router.get("/products/:id", getProduct);

router.get("/cart", getCart);
router.post("/cart/add/:id", postAddToCart);

router.get("/checkout", getProducts);

export default router;
