export const MONGO_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}/shop?appName=${process.env.MONGO_APPNAME}&retryWrites=true&w=majority`;
