# Coding Standards

## General

- Use strict TypeScript mode.
- No `any` types; prefer `unknown` if type is truly dynamic.
- Export interfaces and schemas centrally from `packages/shared`.

## Naming Conventions

- **Folders**: `kebab-case` (e.g., `user-management`).
- **Files**: `camelCase` for utilities (`dateUtil.ts`), `PascalCase` for React components (`Button.tsx`).
- **Database Tables**: PascalCase in Prisma schemas (e.g., `User`, `EventBooking`).

## Git Commits

- Follow Conventional Commits format enforced by commitlint.
  - `feat: add user login`
  - `fix: correct token expiry bug`
  - `chore: update dependencies`
