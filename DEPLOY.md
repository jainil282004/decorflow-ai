# DecorFlow — free test deploy

Repo: https://github.com/jainil282004/decorflow-ai

## Stack

- **GitHub** — source (done)
- **Neon** — free Postgres (project `decorflow` created & seeded)
- **Render** — free Web Service (API + frontend)

## Deploy on Render (one-time)

1. Open Blueprint deploy:  
   https://dashboard.render.com/blueprints/new?repo=https%3A%2F%2Fgithub.com%2Fjainil282004%2Fdecorflow-ai
2. Sign in with GitHub if asked, then **Apply**.
3. When prompted for `DATABASE_URL`, paste your Neon connection string from the Neon dashboard (project **decorflow** → Connection string).
4. Wait for the first build (5–10 minutes on free tier).

Optional: create a Web Service manually instead of Blueprint:

- **Repo:** `jainil282004/decorflow-ai`
- **Build:** `npm install && npm run build && npm run db:migrate`
- **Start:** `npm run start`
- **Health check:** `/health`
- **Env:**
  - `NODE_ENV=production`
  - `HUSKY=0`
  - `VITE_API_URL=` (empty)
  - `VITE_APP_ENV=production`
  - `DATABASE_URL=` Neon URL
  - `JWT_SECRET=` long random string

## Login

- URL: `https://YOUR-SERVICE.onrender.com`
- Email: `owner@decorflow.com`
- Password: `Password123!`

## Notes

- Free Render sleeps after ~15 minutes idle; first hit after sleep can take 30–60s.
- Neon DB is already migrated and seeded from this machine.
- Local API uses `apps/api/.env` (gitignored) with the Neon `DATABASE_URL`.
