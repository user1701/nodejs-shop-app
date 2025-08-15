import { Router } from "express";
import edgeEngine from "../utils/edgeEngine.ts";

const router = Router();
const edge = edgeEngine.getInstance();

// router.get("/products", (req, res) => {
//   res.status(200).sendFile(getViews("admin"));
// });

router.get("/products/add", async (req, res) => {
  const html = await edge.render("admin");

  res.status(200).send(html);
});

router.post("/products", (req, res) => {
  console.log(req.body);

  res.redirect("/shop");
});

export default router;
