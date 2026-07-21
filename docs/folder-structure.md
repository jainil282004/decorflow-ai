# Folder Structure

## Monorepo Layout

```
/
├── apps/
│   ├── api/          # Express Backend
│   └── web/          # React Frontend
├── packages/
│   ├── config/       # Shared ESLint/Prettier/TSConfigs
│   ├── logger/       # Winston Logger Wrapper
│   ├── shared/       # Zod schemas & DTO types
│   └── utils/        # Date, String, Pagination helpers
├── docs/             # Engineering guidelines
└── turbo.json        # Turborepo task orchestrator
```
