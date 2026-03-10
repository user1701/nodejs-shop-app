import {
	createNewPasswordPage,
	login,
	loginPage,
	logout,
	newPassword,
	register,
	registerPage,
	resetPage,
	resetPasword,
} from "@/controllers/auth.ts";
import { Router } from "express";

const router = Router();

router.get("/login", loginPage);
router.get("/register", registerPage);
router.get("/reset-password", resetPage);
router.get("/reset-password/:token", createNewPasswordPage);

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/reset-password", resetPasword);
router.post("/create-password", newPassword);

export default router;
