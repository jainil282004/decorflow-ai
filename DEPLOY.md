# DecorFlow — free test deploy

## Stack

- **GitHub** — source
- **Neon** — free Postgres
- **Render** — free Web Service (API + frontend)

## 1. Neon database

1. Create a free account at https://neon.tech
2. Create a project (e.g. `decorflow`)
3. Copy the connection string (`postgresql://...？sslmode=require`)

## 2. GitHub

Push this repo to GitHub (public is fine for a test).

## 3. Render

1. Create a free account at https://render.com
2. **New → Blueprint** and select this repo (uses `render.yaml`),  
   **or** **New → Web Service** and connect the repo with:
   - **Build:** `npm install && npm run build && npm run db:migrate`
   - **Start:** `npm run start`
   - **Health check:** `/health`
3. Set environment variables:
   - `DATABASE_URL` = Neon connection string
   - `JWT_SECRET` = long random string (or let Render generate)
   - `CORS_ORIGIN` = your Render URL, e.g. `https://decorflow.onrender.com`
   - `NODE_ENV=production`
   - `PORT=10000` (Render sets this; keep in sync if overridden)
   - `VITE_API_URL=` (empty — same-origin API)
4. Deploy. After the first successful deploy, seed login users once:

```bash
# From Render Shell (or locally against Neon):
npm run db:seed
```

## 4. Login

- URL: `https://YOUR-SERVICE.onrender.com`
- Email: `owner@decorflow.com`
- Password: `Password123!`

## Notes

- Free Render services **sleep** after ~15 minutes idle; the first request after sleep can take 30–60s.
- Local API `.env` should use the same Neon `DATABASE_URL` (SQLite is no longer used).
