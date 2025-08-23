import type { Request, Response } from "express";
import edgeEngine from "../utils/edgeEngine.ts";

const edge = edgeEngine.getInstance();

export const NotFoundController = async (req: Request, res: Response) => {
	const html = await edge.render("not-found");
	res.status(404).send(html);
};
