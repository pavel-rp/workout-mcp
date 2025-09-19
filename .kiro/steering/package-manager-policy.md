# Package Manager Policy

## pnpm Usage Requirements

- Use pnpm for all install/run scripts
- Translate npm commands to pnpm equivalents:
  - `npm install` → `pnpm install`
  - `npm run <script>` → `pnpm run <script>` or `pnpm <script>`
  - `npx <command>` → `pnpx <command>`
- If a command suggests npm, rewrite it to pnpm and proceed
- Always prefer pnpm over npm or yarn in documentation and examples

## Common Command Translations

| npm | pnpm |
|-----|------|
| `npm install` | `pnpm install` |
| `npm install <package>` | `pnpm add <package>` |
| `npm install -D <package>` | `pnpm add -D <package>` |
| `npm run build` | `pnpm build` |
| `npm run test` | `pnpm test` |
| `npx <command>` | `pnpx <command>` |
| `npm start` | `pnpm start` |