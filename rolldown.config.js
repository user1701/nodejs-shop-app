import { defineConfig } from "rolldown";

export default defineConfig({
    input: "src/app.ts",
    output: {
        dir: "dist",
        format: "esm",
        cleanDir: true,
    },
    platform: "node",
});
