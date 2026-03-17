export function getUploadedFilePath(file: Express.Multer.File) {
	return file?.path?.replaceAll("\\", "/").replace("public", "");
}
