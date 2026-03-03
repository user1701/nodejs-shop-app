/* eslint-disable @typescript-eslint/no-explicit-any */
import path from "path";
import { Edge } from "edge.js";
import navigation from "../constants/navigaion.ts";

export const initEdge = () => {
	const edge = Edge.create();
	edge.mount(new URL("../views", import.meta.url));
	edge.global("config", {
		navigation: navigation,
	});

	return edge;
};

function promisify(cb: any, fn: any) {
	return new Promise(function (resolve, reject) {
		cb =
			cb ||
			function (err: any, html: any) {
				if (err) {
					return reject(err);
				}

				resolve(html);
			};

		fn(cb);
	});
}

export function renderFile(
	pathname: string,
	options: Record<string, any> = {},
	cb: (err: any, html?: any) => void
) {
	const parsedPath = path.parse(pathname);
	const engine = initEdge();
	return promisify(cb, async (cb: any) => {
		options.locals = options;
		try {
			const html = await engine.render(parsedPath.name, options);
			cb(null, html);
		} catch (err) {
			cb(err);
		}
	});
}
