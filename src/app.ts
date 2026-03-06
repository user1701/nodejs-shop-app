import express from "express";
import type { NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";

import { renderFile } from "@/utils/edgeEngine.ts";

import adminRoutes from "@/routes/admin.ts";
import shopRoutes from "@/routes/shop.ts";
import { NotFoundController } from "@/controllers/common.ts";

import { DEFAULT_USER_ID } from "@/constants/user.ts";
import { mongoConnect } from "@/utils/mongoDB.ts";
import { User } from "@/models/user.ts";

const PORT = process.env.PORT || 3001;

const app = express();
app.engine("edge", renderFile);
app.set("view engine", "edge");
app.set("views", "src/views");
app.use(express.static("public"));

app.use(async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user = await User.findById(DEFAULT_USER_ID);
		if (user) {
			req.user = new User(user);
		} else {
			console.log("User not found.");
		}
		next();
	} catch (err) {
		console.error("Error fetching user: ", err);
		next();
	}
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(adminRoutes);
app.use(shopRoutes);

// Handle 404 errors
app.use(NotFoundController);

mongoConnect()
	.then((client) => {
		console.log("MongoDB ready, starting server");
	})
	.catch((err) => {
		console.error("Failed to connect to MongoDB:", err);
	})
	.finally(() => {
		app.listen(PORT, () => {
			console.log(`Server is running on port ${PORT}`);
		});
	});
