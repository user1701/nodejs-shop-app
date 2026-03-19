import type { Request, Response } from "express";

export const NotFoundController = async (req: Request, res: Response) => {
	res.status(404).render("not-found", {
		isAuthenticated: req.session.isAuthenticated,
	});
};

export const ServerSideError = async (req: Request, res: Response) => {
	res.render("server-side-error", {
		isAuthenticated: req.session.isAuthenticated,
	});
};
