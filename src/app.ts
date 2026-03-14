import express from "express";
import type { NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import csrf from "csurf";
import flash from "connect-flash";

import { renderFile } from "@/utils/edgeEngine.ts";

import adminRoutes from "@/routes/admin.ts";
import shopRoutes from "@/routes/shop.ts";
import authRoutes from "@/routes/auth.ts";
import { NotFoundController, ServerSideError } from "@/controllers/common.ts";

import { MONGO_URI } from "@/constants/db.ts";
import mongoose from "mongoose";

const PORT = process.env.PORT || 3001;

const app = express();
app.engine("edge", renderFile);
app.set("view engine", "edge");
app.set("views", "src/views");
app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
	session({
		secret: process.env.SESSION_SECRET || "your-secret-key",
		resave: false,
		saveUninitialized: false,
		store: MongoStore.create({
			mongoUrl: MONGO_URI,
			dbName: "shop",
			collectionName: "sessions",
		}),
	})
);
app.use(csrf());
app.use(flash());

app.use((req, res, next) => {
	res.locals.isAuthenticated = req.session.isAuthenticated;
	res.locals.csrfToken = req.csrfToken();
	next();
});

app.use(adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get("/server-error", ServerSideError);
// Handle 404 errors
app.use(NotFoundController);

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
	console.error(err);
	res.status(500).redirect("/server-error");
});

mongoose
	.connect(MONGO_URI)
	.then(() => {
		console.log("Connected to MongoDB");
		app.listen(PORT, () => {
			console.log(`Server is running on port ${PORT}`);
		});
	})
	.catch((err) => {
		console.error("Error connecting to MongoDB:", err);
		process.exit(1);
	});
