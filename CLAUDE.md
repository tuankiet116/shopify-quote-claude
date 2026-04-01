# CLAUDE.md - Project Instructions

## Project Overview
Shopify embedded app — Quote/Báo giá. Laravel API backend + React SPA frontend + Theme Extension.
Custom auth via managed installation + token exchange (no third-party Shopify packages).

## Architecture
- `backend/` — Laravel 13 API. Serves React SPA via Blade. Handles webhooks + token exchange.
- `frontend/` — React SPA. Vite build output to `backend/public/build/`. **See `frontend/CLAUDE.md` for UI component rules.**
- `storefront/` — Shopify Theme App Extension (quote button + form).
- `docker/` — Production Docker (multi-stage build, Supervisor, Nginx).
- Monolith: frontend is served by backend, same domain.

## Auth Flow (Managed Installation)
1. Shopify handles install (scopes from `shopify.app.toml`)
2. App loads in iframe → `EnsureShopifyInstalled` middleware reads `id_token` from query
3. First load: token exchange → save shop + access_token to DB
4. API calls: frontend sends session token via `Authorization: Bearer` → `VerifyShopifySession` middleware verifies JWT + loads shop
5. No OAuth redirect/callback routes — all auth is token-based

## Key Files
- `backend/app/Http/Middleware/EnsureShopifyInstalled.php` — Install check + token exchange on first load
- `backend/app/Http/Middleware/VerifyShopifySession.php` — API auth (JWT verify + load shop)
- `backend/app/Services/Shopify/ShopifyAuthService.php` — JWT decode, token exchange, webhook HMAC
- `backend/app/Http/Controllers/WebhookController.php` — app/uninstalled handler
- `frontend/src/api/client.ts` — API client (auto developer mode in Vite dev)
- `storefront/shopify.app.toml` — App config (client_id, scopes, webhooks)

## Database
- `shops` table: `shop` (domain), `access_token` (encrypted), `is_active`, `installed_at`, `uninstalled_at`

## API Response Format
```json
{ "success": true, "data": { ... } }
{ "success": false, "error": { "code": "error_code", "message": "..." } }
```

## Development

### Local dev
```bash
cd backend && php artisan serve --port=8001    # Backend
cd frontend && npm run dev                      # Vite HMR at localhost:3001
```
- Nginx proxy: `https://quote-claude.local` → backend:8001 + frontend:3001
- Developer mode: `?scope=developer` → bypass JWT, load from `SHOPIFY_DEV_SHOP_DOMAIN`
- Standalone dev: `http://localhost:3001/build/` → mock Shopify context, Polaris React components

### Embedded mode (Shopify Admin)
- Open app from Shopify Admin → loads via `https://quote-claude.local`
- Uses Polaris Web Components (`<s-*>` tags)

## Conventions
- Backend: Laravel conventions. `php artisan make:` commands.
- API responses: `$this->success($data)` / throw `ApiException`
- Frontend: **Q* wrapper components** — auto-switch between Shopify Web Components (embedded) + Polaris React (standalone). See `frontend/CLAUDE.md`.
- Pages: single file using Q* components (no separate Embedded/Standalone files needed).
- All API routes: `/api/shopify/` prefix with session token auth.
- Webhook routes: `/api/webhooks` with HMAC auth.

## Do NOT
- Install shopify-laravel or other Shopify auth packages. Auth is custom.
- Use Inertia.js. Frontend is a standalone React SPA served via Blade.
- Add features without migrations. Database changes need proper migrations.
- Import `@shopify/polaris` or use `<s-*>` tags directly in pages. Always use Q* wrapper components from `@/components/polaris`.
- Không được thêm mô tả tính năng và các file Claude.nd