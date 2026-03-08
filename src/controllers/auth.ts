import User from "@/models/user.ts";
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";

export const login = async (req: Request, res: Response) => {
	const { email, password } = req.body;
	User.findOne({ email }).then(async (user) => {
		if (!user) {
			req.flash("error", "Invalid email.");
			return res.status(401).redirect("/login");
		}

		if (!(await bcrypt.compare(password, user.password))) {
			req.flash("error", "Invalid password.");
			return res.status(401).redirect("/login");
		}

		req.session.isAuthenticated = true;
		req.session.user = user;
		req.session.save((err) => {
			if (err) {
				console.error("Session save error:", err);
				req.flash(
					"error",
					"An error occurred while logging in. Please try again."
				);
				return res.redirect("/login");
			}
			res.redirect("/");
		});
	});
};

export const register = async (req: Request, res: Response) => {
	const { name, email, password, confirmPassword } = req.body;
	const existingUser = await User.findOne({ email });

	if (existingUser) {
		req.flash("error", "User with this email already exists.");
		return res.status(400).redirect("/register");
	}

	if (password !== confirmPassword) {
		req.flash("error", "Passwords do not match.");
		return res.status(400).redirect("/register");
	}

	const hashedPassword = await bcrypt.hash(password, 12);

	const user = new User({ name, email, password: hashedPassword });
	await user.save();

	res.redirect("/login");
};

export const logout = async (req: Request, res: Response) => {
	console.log("Logging out user:", req.session.user);
	req.session.destroy((err) => {
		if (err) {
			console.error("Session destroy error:", err);
            req.flash("error", "An error occurred while logging out. Please try again.");
			return res.status(500).redirect("/");
		}
		res.redirect("/");
	});
};

export const loginPage = async (req: Request, res: Response) => {
	res.render("login", { path: req.path, errorMessage: req.flash("error") });
};

export const registerPage = async (req: Request, res: Response) => {
	res.render("register", { path: req.path, errorMessage: req.flash("error") });
};
