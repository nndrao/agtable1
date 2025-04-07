# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production (runs TypeScript check first)
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Code Style

### TypeScript/React
- Use functional components with hooks
- Define Props interfaces with clear typing
- Use PascalCase for components, camelCase for functions/variables
- Prefer const/let over var
- Use optional chaining (?.) for null/undefined checks
- Use early returns instead of nested conditionals

### Imports
- React imports first
- Third-party libraries next
- Local components grouped by feature
- Utilities and hooks last
- CSS imports at the end

### State Management
- Zustand for state management
- Store divided into state and actions
- Use custom hooks for store access

### Error Handling
- Use try/catch blocks for async operations
- Add defensive coding with null checks
- Provide default values when appropriate

### Component Structure
- Organize by feature, not by type
- Keep components focused and small
- Extract reusable logic to custom hooks