import type { Request, Response } from "express";
import edgeEngine from "../utils/edgeEngine.ts";

const edge = edgeEngine.getInstance();

type Product = { title: string };
const products: Product[] = [];

export const getProducts = async (req: Request, res: Response) => {
  const html = await edge.render("shop", { products });

  res.status(200).send(html);
};

export const getAddProduct = async (req: Request, res: Response) => {
  const html = await edge.render("admin");

  res.status(200).send(html);
};

export const postAddProduct = (req: Request, res: Response) => {
  const { title = "" } = req.body;
  if (!title) {
    return res.status(400).send("Product title is required.");
  }

  products.push({ title });
  res.redirect("/");
};
