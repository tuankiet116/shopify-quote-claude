# CLAUDE.md - Project Instructions

## Project Overview
Shopify embedded app scaffold. Laravel API backend + React SPA frontend + Theme Extension stub.
Custom auth (no third-party Shopify packages). App Bridge 4 CDN for embedded context.

## Architecture
- `backend/` - Laravel API. Serves React SPA via Blade at `/app/*`. Handles OAuth + webhooks.
- `frontend/` - React SPA. Built with Vite, output to `backend/public/build/`.
- `storefront/` - Shopify Theme App Extension. Currently a stub.
- Monolith: frontend is served by backend, same domain.

## Key Files
- `backend/app/Services/Shopify/ShopifyAuthService.php` — All Shopify auth/verification logic
- `backend/app/Http/Middleware/VerifyShopifySession.php` — JWT + Token Exchange + Developer bypass
- `backend/app/Http/Controllers/Auth/ShopifyAuthController.php` — OAuth install flow
- `backend/app/Exceptions/ApiException.php` — Single exception class for all API errors
- `backend/bootstrap/app.php` — Exception handling with shop context logging
- `frontend/src/api/client.ts` — API client (auto developer mode in Vite dev)

## Database
- `shops` table: `shop` (domain), `access_token` (encrypted), `is_active`, `installed_at`, `uninstalled_at`

## API Response Format
```json
// Success
{ "success": true, "data": { ... } }
// Error
{ "success": false, "error": { "code": "error_code", "message": "..." } }
```

## Development

### Local dev (developer mode)
```bash
cd backend && php artisan serve          # http://localhost:8000
cd frontend && pnpm dev                  # Vite HMR at localhost:5173
```
- `pnpm dev` → `import.meta.env.DEV === true` → auto appends `?scope=developer` to API calls
- Backend bypasses JWT, loads shop from `SHOPIFY_DEV_SHOP_DOMAIN` env var

### Embedded mode (Shopify admin)
```bash
ngrok http 8000                          # Expose backend
# Set SHOPIFY_APP_URL in .env to ngrok URL
cd frontend && pnpm build                # Build production assets
```

## Conventions
- Backend: Laravel conventions. `php artisan make:` commands.
- API responses: `$this->success($data)` / throw `ApiException`
- Frontend: Shopify Polaris components for UI. Pages organized as folders (`pages/home/`).
- Each page folder has `PageName.tsx` + `components/` subdirectory.
- All API routes: `/api/shopify/` prefix with session token auth.
- Webhook routes: `/api/webhooks` with HMAC auth.

## Do NOT
- Install shopify-laravel or other Shopify auth packages. Auth is custom.
- Use Inertia.js. Frontend is a standalone React SPA served via Blade.
- Add features without migrations. Database changes need proper migrations.
- Use App Proxy. It has been intentionally removed from this project.
