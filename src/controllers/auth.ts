import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import sgMail from "@sendgrid/mail";
import crypto from "node:crypto";

import User from "@/models/user.ts";

const SG_API_KEY = process.env.SENDGRID_API_KEY;
if (SG_API_KEY === undefined) {
	console.error("Set up you SENDGRID_API_KEY");
} else {
	sgMail.setApiKey(SG_API_KEY);
}

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

	await sgMail
		.send({
			to: email,
			from: "ivanko1992@gmail.com",
			subject: "Signup succeeded!",
			html: "<h1>Test mail from local nodejs server</h1>",
		})
		.catch((err) => {
			console.error("SendMail: error ", err);
		});

	res.redirect("/login");
};

export const logout = async (req: Request, res: Response) => {
	console.log("Logging out user:", req.session.user);
	req.session.destroy((err) => {
		if (err) {
			console.error("Session destroy error:", err);
			req.flash(
				"error",
				"An error occurred while logging out. Please try again."
			);
			return res.status(500).redirect("/");
		}
		res.redirect("/");
	});
};

export const resetPasword = async (req: Request, res: Response) => {
	const { email } = req.body;
	crypto.randomBytes(32, (err, buffer) => {
		if (err) {
			console.error("ResetPassword: cryptoRandomBytes - ", err);
			res.redirect("/reset-password");
		}

		const token = buffer.toString('hex');
		User.findOne({ email })
			.then((user) => {
				if (!user) {
					req.flash("error", "User with that email not found");
					res.redirect("/reset-password");
				} else {
					user.resetToken = token;
					user.resetTokenExpiration = new Date(Date.now() + 360000);
					return user.save();
				}
			})
			.then(() => {
				sgMail.send({
					to: email,
					from: "ivanko1992@gmail.com",
					subject: "Password reset",
					html: `
                        <h2>You requested a password reset</h2>
                        <p>Click this <a href="http://localhost:5001/reset-password/${token}">link</a> to set a new password</p>
                    `,
				});
				res.redirect("/");
			})
			.catch((err) => {
				console.error("ResetPassword: controller - ", err);
			});
	});
};

export const newPassword = async (req: Request, res: Response) => {
	const { password, userId, token } = req.body;

	User.findOne({
		resetToken: token,
		resetTokenExpiration: { $gt: Date.now() },
		_id: userId,
	})
		.then(async (user) => {
			if (user) {
				const newPassword = await bcrypt.hash(password, 12);
				user.password = newPassword;
				user.resetToken = null;
				user.resetTokenExpiration = null;
				await user.save();

				res.redirect("/login");
			}
		})
		.catch((err) => {
			console.error("newPassword: ", err);
		});
};

export const createNewPasswordPage = async (req: Request, res: Response) => {
	const { token } = req.params;

	User.findOne({
		resetToken: token,
		resetTokenExpiration: { $gt: Date.now() },
	}).then((user) => {
		if (!user) {
			return res.redirect("/");
		}

		res.render("create-new-password", {
			path: req.path,
			errorMessage: req.flash("error"),
			userId: user?._id.toString(),
			token,
		});
	});
};

export const loginPage = async (req: Request, res: Response) => {
	res.render("login", { path: req.path, errorMessage: req.flash("error") });
};

export const registerPage = async (req: Request, res: Response) => {
	res.render("register", { path: req.path, errorMessage: req.flash("error") });
};

export const resetPage = async (req: Request, res: Response) => {
	res.render("reset-password", {
		path: req.path,
		errorMessage: req.flash("error"),
	});
};
