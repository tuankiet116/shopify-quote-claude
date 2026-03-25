# Plan: Shopify App Scaffold

## Context
Minimal Shopify embedded app scaffold with custom auth (no third-party packages).
Laravel API backend + React SPA frontend + Theme App Extension stub.

## What Works
- Shopify OAuth install flow (Authorization Code Grant)
- Token Exchange for embedded app session verification
- Developer bypass mode (`?scope=developer` in non-production)
- Webhook handling (`app/uninstalled`)
- React SPA with Polaris, served via App Bridge 4 CDN
- Consistent API error/success response format with shop-context logging

## Tech Stack
- **Backend:** Laravel, PHP 8.3+, MySQL, firebase/php-jwt
- **Frontend:** React 19, Vite 8, TypeScript, Shopify Polaris 13, App Bridge 4 CDN, Tailwind CSS 4
- **Storefront:** Theme App Extension (stub, no active code)

## Architecture
```
shopify-quote-claude/
├── backend/
│   ├── app/
│   │   ├── Exceptions/ApiException.php
│   │   ├── Http/Controllers/Auth/ShopifyAuthController.php
│   │   ├── Http/Controllers/Controller.php
│   │   ├── Http/Controllers/WebhookController.php
│   │   ├── Http/Middleware/ (VerifyShopifySession, VerifyShopifyWebhook, EnsureShopifyEmbedded)
│   │   ├── Models/ (Shop, User)
│   │   └── Services/Shopify/ShopifyAuthService.php
│   ├── config/shopify.php
│   ├── database/migrations/ (users, cache, jobs, shops)
│   ├── resources/views/app.blade.php
│   └── routes/ (web.php, api.php)
├── frontend/
│   ├── src/
│   │   ├── api/client.ts
│   │   ├── hooks/useAppQuery.ts
│   │   ├── layouts/AppLayout.tsx
│   │   ├── pages/home/ (HomePage.tsx, components/ShopInfo.tsx)
│   │   ├── App.tsx, main.tsx, app.css
│   ├── vite.config.ts, tsconfig.json, package.json
├── storefront/ (stub)
├── CLAUDE.md, PLAN.md, shopify.app.toml
```

## Database
- **shops:** shop (domain), access_token (encrypted), is_active, installed_at, uninstalled_at

## Next Steps
Features can be added incrementally:
1. Add models, migrations, controllers as needed
2. Add storefront JS when theme extension features are needed
3. Expand API scopes in `shopify.app.toml` and `config/shopify.php`
