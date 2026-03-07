import User from "@/models/user.ts";
import type { Request, Response } from "express";

export const loginPage = async (req: Request, res: Response) => {
	res.render("login", { path: req.path });
};

export const login = async (req: Request, res: Response) => {
	const { email, password } = req.body;
	User.findOne({ email }).then((user) => {
		if (!user) {
			return res.status(401).send("Invalid email or password.");
		}
	});
};

export const registerPage = async (req: Request, res: Response) => {
	res.render("register", { path: req.path });
};
