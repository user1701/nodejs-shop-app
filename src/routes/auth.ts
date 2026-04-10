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
import { body } from "express-validator";

const router = Router();

router.get("/login", loginPage);
router.get("/register", registerPage);
router.get("/reset-password", resetPage);
router.get("/reset-password/:token", createNewPasswordPage);

router.post(
	"/register",
	[
		body("name", "Name should be between 1 and 20 characters length")
			.trim()
			.isLength({
				min: 1,
				max: 20,
			}),
		body("email", "Invalid email").isEmail().normalizeEmail(),
		body(
			["password", "confirmPassword"],
			"Password minimum length is 5 and maximun 20"
		)
			.trim()
			.isLength({ min: 5, max: 20 }),
		body("confirmPassword").trim().custom((val, { req }) => {
			if (val !== req.body.password) {
				throw new Error("Passwords do not match!");
			}

			return true;
		}),
	],
	register
);
router.post(
	"/login",
	[
		body("email", "Invalid email format").isEmail().normalizeEmail(),
		body(
			"password",
			"Password must be 5–20 characters long and contain only letters and numbers."
		)
			.trim()
			.isLength({ min: 5, max: 20 })
			.isAlphanumeric(),
	],
	login
);
router.post("/logout", logout);
router.post("/reset-password", resetPasword);
router.post("/create-password", newPassword);

export default router;
