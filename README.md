# nodejs-backend-playground

[![Node.js](https://img.shields.io/badge/Node.js-20-blue?logo=node.js)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5.1.0-lightgrey?logo=express)](https://expressjs.com/)
[![Mongoose](https://img.shields.io/badge/Mongoose-9.2.4-green?logo=mongoose)](https://mongoosejs.com/)
[![Edge.js](https://img.shields.io/badge/Edge.js-6.3.0-000000?logo=javascript)](https://edgejs.dev/)
[![PDFKit](https://img.shields.io/badge/PDFKit-0.18.0-blueviolet?logo=pdf)](https://pdfkit.org/)

Node.js + Express + TypeScript shopping app with Edge.js templates, MongoDB (Mongoose), authentication (session + CSRF), product CRUD, cart, and PDF invoices.

## Features

- Server-rendered UI using **Edge.js** (`.edge` views)
- Authentication with **express-session** stored in MongoDB (**connect-mongo**)
- CSRF protection (`csurf`) and flash messages (`connect-flash`)
- Product CRUD + image uploads via **Multer**
- Cart + orders flow
- Invoice PDFs generated/served with **PDFKit** and stored under `data/invoices/`

## Tech Stack

- Runtime: Node.js (ESM, `"type": "module"`)
- Framework: Express
- Template engine: edge.js
- Database: MongoDB + Mongoose
- Validation: express-validator
- File uploads: multer

## Prerequisites

- Node.js 20+
- MongoDB connection details for your `.env`

## Setup

1. Install dependencies:

```bash
yarn install
```

2. Configure environment variables:

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

Required variables in `.env`:

- `PORT`
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (legacy/non-used by current Mongo connection string, but kept for parity)
- `MONGO_HOST`, `MONGO_USER`, `MONGO_PASSWORD`, `MONGO_APPNAME`
- `SESSION_SECRET`
- `SENDGRID_API_KEY` (used by email-related code)

3. Start the dev server:

```bash
yarn dev
```

Server entrypoint: `src/app.ts`

## Running

- Dev: `yarn dev`
- Production start (after building to `dist`): `yarn start`

## Important Paths

- Uploaded product images: `public/uploads`
- Invoice PDFs: `data/invoices`

## Main Routes

Shop routes (`src/routes/shop.ts`):

- `GET /` - shop home
- `GET /products` - list products
- `GET /products/:id` - product details
- `POST /cart/:id` - add item to cart (authenticated)
- `DELETE /cart/:id` - remove item from cart (authenticated)
- `GET /cart` - view cart (authenticated)
- `GET /orders` - list orders (authenticated)
- `POST /orders` - create order from cart (authenticated)
- `GET /orders/:id` - invoice PDF for an order (authenticated)

Auth routes (`src/routes/auth.ts`):

- `GET /login`
- `GET /register`
- `GET /reset-password`
- `POST /register`
- `POST /login`
- `POST /logout`
- `POST /reset-password`

Admin/product routes (`src/routes/products.ts`):

- `GET /products/my`
- `GET /products/add`
- `POST /products/add`
- `GET /products/edit/:id`
- `POST /products/edit/:id`
- `DELETE /products/:id`

## Notes

- CSRF is enabled globally in `src/app.ts`, so form submissions must include the generated CSRF token.
- The app uses Edge.js templates located in `src/views`.
