import express from "express";

const router = express.Router();

router.get("/product", (req, res) => {
  res.status(200).send(`
    <h1>Admin Page</h1>
    <form action="/admin/product" method="POST">
      <input type="text" name="productName" placeholder="Enter product name" required>
      <button type="submit">Add product</button>
    </form>
  `);
});

router.post("/product", (req, res) => {
  console.log(req.body);
  res.redirect(req.originalUrl);
});

export default router;
