import User from "@/models/user.ts";
import type { Request, Response } from "express";

export const login = async (req: Request, res: Response) => {
	const { email, password } = req.body;
	User.findOne({ email }).then((user) => {
		if (!user) {
			return res.status(401).send("Invalid email");
		}

		if (user.password !== password) {
			return res.status(401).send("Invalid password.");
		}

		req.session.isAuthenticated = true;
		req.session.user = user;
		req.session.save((err) => {
			if (err) {
				console.error("Session save error:", err);
				return res.status(500).send("Internal server error.");
			}
			res.redirect("/");
		});
	});
};

export const logout = async (req: Request, res: Response) => {
    console.log("Logging out user:", req.session.user);
	req.session.destroy((err) => {
		if (err) {
			console.error("Session destroy error:", err);
			return res.status(500).send("Internal server error.");
		}
		res.redirect("/");
	});
};

export const loginPage = async (req: Request, res: Response) => {
	res.render("login", { path: req.path });
};

export const registerPage = async (req: Request, res: Response) => {
	res.render("register", { path: req.path });
};
