import dotenv from "dotenv";
import path from "path";
import { styleText } from "node:util";
import { checkFileExists } from "./fs.ts";
import { capitalize } from "./string.ts";

type EnvType = "default" | "development" | "test" | "production";
type EnvMethodName = `is${Capitalize<EnvType>}`;
interface Environment {
    readonly title: EnvType;
    filePath(): string;
}

class DefaultEnv implements Environment {
    title: EnvType = "default";
    filePath() {
        return path.resolve(process.cwd(), ".env");
    }
}

class DevEnv implements Environment {
    title: EnvType = "development";
    filePath() {
        return path.resolve(process.cwd(), `.env.${this.title}`);
    }
}

class ProdEnv implements Environment {
    title: EnvType = "production";
    filePath() {
        return path.resolve(process.cwd(), `.env.${this.title}`);
    }
}

class TestEnv implements Environment {
    title: EnvType = "test";

    filePath() {
        return path.resolve(process.cwd(), `.env.${this.title}`);
    }
}

class Env {
    private environments: Map<EnvType, Environment>;
    public ready: Promise<void>;
    constructor(environemnts: Environment[]) {
        this.environments = new Map(environemnts.map((env) => [env.title, env]));
        this.ready = this.init();

        this.environments.forEach((_, envName) => {
            const methodName = `is${capitalize(envName)}` as EnvMethodName;
            (this as unknown as Record<EnvMethodName, () => boolean>)[methodName] = () =>
                this.getEnvironment() === envName;
        });
    }

    private async init() {
        try {
            const environment = this.getEnvironment();
            console.log("Try: %s", environment);
            if (environment) {
                const envFile = await this.getEnvFile(environment);
                console.log(envFile);
                dotenv.config({
                    path: envFile,
                    override: true,
                });
            } else {
                // fallback, look for .env
                const env = this.environments.get("default");
                if (!env) {
                    console.error(styleText(["red"], "Environment file .env not found"));
                } else {
                    console.log("Fallback: %s", env.title);
                    const envFile = await this.getEnvFile("default");
                    dotenv.config({
                        path: envFile,
                        override: true,
                        debug: true,
                    });
                }
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                console.error(styleText(["red"], err.message));
            }
        }
    }

    async getEnvFile(environment: EnvType): Promise<string> {
        const env = this.environments.get(environment);
        if (!env) {
            throw new Error("Environment path not found");
        }

        const filePath = env.filePath();
        if (await checkFileExists(filePath)) {
            return filePath;
        } else {
            throw new Error(`Can't find env file: ${filePath}`);
        }
    }

    getEnvironmentVariable(variable: string): string | undefined {
        return process.env[variable];
    }

    getEnvironment(): EnvType | undefined {
        return this.getEnvironmentVariable("NODE_ENV") as EnvType;
    }

    printEnvVars() {
        console.log(process.env);
    }
}

const env = new Env([new DefaultEnv(), new DevEnv(), new ProdEnv(), new TestEnv()]);

export default env;
