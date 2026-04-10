import fs from "fs";
import path from "path";
import { __dirname } from "./paths.ts";

const BASE_PATH = path.join(__dirname, "..", "data");

export class FileStorage<T> {
	storagePath: string;
	fileName: string;

	constructor(fileName: string, path?: string) {
		this.fileName = fileName;
		this.storagePath = path ? path : BASE_PATH;

		if (!fs.existsSync(this.storagePath)) {
			fs.mkdirSync(this.storagePath, { recursive: true });
		}
	}

	save(data: T | T[]): void {
		const filePath = path.join(this.storagePath, `${this.fileName}.json`);
		fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
	}

	getAll(): T[] | null {
		const filePath = path.join(this.storagePath, `${this.fileName}.json`);
		if (!fs.existsSync(filePath)) {
			return null;
		}

		const fileContent = fs.readFileSync(filePath, { encoding: "utf-8" });

		try {
			const data = JSON.parse(fileContent);
			if (data) {
				return data as T[];
			} else {
				return null;
			}
		} catch (error) {
			console.error(`Error parsing JSON from file ${filePath}:`, error);
			return null;
		}
	}
}

export default FileStorage;
