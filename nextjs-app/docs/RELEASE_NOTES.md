# TapMenu Armenia — Release Notes

---

## PHASE 00 — Foundation Audit (2026-03-24)

### Summary
Initial audit and scaffolding for the incremental MVP evolution. No existing functionality was modified or removed.

### Added
- `docs/CURRENT_STATE.md` — Complete as-is architecture document with:
  - Full route inventory (39 Next.js pages, 7 API routes, 13 static HTML pages)
  - Database schema audit (13 Prisma models, 3 Supabase migrations)
  - Component and library inventory (16 components, 8 lib modules)
  - Authentication architecture analysis
  - External service dependency map
  - 15 identified technical debt items
  - Full environment variable reference

- `docs/TARGET_STATE.md` — Target architecture with:
  - Module map (Guest App, Owner Cabinet, Admin, Transformer, Payments, POS)
  - 7-phase roadmap (Phase 00-06)
  - Target file structure with new directories
  - 13 feature flag definitions
  - New database model designs (Order, Review, FeatureFlag, AuditLog, Notification)
  - Development rules and conventions
  - MVP success criteria

- `docs/ARCHITECTURE.md` — High-level architecture diagrams and data flows

- `docs/FEATURE_FLAGS.md` — Feature flag reference with usage examples

- `docs/RELEASE_NOTES.md` — This file

- `src/lib/feature-flags.ts` — Feature flag system with:
  - 13 flags across 6 phases
  - 4 scope types (global, restaurant, tariff, role)
  - Priority evaluation: DB > ENV > plan/role > default
  - `isFeatureEnabled()` and `requireFeature()` APIs
  - `FeatureDisabledError` custom error class
  - `getAllFlags()` utility for debugging

- `src/lib/logger.ts` — Structured logging system with:
  - Scoped logger factory (`createLogger('module.name')`)
  - 4 log levels (debug, info, warn, error)
  - JSON output in production, pretty-print in development
  - Automatic sensitive data redaction
  - Error serialization (stack trace only in dev)
  - Never-throw guarantee

- `docs/`, `scripts/`, `tests/` directories scaffolded

### Changed
- Nothing. Zero changes to existing code.

### Removed
- Nothing.

### Migration Notes
- No database migrations required.
- No environment variable changes required.
- New files are purely additive.

### Rollback
- Safe to remove all files in `docs/`, `src/lib/feature-flags.ts`, and `src/lib/logger.ts` without affecting existing functionality.

---

<!-- TEMPLATE for future releases:

## PHASE XX — Title (YYYY-MM-DD)

### Summary
Brief description.

### Added
- Item 1
- Item 2

### Changed
- Item 1

### Removed
- Item 1

### Migration Notes
- Required database migrations
- Required environment variable changes

### Rollback
- Steps to safely revert this phase

-->
