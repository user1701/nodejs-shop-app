import express from "express";
import type { NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";

import { renderFile } from "./utils/edgeEngine.ts";

import adminRoutes from "@/routes/admin.ts";
import shopRoutes from "@/routes/shop.ts";
import { NotFoundController } from "./controllers/common.ts";

import sequlize from "@/utils/db.ts";
import Product from "@/models/product.ts";
import User, { createDefaultUser } from "@/models/user.ts";
import Cart from "@/models/cart.ts";
import CartItem from "@/models/cart-item.ts";

import { DEFAULT_USER_ID } from "@/constants/user.ts";
import Order from "./models/order.ts";
import OrderItem from "./models/order-item.ts";

const PORT = process.env.PORT || 3001;

const app = express();
app.engine("edge", renderFile);
app.set("view engine", "edge");
app.set("views", "src/views");
app.use(express.static("public"));

app.use((req: Request, res: Response, next: NextFunction) => {
	User.findByPk(DEFAULT_USER_ID)
		.then((user) => {
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

app.use(adminRoutes);
app.use(shopRoutes);

// Handle 404 errors
app.use(NotFoundController);

User.hasMany(Product, { foreignKey: "userId" });
Product.belongsTo(User, {
	foreignKey: "userId",
	constraints: true,
	onDelete: "CASCADE",
});

User.hasOne(Cart, { foreignKey: "userId" });
Cart.belongsTo(User, { foreignKey: "userId" });

Cart.belongsToMany(Product, { through: CartItem, foreignKey: "cartId" });
Product.belongsToMany(Cart, { through: CartItem, foreignKey: "productId" });

Order.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Order, { foreignKey: "userId" });

// both sides of a many-to-many need to be wired up and we explicitly
// specify the alias to avoid any ambiguity.  earlier we only registered
// the Order -> Product association which meant Sequelize gave the
// relationship a default name based on the model.  in some situations the
// default alias is not what the accessors expect, leading to runtime
// errors such as "Association with alias \"products\" does not exist on
// Order" when calling `order.addProducts`.

Order.belongsToMany(Product, {
	through: OrderItem,
	foreignKey: "orderId",
});

sequlize
	.sync()
	// .sync({ force: true })
	.then(async () => {
		console.log("Database synced successfully.");

		const user = await createDefaultUser(DEFAULT_USER_ID);
		const cart = await user.getCart();
		if (cart === null) {
			await user.createCart();
		}

		app.listen(PORT, () => {
			console.log(`Server is running on http://localhost:${PORT}`);
		});
	})
	.catch((err) => {
		console.error("Error syncing database: ", err);
	});
