import { Router } from "express";
import { getProducts } from "../controllers/products.ts";

const router = Router();

router.get("/", getProducts);

export default router;
