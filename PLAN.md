# Plan: Shopify Quote Embedded App

## Context

Xây dựng một Shopify embedded app cho phép merchant tạo và quản lý báo giá (quotes) cho buyer. App giải quyết nhu cầu B2B/wholesale khi merchant cần deal giá với buyer trước khi chốt đơn. Buyer có thể add sản phẩm vào quote từ storefront (product/collection pages), submit form yêu cầu báo giá, và merchant xử lý báo giá trong admin.

**Tech Stack:** Laravel 12 (API backend) + MySQL + React SPA (Vite) + Shopify App Bridge 4 + Polaris + Theme App Extension + App Proxy + Draft Order API.

**Authentication:** Tự viết toàn bộ (không dùng package third-party). Custom middleware cho Token Exchange, HMAC verification, App Proxy auth.

**Frontend:** React SPA thuần (không Inertia.js). App Bridge quản lý routing + `authenticatedFetch` cho API calls. Laravel chỉ serve JSON API.

---

## Project Structure

```
shopify-quote-claude/
├── backend/                              # Laravel 12 API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── Auth/
│   │   │   │   │   └── ShopifyAuthController.php
│   │   │   │   ├── QuoteController.php
│   │   │   │   ├── QuoteFormConfigController.php
│   │   │   │   ├── SettingsController.php
│   │   │   │   ├── DashboardController.php
│   │   │   │   ├── ProductController.php
│   │   │   │   ├── StorefrontProxyController.php
│   │   │   │   └── WebhookController.php
│   │   │   └── Middleware/
│   │   │       ├── VerifyShopifySession.php
│   │   │       ├── VerifyShopifyWebhook.php
│   │   │       ├── VerifyAppProxy.php
│   │   │       └── EnsureShopifyEmbedded.php
│   │   ├── Models/
│   │   │   ├── Shop.php
│   │   │   ├── ShopSetting.php
│   │   │   ├── Quote.php
│   │   │   ├── QuoteItem.php
│   │   │   ├── QuoteFormConfig.php
│   │   │   ├── QuoteFormField.php
│   │   │   ├── QuoteActivity.php
│   │   │   └── QuoteNumberSequence.php
│   │   ├── Services/
│   │   │   ├── Shopify/
│   │   │   │   ├── ShopifyAuthService.php
│   │   │   │   ├── ShopifyGraphqlService.php
│   │   │   │   ├── ShopifyDraftOrderService.php
│   │   │   │   └── ShopifyWebhookService.php
│   │   │   ├── QuoteNumberService.php
│   │   │   └── QuoteAutomationService.php
│   │   └── Console/Commands/
│   │       └── ProcessQuoteAutomation.php
│   ├── database/migrations/
│   ├── routes/
│   │   ├── web.php
│   │   ├── api.php
│   │   └── console.php
│   ├── config/shopify.php
│   ├── resources/views/app.blade.php
│   ├── composer.json
│   └── .env
├── frontend/                             # React SPA (Admin)
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── api/
│   │   │   └── client.ts
│   │   ├── hooks/
│   │   │   └── useAppQuery.ts
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── quotes/
│   │   │   │   ├── QuoteList.tsx
│   │   │   │   ├── QuoteDetail.tsx
│   │   │   │   └── QuoteCreate.tsx
│   │   │   ├── form-builder/
│   │   │   │   ├── FormBuilderList.tsx
│   │   │   │   └── FormBuilderEdit.tsx
│   │   │   └── Settings.tsx
│   │   ├── components/
│   │   │   ├── QuoteStatusBadge.tsx
│   │   │   ├── QuoteItemRow.tsx
│   │   │   ├── QuoteTimeline.tsx
│   │   │   ├── FormFieldEditor.tsx
│   │   │   └── PriceEditor.tsx
│   │   └── layouts/
│   │       └── AppLayout.tsx
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── package.json
├── storefront/                           # Theme App Extension + Storefront JS
│   ├── extension/
│   │   ├── shopify.extension.toml
│   │   ├── blocks/
│   │   │   └── quote-embed.liquid
│   │   ├── assets/
│   │   │   ├── quote-app.min.js          # Built output
│   │   │   └── quote-app.css
│   │   └── locales/
│   │       └── en.default.json
│   ├── src/
│   │   ├── main.ts
│   │   ├── types.ts
│   │   ├── QuoteApp.ts
│   │   ├── QuoteCart.ts
│   │   ├── QuoteButton.ts
│   │   ├── QuoteDrawer.ts
│   │   ├── QuoteForm.ts
│   │   ├── QuoteAPI.ts
│   │   └── utils/
│   │       ├── dom.ts
│   │       └── storage.ts
│   ├── tsconfig.json
│   └── vite.config.ts
├── shopify.app.toml
├── PLAN.md
└── README.md
```

