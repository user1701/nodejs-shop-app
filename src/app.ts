import express from "express";
import http from "http";
import type { NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import csrf from "csurf";
import flash from "connect-flash";
import multer, { type FileFilterCallback } from "multer";

import logger from "morgan";
import helmet from "helmet";
import compression from "compression";

import { initEdge } from "./utils/edgeEngine.ts";

import adminRoutes from "./routes/admin.ts";
import shopRoutes from "./routes/shop.ts";
import authRoutes from "./routes/auth.ts";
import { NotFoundController, ServerSideError } from "./controllers/common.ts";
import env from "./utils/env.ts";

import mongoose from "mongoose";
import { getMongoUri } from "./constants/index.ts";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads");
    },
    filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        console.log(file);
        cb(null, `${Date.now()}-${file.originalname.replaceAll(" ", "_")}`);
    },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (["image/png", "image/jpg", "image/jpeg"].includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const app = express();
const edge = initEdge();
app.engine("edge", edge);
app.set("views", "src/views");
app.set("view engine", "edge");
app.use(express.static("public"));

console.log("views: ", app.get("views"));

app.use(logger("dev"));

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                "default-src": ["'self'"],
                "script-src": ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com", "cdn.jsdelivr.net"],
                "connect-src": ["'self'", "cdn.jsdelivr.net"],
                "script-src-attr": ["'self'", "'unsafe-inline'"],
                "img-src": ["'self'", "images.dog.ceo"],
                "style-src": ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com"],
                "font-src": ["'self'", "cdnjs.cloudflare.com"],
            },
        },
    }),
);
app.use(compression());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer({ storage, fileFilter }).single("image"));
app.use(bodyParser.json());
app.use(cookieParser());

// waiting to initialize .env config
await env.ready;

app.use(
    session({
        secret: process.env.SESSION_SECRET || "your-secret-key",
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: getMongoUri(),
            dbName: "shop",
            collectionName: "sessions",
        }),
    }),
);
//@ts-expect-error it works as expected
app.use(csrf());
app.use(flash());

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isAuthenticated;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use(adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get("/server-error", ServerSideError);
// Handle 404 errors
app.use(NotFoundController);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).redirect("/server-error");
});

const server = http.createServer(app);
const PORT = parseInt(process.env.PORT || "3000");

env.ready.then(() => {
    console.log("Environment variables are ready", env.getEnvironment(), getMongoUri());
    mongoose
        .connect(getMongoUri())
        .then(() => {
            console.log("Connected to MongoDB");
            server.listen(PORT, "::", () => {
                const addressInfo = server.address();

                if (addressInfo && typeof addressInfo === "object") {
                    const { address, port, family } = addressInfo;
                    console.log(`Server is running on: ${address}:${port} (${family})`);
                    console.log(`Example URL: http://localhost:${port}`);
                } else if (typeof addressInfo === "string") {
                    console.log(`Server is listening on pipe: ${addressInfo}`);
                } else {
                    console.log("Server address not available.");
                }
            });
        })
        .catch((err) => {
            console.error("Error connecting to MongoDB:", err);
            process.exit(1);
        });
});
