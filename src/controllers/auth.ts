import type { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import sgMail from "@sendgrid/mail";
import crypto from "node:crypto";
import { matchedData, validationResult } from "express-validator";

import User from "./../models/user.ts";

const { SENDGRID_API_KEY } = process.env;
if (SENDGRID_API_KEY === undefined) {
    console.error("Set up you SENDGRID_API_KEY");
} else {
    sgMail.setApiKey(SENDGRID_API_KEY);
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
    const { email = "", password = "" } = req.body;

    const errors = validationResult(req);
    const data = matchedData(req, {
        onlyValidData: false,
    });

    if (!errors.isEmpty()) {
        return res.render("login", {
            path: req.path,
            errors: errors.mapped(),
            data,
        });
    }

    User.findOne({ email })
        .then(async (user) => {
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
                    req.flash("error", "An error occurred while logging in. Please try again.");
                    return res.redirect("/login");
                }
                res.redirect("/");
            });
        })
        .catch((err) => {
            if (typeof err === "string") {
                next(new Error(err));
            } else if (err instanceof Error) {
                next(err);
            }
        });
};

export const register = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });

    const errors = validationResult(req);
    const data = matchedData(req, { onlyValidData: false });
    if (!errors.isEmpty()) {
        return res.render("register", {
            success: false,
            errors: errors.mapped(),
            data,
        });
    }

    if (existingUser) {
        return res.render("register", {
            success: false,
            errors: errors.mapped(),
            errorMessage: "User with this email already exists.",
            data,
        });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.redirect("/login");
    await sgMail
        .send({
            to: email,
            from: "ivanko1992@gmail.com",
            subject: "Signup succeeded!",
            html: "<h1>Test mail from local nodejs server</h1>",
        })
        .catch((err) => {
            console.error("SendMail: error", err);
        });
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
    req.session.destroy((err) => {
        if (err) {
            if (typeof err === "string") {
                next(new Error(err));
            } else if (err instanceof Error) {
                next(err);
            }
        }
        res.clearCookie("connect.sid");
        res.status(200).json(null);
    });
};

export const resetPasword = async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            res.redirect("/reset-password");
        }

        const token = buffer.toString("hex");
        User.findOne({ email })
            .orFail()
            .then((user) => {
                user.resetToken = token;
                user.resetTokenExpiration = new Date(Date.now() + 360000);
                return user.save();
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
                if (typeof err === "string") {
                    next(new Error(err));
                } else if (err instanceof Error) {
                    next(err);
                }
            });
    });
};

export const newPassword = async (req: Request, res: Response, next: NextFunction) => {
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
            if (typeof err === "string") {
                next(new Error(err));
            } else if (err instanceof Error) {
                next(err);
            }
        });
};

export const createNewPasswordPage = async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.params;

    if (token === undefined) {
        return res.redirect("/login");
    }

    User.findOne({
        resetToken: token,
        resetTokenExpiration: { $gt: Date.now() },
    })
        .then((user) => {
            if (!user) {
                return res.redirect("/");
            }

            res.render("create-new-password", {
                path: req.path,
                errorMessage: req.flash("error"),
                userId: user?._id.toString(),
                token,
            });
        })
        .catch((err) => {
            if (typeof err === "string") {
                next(new Error(err));
            } else if (err instanceof Error) {
                next(err);
            }
        });
};

export const loginPage = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    res.render("login", {
        path: req.path,
        errors: errors.mapped(),
        data: {
            email: "",
            password: "",
        },
    });
};

export const registerPage = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    res.render("register", {
        path: req.path,
        errors: errors.mapped(),
        data: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });
};

export const resetPage = async (req: Request, res: Response) => {
    res.render("reset-password", {
        path: req.path,
        errorMessage: req.flash("error"),
    });
};
