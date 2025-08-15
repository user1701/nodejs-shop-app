import path from "path";
import { __dirname } from "./paths.ts";

export function getViews(...args: string[]): string {
  const localArgs = args.slice();

  if (localArgs.length === 0) {
    throw new Error("At least one argument is required to get views path");
  }

  /**
   * Ensure the last argument is a valid HTML file
   * If not, set "page.html" as default view file
   */
  if (!localArgs.at(-1)?.endsWith(".html")) {
    localArgs.push("page.html");
  }

  return path.join(__dirname, "..", "views", ...localArgs);
}
