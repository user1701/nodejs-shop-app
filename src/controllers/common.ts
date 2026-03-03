import type { Request, Response } from "express";

export const NotFoundController = async (req: Request, res: Response) => {
	res.render("not-found");
};
