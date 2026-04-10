/* eslint-disable @typescript-eslint/no-explicit-any */
import path from "path";
import { Edge } from "edge.js";
import navigation, { rightNavigation } from "../constants/navigaion.ts";

export const initEdge = () => {
    const edge = Edge.create({
        cache: process.env.NODE_ENV === "production",
    });

    const globals = {
        navigation: navigation,
        rightNavigation: rightNavigation,
    };

    const BASE_DIR = process.env.NODE_ENV === "production" ? "dist" : "src";
    edge.mount(path.resolve(process.cwd(), BASE_DIR, "views"));
    edge.global("config", globals);

    async function renderFile(
        pathname: string,
        options: Record<string, any> = {},
        callback: (err: any, html?: any) => void,
    ) {
        const parsedPath = path.parse(pathname);
        options.locals = options;
        try {
            const html = await edge.render(parsedPath.name, options);
            return callback(null, html);
        } catch (err) {
            return callback(err);
        }
    }

    return renderFile;
};
