import { login, loginPage, logout, registerPage } from "@/controllers/auth.ts";
import { Router } from "express";

const router = Router();

router.get("/login", loginPage);
router.get("/register", registerPage);

router.post("/login", login);
router.post("/logout", logout);

export default router;
