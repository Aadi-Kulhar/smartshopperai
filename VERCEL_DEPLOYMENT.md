# Deploying to Vercel

This guide explains how to deploy Smart Shopper AI to Vercel. 

> [!IMPORTANT]
> Because Vercel uses serverless functions, the local SQLite database (`dev.db`) **will not work** (data would be lost on every restart). We must switch to **Vercel Postgres**.

## 1. Prepare the Repository

Make sure your latest changes are pushed to GitHub (we just did this!).

## 2. Create Project on Vercel

1.  Log in to your [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **"Add New..."** -> **"Project"**.
3.  Import the `smartshopperai` repository.

## 3. Set Up Vercel Postgres

Before clicking "Deploy":

1.  In the project configuration screen, find the **Storage** tab (or deploy first and add it later, but adding it first is easier).
2.  Actually, the easiest way is to click **Deploy** first (the build might fail or the app will error until DB is set up, that's fine).
3.  Once the project is created, go to the **Storage** tab in the Vercel Project Dashboard.
4.  Click **"Connect Store"** -> **"Create New"** -> **"Postgres"**.
5.  Accept the terms and create the database.
6.  Once created, it will automatically add environment variables (like `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`, etc.) to your project.

## 4. update Environment Variables

Go to **Settings** -> **Environment Variables** and ensure the following are present:

1.  `MINO_API_KEY`: Add your Mino API key here.
2.  `DATABASE_URL`: Vercel Postgres should have added specific Postgres variables.
    *   **Crucial Step**: Prisma needs a variable named `DATABASE_URL`.
    *   Vercel creates `POSTGRES_PRISMA_URL`.
    *   You may need to alias it or update your schema. We have set up the schema to use `DATABASE_URL`.
    *   **Action**: In Vercel Environment Variables, check if `DATABASE_URL` exists. If not, create a new variable key `DATABASE_URL` and set the value to the same value as `POSTGRES_PRISMA_URL`.

## 5. Deployment Hook (Database Push)

Prisma needs to push the schema to the new Postgres database.

1.  Go to the **Deployments** tab.
2.  Redeploy the latest commit, OR
3.  In your local terminal, you can initialize the remote database if you link the project:
    ```bash
    npm i -g vercel
    vercel link
    vercel env pull .env.local
    npx prisma db push
    ```

## 6. Update Schema (Important)

The code has been updated to use `provider = "postgresql"`. This ensures compatibility with Vercel Postgres.

## Local Development with Postgres

Now that the schema uses Postgres, your local `npm run dev` with SQLite will stop working. To develop locally:

1.  Pull the Vercel env vars: `npx vercel env pull .env.local`
2.  This will let you connect to the Vercel Postgres database from your local machine.
3.  Run `npm run dev`.
