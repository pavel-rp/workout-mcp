# Workout MCP Server

A TypeScript-based MCP server for workout tracking and guidance.

## Features

- Workout session management
- Exercise tracking and history
- Contextual workout prompts and guidance
- Local SQLite data storage
- Performance calculations and metrics

## Development

### Setup

```bash
pnpm install
pnpm run build
```

### Running

```bash
# Start the server
pnpm start

# Start with debugging (stdio mode)
pnpm run start:stdio
```

### Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm run test:watch
```

### Development

```bash
# Build in watch mode
pnpm run dev
```

## Architecture

- **MCP Server**: Handles tool calls and resource requests
- **Database**: SQLite with Drizzle ORM
- **Validation**: Zod schemas for input validation
- **Workflow Engine**: Static workout guidance and prompts

## Database

The server uses SQLite with WAL mode for optimal performance and concurrent access.
Database file is stored as `workout.db` in the project root.