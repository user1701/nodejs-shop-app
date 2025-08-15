import { Router } from "express";
import edgeEngine from "../utils/edgeEngine.ts";

const router = Router();
const edge = edgeEngine.getInstance();

router.get("/", async (req, res) => {
  const html = await edge.render("shop");

  res.status(200).send(html);
});

export default router;
