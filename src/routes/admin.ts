import { Router } from "express";
import { getAddProduct, postAddProduct } from "../controllers/products.ts";

const router = Router();

router.get("/products/add", getAddProduct);
router.post("/products/add", postAddProduct);

export default router;
