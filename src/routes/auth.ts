import { login, loginPage, registerPage } from "@/controllers/auth.ts";
import { Router } from "express";

const router = Router();

router.get("/login", loginPage);
router.get("/register", registerPage);

router.post("/login", login);

export default router;
