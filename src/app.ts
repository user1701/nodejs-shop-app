import express from "express";
import bodyParser from "body-parser";

import adminRoutes from "./routes/admin.ts";
import shopRoutes from "./routes/shop.ts";
import { __dirname } from "./utils/paths.ts";
import edgeEngine from "./utils/edgeEngine.ts";

const PORT = process.env.PORT || 3001;

const app = express();
app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const edge = edgeEngine.getInstance();

// Routes
// app.get("/", async (req, res) => {
//   const html = await edge.render("home");
//   res.send(html);
// });

app.use("/admin", adminRoutes);
app.use("/", shopRoutes);

// Handle 404 errors
app.use(async (req, res) => {
  const html = await edge.render("not-found");
  res.status(404).send(html);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
