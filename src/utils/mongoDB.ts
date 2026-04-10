import { Db, MongoClient, ObjectId } from "mongodb";

const URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}/shop?appName=${process.env.MONGO_APPNAME}&retryWrites=true&w=majority`;

const client = new MongoClient(URI);

let db: Db | null = null;

export async function mongoConnect(): Promise<MongoClient> {
	try {
		// await client.connect();
		const connection = await client.connect();
		console.log("Connected successfully to MongoDB");
		await client.db("shop").command({ ping: 1 });
		db = connection.db("shop");
		console.log(
			"Pinged your deployment. You successfully connected to MongoDB!"
		);
		return connection;
	} catch (err: unknown) {
		if (err instanceof Error) {
			console.error("MongoDB connect error:", err.message);
		} else {
			console.error("MongoDB connect error:", err);
		}

		throw err;
	}
}

export function getDb() {
	if (db !== null) {
		return db;
	}
}

export const isSameProduct = (idA: ObjectId, idB: ObjectId) =>
	idA.toString() === idB.toString();
