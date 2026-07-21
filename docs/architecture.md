# Architecture Guidelines

This project utilizes a Clean Architecture approach within a Monorepo context.

## Frontend (`apps/web`)

- **Framework**: React with Vite.
- **State Management**: React Query for server state, Zustand for client state.
- **Styling**: Tailwind CSS + shadcn/ui.

## Backend (`apps/api`)

- **Framework**: Express.js with TypeScript.
- **ORM**: Prisma connected to PostgreSQL.
- **Logging**: Winston logger.
- **Structure**: Domain-driven modules (Controller -> Service -> Repository).

## Packages (`packages/`)

- Shared schemas, configurations, and utilities.
