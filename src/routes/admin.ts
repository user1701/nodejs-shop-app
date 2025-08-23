import { Router } from "express";
import { deleteProduct, getAddProduct, postAddProduct } from "../controllers/products.ts";

const router = Router();

router.get("/products/add", getAddProduct);
router.post("/products", postAddProduct);
router.delete("/products/:id", deleteProduct);

export default router;