---

## Phase 0: Khởi tạo Project

### 0.1 Tạo Laravel 12 project
```bash
composer create-project laravel/laravel backend
```

### 0.2 Cài React SPA dependencies (TypeScript)
```bash
cd frontend
npm init -y
npm install react react-dom react-router-dom
npm install @shopify/app-bridge-react @shopify/polaris @shopify/polaris-icons
npm install -D vite @vitejs/plugin-react typescript @types/react @types/react-dom @types/react-router-dom
```

### 0.3 Cài backend dependencies
```bash
cd backend
composer require firebase/php-jwt
```

### 0.4 Cài Shopify CLI (cho theme extension + deploy)
```bash
npm install -g @shopify/cli @shopify/theme
```

### 0.5 Cấu hình `shopify.app.toml` (root)
```toml
name = "Quote App"
client_id = "<from Partner Dashboard>"
application_url = "https://<ngrok-or-domain>/app"
embedded = true

[access_scopes]
scopes = "write_draft_orders,read_draft_orders,write_orders,read_orders,read_products,read_customers,write_customers"

[auth]
redirect_urls = ["https://<domain>/auth/shopify/callback"]

[app_proxy]
url = "https://<domain>/api/storefront"
prefix = "apps"
subpath = "quote"

[webhooks]
api_version = "2025-07"

[[webhooks.subscriptions]]
topics = ["draft_orders/create", "draft_orders/update", "orders/create", "app/uninstalled"]
uri = "/api/webhooks"
```

### 0.6 Cấu hình `.env` (backend)
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=shopify_quote
DB_USERNAME=root
DB_PASSWORD=

