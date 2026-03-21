---
name: laravel-best-practices
description:
  Laravel backend best practices for clean, pragmatic, production-ready code.
  Use this skill whenever writing Laravel controllers, services, models, migrations,
  form requests, API resources, actions, DTOs, or tests. Triggers on any Laravel
  backend task — new features, refactoring, API design, database schema, validation,
  error handling, or code review. Follow these patterns to keep code organized without
  over-engineering.
---

# Laravel Best Practices

Pragmatic patterns for Laravel backends. The goal is code that's clean and organized
enough to scale, but not so abstracted that it becomes hard to follow. When in doubt,
choose the simpler approach — you can always refactor later when complexity demands it.

## Core Principle: Right-Size Your Architecture

Not every endpoint needs every layer. Scale complexity to match the task:

| Complexity | What to use |
|---|---|
| Simple CRUD, trivial query | Controller + inline validation |
| Moderate logic, reusable queries | Controller + FormRequest + Service + Repository |
| Complex business logic, multiple steps | Controller + FormRequest + Service + Repository + Action + DTO |
| Domain-critical, complex, shared across contexts | Full domain layer with all of the above |

## When to Apply

Reference these rules when:

- Creating or modifying controllers, services, or models
- Designing API endpoints and response formats
- Writing database migrations or model relationships
- Implementing validation or error handling
- Writing tests
- Reviewing Laravel code for quality

## Rules

Each rule file in `rules/` covers a specific pattern. Read the relevant ones
based on the task at hand:

### Architecture & Structure
- `architecture-service-layer.md` — When and how to use services
- `architecture-repository.md` — Repository pattern for database queries
- `architecture-action-classes.md` — Single-responsibility action classes
- `architecture-dtos.md` — Data Transfer Objects placement and usage

### API Design
- `api-form-requests.md` — Extracting validation into FormRequest classes
- `api-resources.md` — API Resources for consistent response formatting
- `api-error-handling.md` — Error responses and exception handling

### Models & Database
- `model-best-practices.md` — Scopes, casts, relationships, accessors
- `database-migrations.md` — Migration conventions and indexing

### Testing
- `testing-strategy.md` — What to test, how to structure tests

### Code Quality
- `code-quality.md` — Naming, file organization, general conventions
