import { Router } from "express";
import {
	deleteProduct,
	getAddProduct,
	getEditProduct,
	getMyProducts,
	postAddProduct,
	updateProduct,
} from "../controllers/products.ts";

const router = Router();

router.get("/products/my", getMyProducts);

router.get("/products/add", getAddProduct);
router.delete("/products/:id", deleteProduct);
router.get("/products/edit/:id", getEditProduct);
router.route("/products").post(postAddProduct).put(updateProduct);
export default router;
