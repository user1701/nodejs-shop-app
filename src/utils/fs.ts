import type { PathLike } from "node:fs";
import fs from "node:fs/promises";

export async function checkFileExists(filePath: PathLike) {
	try {
		await fs.access(filePath, fs.constants.F_OK); // F_OK checks for existence
		return true;
	} catch {
		return false; // An error (ENOENT) means the file does not exist
	}
}

export async function deleteFile(filePath: PathLike) {
	try {
		await fs.unlink(filePath);
		console.log(`File deleted successfully: ${filePath}`);
	} catch (error) {
		if (isErrnoException(error)) {
			if (error.code === "ENOENT") {
				console.warn("File does not exist, skipping deletion.");
			} else if (error.code === "EPERM") {
				console.error("Permission denied.");
			} else {
				console.error("System error:", error.code);
			}
		} else {
			console.error("An unknown error occurred:", error);
		}
	}
}

export function isErrnoException(
	error: unknown
): error is NodeJS.ErrnoException {
	return error instanceof Error && ("code" in error || "errno" in error);
}
