import express from "express";
import type { NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";

import adminRoutes from "./routes/admin.ts";
import shopRoutes from "./routes/shop.ts";
import { NotFoundController } from "./controllers/common.ts";
import edgeEngine from "./utils/edgeEngine.ts";

import sequlize from "./utils/db.ts";
import Product from "./models/product.ts";
import User from "./models/user.ts";

const PORT = process.env.PORT || 3001;

const edge = edgeEngine.getInstance();

const app = express();
app.use(express.static("public"));

const DEFAULT_USER_ID = "8fbd2f2e-8b51-4141-bbaa-48b8cb7ef545";

app.use((req: Request, res: Response, next: NextFunction) => {
	User.findByPk(DEFAULT_USER_ID)
		.then((user) => {
			console.log(user?.toJSON());
			if (user) {
				// Store the user in the request object for later use
				req.user = user;
			} else {
				console.log("User not found.");
			}
			next();
		})
		.catch((err) => {
			console.error("Error fetching user: ", err);
			next();
		});
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req: Request, res: Response, next: NextFunction) => {
	console.log(`Request received: ${req.method} ${req.path}`);
	edge.global("path", req.path);
	next();
});

app.use(adminRoutes);
app.use(shopRoutes);

// Handle 404 errors
app.use(NotFoundController);

Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
User.hasMany(Product);

sequlize
	.sync({ force: false })
	.then(() => {
		console.log("Database synced successfully.");

		// Create a default user if not exists
		User.findByPk(DEFAULT_USER_ID).then((user) => {
			if (!user) {
				User.create({
					name: "Ivan",
					email: "ivan@gmail.com",
					password: "test123",
				});
			}
		});

		app.listen(PORT, () => {
			console.log(`Server is running on http://localhost:${PORT}`);
		});
	})
	.catch((err) => {
		console.error("Error syncing database: ", err);
	});