SHOPIFY_API_KEY=<client_id>
SHOPIFY_API_SECRET=<client_secret>
SHOPIFY_API_SCOPES=write_draft_orders,read_draft_orders,write_orders,read_orders,read_products,read_customers,write_customers
SHOPIFY_API_VERSION=2025-07
SHOPIFY_APP_URL=https://<ngrok-or-domain>
```

---

## Phase 1: Authentication & Shopify Integration (Custom - không dùng package)

### 1.1 Tổng quan Auth Flow

Hỗ trợ 2 flow song song:

**Flow A - Managed Installation + Token Exchange (cho embedded app):**
1. Merchant click "Install" trên Shopify → Shopify managed install (scopes từ TOML)
2. App loads trong iframe → App Bridge CDN tự inject
3. Mỗi request từ frontend: App Bridge attach session token (JWT) trong `Authorization: Bearer <token>`
4. Backend middleware decode JWT → verify → exchange cho access token → lưu DB
5. Access token dùng để gọi Shopify Admin API

**Flow B - Authorization Code Grant (fallback / first install):**
1. `GET /auth/shopify?shop=store.myshopify.com` → validate shop domain → redirect tới Shopify OAuth consent
2. Shopify redirect về `GET /auth/shopify/callback?code=xxx&hmac=yyy&shop=zzz`
3. Backend verify HMAC → exchange code → access token → lưu DB → redirect vào embedded app

### 1.2 Custom Auth Service

**File:** `backend/app/Services/Shopify/ShopifyAuthService.php`

Methods:
- `buildAuthUrl(string $shop, string $nonce): string` — Build OAuth consent URL
- `verifyHmac(array $queryParams): bool` — HMAC-SHA256 verify cho OAuth callback
- `exchangeCodeForToken(string $shop, string $code): array` — Exchange auth code → access token
- `decodeSessionToken(string $token): array` — JWT decode + verify (HS256, firebase/php-jwt)
- `exchangeSessionTokenForAccessToken(string $shop, string $sessionToken): array` — Token Exchange flow
- `verifyWebhookHmac(string $rawBody, string $hmacHeader): bool` — Webhook HMAC verify
- `verifyAppProxySignature(array $queryParams): bool` — App Proxy signature verify
- `sanitizeShopDomain(?string $shop): ?string` — Validate shop domain format

### 1.3 Middleware

- **`VerifyShopifySession`** — JWT decode → Token Exchange → set shop on request
- **`VerifyShopifyWebhook`** — HMAC-SHA256 webhook verify
- **`VerifyAppProxy`** — App Proxy signature verify
- **`EnsureShopifyEmbedded`** — CSP frame-ancestors header

### 1.4 Auth Controller

- `GET /auth/shopify` — OAuth redirect
- `GET /auth/shopify/callback` — Verify HMAC, exchange code, create shop, register webhooks

### 1.5 Root Blade Template (SPA entry)

**File:** `backend/resources/views/app.blade.php`

Serves the built React SPA with App Bridge CDN script tag and Vite asset references.

### 1.6 Routes

**web.php:** OAuth routes + SPA catch-all (`/app/{any?}`)
**api.php:** Admin API (session token) + App Proxy (signature) + Webhooks (HMAC)

---

## Phase 2: Database Schema (MySQL)

8 tables:
- **shops** — shopify_domain, access_token (encrypted), scopes, is_active
- **shop_settings** — quote_expiry_days, auto_expire, notifications, email templates
- **quotes** — quote_number, status (enum 8 values), customer info, pricing, draft_order_gid, order_gid
- **quote_items** — product/variant IDs, titles, quantity, original_price, offered_price
- **quote_form_configs** — name, is_default, is_active
- **quote_form_fields** — field_name, field_label, field_type (enum), is_required, options (JSON)
- **quote_activities** — action, details (JSON), actor (enum)
- **quote_number_sequences** — shop_id, last_number (auto-increment)

---

## Phase 3: Admin Backend (Laravel Controllers + Services)

### Controllers
- **DashboardController** — stats (totals, pending, sent, accepted, revenue, recent quotes)
- **QuoteController** — CRUD + sendQuote + convertToOrder + addNote
- **QuoteFormConfigController** — CRUD + publish (sync to metafield)
- **SettingsController** — show/update settings + updateStorefront (metafield sync)
- **StorefrontProxyController** — formConfig + submitQuote + quoteStatus
- **WebhookController** — orders/create + app/uninstalled
- **ProductController** — GraphQL product search proxy

### Services
- **ShopifyGraphqlService** — Base authenticated GraphQL client
- **ShopifyDraftOrderService** — createFromQuote, sendInvoice, complete, calculate
- **ShopifyWebhookService** — registerAll, unregisterAll
- **QuoteNumberService** — Sequential numbering with DB locking
- **QuoteAutomationService** — Auto-expiry + reminders

---

## Phase 4: Admin Frontend (React SPA + Polaris + App Bridge)

### Pages
- **Dashboard** — Stats cards + recent quotes IndexTable
- **QuoteList** — Tabs (status filter) + search + pagination + IndexTable
- **QuoteCreate** — Customer form + Resource Picker + line items
- **QuoteDetail** — Editable items/prices, discount, customer info, timeline, send/convert actions
- **FormBuilderList** — IndexTable of form configs
- **FormBuilderEdit** — Sortable fields + preview panel + publish to metafield
- **Settings** — Quote settings + notifications + button appearance + cart settings

### Shared Components
- QuoteStatusBadge, QuoteItemRow, QuoteTimeline, FormFieldEditor, PriceEditor

### API Client
- `authenticatedFetch` via App Bridge CDN `shopify.idToken()`
- `apiGet`, `apiPost`, `apiPut`, `apiDelete` helpers
- `useAppQuery` hook (SWR-like)

---

## Phase 5: Storefront - Theme App Extension

### Architecture
- **Theme embed app** — JS is core, Liquid only maps metafield settings → `window.__QUOTE_APP__`
- **Settings stored in shop metafields** (namespace `$app`): quote_button_settings, quote_form_config, quote_cart_settings
- **Storefront JS** built as IIFE bundle via Vite

### Metafield Structure
- `shop.metafields.app.quote_button_settings` — button text, colors, size, position, toggles
- `shop.metafields.app.quote_form_config` — form fields, title, description, submit text
- `shop.metafields.app.quote_cart_settings` — enabled, position, badge color, drawer width

### TypeScript Modules
- **QuoteApp** — Main orchestrator
- **QuoteButton** — Inject on product/collection pages
- **QuoteCart** — localStorage state management with events
- **QuoteDrawer** — Floating button + slide-in panel
- **QuoteForm** — Modal form for quote submission
- **QuoteAPI** — App Proxy communication

---

## Phase 6: Automation (Laravel Scheduler)

- `php artisan quotes:process-automation` — Hourly via scheduler
- Auto-expiry: quotes status=sent AND expires_at < now() → expired
- Reminders: quotes expiring within N days → re-send invoice

---

## Key Technical Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Laravel 12 + React SPA | Flexible, not locked to Shopify CLI versioning |
| Database | MySQL | Production-ready, reliable |
| Auth flow | Custom Token Exchange + OAuth fallback | Full control, no third-party dependency |
| Frontend | React SPA (Vite) + JSON API | Clean separation, App Bridge manages routing |
| Admin UI | Polaris React | Shopify official design system |
| Quote storage | App DB + Draft Orders | DB for rich data; Draft Order only when sending |
| Storefront cart | localStorage | Client-side, persist across pages |
| Scheduling | Laravel Scheduler | Built-in, cron-based |

---

## Implementation Order

### Sprint 1 - Foundation + Custom Auth (Week 1-2)
### Sprint 2 - Core Quote Management (Week 3-4)
### Sprint 3 - Storefront + Form Builder (Week 5-6)
### Sprint 4 - Automation + Polish (Week 7-8)
