import { Router } from "express";
import {
	deleteProduct,
	getAddProduct,
	getEditProduct,
	getMyProducts,
	postAddProduct,
	updateProduct,
} from "@/controllers/products.ts";
import { isAuthenticated } from "@/middleware/protectedRoutes.ts";

const router = Router();

router.get("/products/my", isAuthenticated, getMyProducts);

router.get("/products/add", isAuthenticated, getAddProduct);
router.delete("/products/:id", isAuthenticated, deleteProduct);

router.get("/products/edit/:id", isAuthenticated, getEditProduct);
router.route("/products").post(isAuthenticated, postAddProduct).put(isAuthenticated, updateProduct);

export default router;
