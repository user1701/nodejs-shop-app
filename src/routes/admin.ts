import { Router } from "express";
import {
    deleteProduct,
    getAddProduct,
    getEditProduct,
    getMyProducts,
    postAddProduct,
    updateProduct,
} from "./../controllers/products.ts";
import { isAuthenticated } from "./../middleware/protectedRoutes.ts";
import { body } from "express-validator";

const productBodyValidation = () => [
    body("title", "Title is required!")
        .trim()
        // .withMessage("Please enter a title using only letters (A–Z) and numbers.")
        .isLength({ min: 3, max: 40 })
        .withMessage("Please enter a title that’s at least 3 characters long and no more than 40."),
    body("price", "Price is required!").toFloat().isFloat(),
    body("description", "Description is required!")
        .isLength({ min: 5, max: 255 })
        .withMessage("Please enter a description that’s at least 5 characters long and no more than 255.")
        .trim(),
];

const router = Router();

router.get("/products/my", isAuthenticated, getMyProducts);

router.get("/products/add", isAuthenticated, getAddProduct);
router.post("/products/add", isAuthenticated, [...productBodyValidation()], postAddProduct);

router.delete("/products/:id", isAuthenticated, deleteProduct);

router.get("/products/edit/:id", isAuthenticated, getEditProduct);
router.post(
    "/products/edit/:id",
    isAuthenticated,
    [body("_id", "Missing product id!"), ...productBodyValidation()],
    updateProduct,
);

export default router;
