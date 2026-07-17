# Vercel Deployment Guide

This repo should be deployed to Vercel as two separate projects from the same Git repository:

1. `frontend`
2. `react-backend`

## Frontend Project

- Root Directory: `frontend`
- Framework Preset: `Vite`
- Build Command: default
- Output Directory: default (`dist`)

### Frontend environment variables

- `VITE_API_BASE_URL=https://your-backend-project.vercel.app/api`

### Why `frontend/vercel.json` exists

This app is a Vite SPA. Vercel requires a rewrite to `/index.html` for deep links like `/services-simple`, `/product/:id`, and `/book/:id`.

## Backend Project

- Root Directory: `react-backend`
- Framework Preset: `Express`
- Build Command: `npm run vercel-build`

The backend now default-exports the Express app from [react-backend/src/server.ts](C:/Users/Ahmed%20Bilal%20Khan/Desktop/salon/react-backend/src/server.ts), which matches Vercel's Express deployment flow.

### Backend environment variables

- `DATABASE_URL`
- `JWT_SECRET`
- `FRONTEND_URL=https://your-frontend-project.vercel.app`
- `BACKEND_PUBLIC_URL=https://your-backend-project.vercel.app`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_UPLOAD_FOLDER=salon-uploads`

Optional, but recommended:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

## Production upload note

Vercel does not serve static files through `express.static()` for Express apps. Because of that, production uploads should go to Cloudinary instead of local disk.

This backend now:

- uses Cloudinary automatically when Cloudinary env vars are set
- falls back to local disk uploads only for local development

## Recommended deploy order

1. Deploy `react-backend`
2. Copy backend production URL
3. Set `VITE_API_BASE_URL` in the `frontend` project
4. Deploy `frontend`
5. Update backend `FRONTEND_URL` to the final frontend URL
6. Redeploy backend so password reset and payment links point at the right domain

## Database migrations on Vercel

Set the backend project's build command to `npm run vercel-build`.

That command will:

1. generate the Prisma client
2. run `prisma migrate deploy`
3. compile TypeScript

This repo now includes a defensive migration at [react-backend/prisma/migrations/20260604162000_patch_existing_mysql_schema/migration.sql](C:/Users/Ahmed%20Bilal%20Khan/Desktop/salon/react-backend/prisma/migrations/20260604162000_patch_existing_mysql_schema/migration.sql) so older MySQL databases also get the missing `contact_enquiries.phone`, `contact_enquiries.inquiry_type`, and `platform_offers.salon_id` columns during deployment.

If your DB host blocks Prisma migrations for any reason, you can run the equivalent SQL manually from [database/mysql_patch_for_vercel.sql](C:/Users/Ahmed%20Bilal%20Khan/Desktop/salon/database/mysql_patch_for_vercel.sql) in phpMyAdmin or your MySQL console.

## Existing app data issues to fix before go-live

- If your production database is fresh, `prisma migrate deploy` will create the correct schema automatically.
- If your production database already exists and was created from older SQL, the new patch migration should backfill the missing `contact_enquiries.phone`, `contact_enquiries.inquiry_type`, and `platform_offers.salon_id` columns.

These are app/database issues, not Vercel issues.
