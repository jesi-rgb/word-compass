# Agent Guidelines for Word Compass

## Build & Development Commands

- `bun dev` - Start development server. Please never execute this, since the
main dev server is already running in the background. 

- `bun build` - Build for production
- `bun run check` - Type check with svelte-check. Do use this in order to check for type errors.

- `bun run format` - Format code with Prettier
- `bun run lint` - Lint code with Prettier
- `bun run db:push` - Push schema to database
- `bun run db:studio` - Open Drizzle Studio

## Code Style Guidelines

- **Formatting**: Uses Prettier with tabs, single quotes, no trailing commas, 100 char width
- **TypeScript**: Strict mode enabled, use explicit types for interfaces and function parameters
- **Imports**: Use `$lib/` path aliases, import types with `type` keyword
- **Components**: Svelte 5 with runes (`$state`, `$derived`), TypeScript in `<script lang="ts">`
- **Database**: Drizzle ORM with PostgreSQL, snake_case for columns, camelCase for TypeScript
- **API**: Use SvelteKit RequestHandler types, return `json()` responses with proper status codes
- **Error Handling**: Use try-catch blocks, log errors with `console.error`, return 500 status
- **Naming**: camelCase for variables/functions, PascalCase for types/interfaces, kebab-case for files

## No Test Framework

This project currently has no test configuration. When adding tests, check with the user first.
