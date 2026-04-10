import type { NextFunction, Request, Response } from "express";

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.session.isAuthenticated) {
        return next();
    }

    res.redirect("/login");
}
