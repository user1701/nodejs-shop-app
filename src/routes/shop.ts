import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.status(200).send(`
    <h1>Shop Page</h1>
    <p>Welcome to the shop!</p>
  `);
});

export default router;
