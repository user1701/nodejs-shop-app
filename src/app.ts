import express from "express";
import bodyParser from "body-parser";

import adminRoutes from "./routes/admin.ts";
import shopRoutes from "./routes/shop.ts";
import { NotFoundController } from "./controllers/common.ts";
import edgeEngine from "./utils/edgeEngine.ts";

const PORT = process.env.PORT || 3001;

const edge = edgeEngine.getInstance();

const app = express();
app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, res, next) => {
	console.log(`Request received: ${req.method} ${req.path}`);
	edge.global("path", req.path);
	next();
});

app.use(adminRoutes);
app.use(shopRoutes);

// Handle 404 errors
app.use(NotFoundController);

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
