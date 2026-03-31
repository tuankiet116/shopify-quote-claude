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

---

# Plan: E2E Testing + Fix Standalone Routing + Dev Shop Config

## Context
- 2 dev modes locally:
  - **Embedded**: Shopify Admin → `https://quote-claude.local/app?shop=...` → Laravel Blade → JS từ Vite
  - **Standalone**: `https://quote-claude.local/build` → Vite dev server
- Standalone đang bị lỗi: `No routes matched location "/build/?shop="`
- Store test: `https://admin.shopify.com/store/kietdt-claude-store/apps/claude-quote-ai`

---

## Part A: Fix Standalone Dev Mode

### A1: Runtime basename — `frontend/src/App.tsx`
Standalone lỗi vì `base: '/build/'` trong vite.config nhưng React Router không có basename.

```tsx
const basename = window.location.pathname.startsWith('/build') ? '/build' : '';
<BrowserRouter basename={basename}>
```
- Standalone (`/build/...`): basename = `/build` → route `/` match URL `/build/`
- Embedded (`/app?shop=...`): basename = `''` → hoạt động bình thường

### A2: Dev shop env var
Standalone cần biết đang test shop nào. Config qua env var `VITE_DEV_SHOP`.

- `frontend/.env.example`:
  ```
  VITE_DEV_SHOP=kietdt-claude-store.myshopify.com
  ```
- `frontend/src/api/client.ts` hàm `buildUrl()`: append `&shop=${import.meta.env.VITE_DEV_SHOP}` khi DEV mode

### Files sửa (Part A)
- `frontend/src/App.tsx` — runtime basename
- `frontend/src/api/client.ts` — shop param từ env
- `frontend/.env.example` — tạo mới (template)
- `frontend/.env` — tạo local (gitignored)

---

## Part B: E2E Test Setup (Playwright)

### Install
```bash
cd frontend && npm install -D @playwright/test && npx playwright install chromium
```

### File structure
```
frontend/
├── playwright.config.ts          # 2 projects: setup + embedded
├── e2e/
│   ├── tsconfig.json             # Tách riêng, @playwright/test types
│   ├── auth.setup.ts             # Login thủ công + save session
│   ├── fixtures/
│   │   └── shopify.ts            # Custom fixture: navigate app, locate iframe
│   ├── home.spec.ts              # Test HomePage trong iframe
│   ├── routing.spec.ts           # Test routing
│   └── .auth/
│       └── session.json          # Saved browser session (GITIGNORED)
```

### Auth: Login thủ công (có 2FA)
- `auth.setup.ts`: navigate Shopify login → `page.pause()` → user login thủ công → resume → save storageState
- Session lưu ở `e2e/.auth/session.json`, gitignored
- Chạy: `npm run test:e2e:setup`

### Fixture: iframe handling
Shopify Admin render app trong `<iframe>`. Playwright dùng `frameLocator`:
```ts
const appFrame = page.frameLocator('iframe[src*="quote-claude"]');
await expect(appFrame.getByRole('heading', { name: 'Claude Quote AI' })).toBeVisible();
```

### Test assertions
- `e2e/home.spec.ts`:
  - Page heading "Claude Quote AI" visible
  - Welcome banner visible
  - 3 feature descriptions visible
  - "Start setup" button visible + enabled
  - Section headings "What this app does" và "Get started"

- `e2e/routing.spec.ts`:
  - App loads thành công trong Shopify Admin iframe

### Package.json scripts
```json
"test:e2e:setup": "playwright test --project=setup --headed",
"test:e2e": "playwright test --project=embedded",
"test:e2e:headed": "playwright test --project=embedded --headed"
```

### Security
- `.gitignore` thêm `e2e/.auth/`
- Không lưu credentials trong code, chỉ lưu browser session state

---

## Tổng hợp files

### Tạo mới
- `frontend/playwright.config.ts`
- `frontend/e2e/tsconfig.json`
- `frontend/e2e/auth.setup.ts`
- `frontend/e2e/fixtures/shopify.ts`
- `frontend/e2e/home.spec.ts`
- `frontend/e2e/routing.spec.ts`
- `frontend/.env.example`

### Sửa
- `frontend/src/App.tsx` — runtime basename
- `frontend/src/api/client.ts` — shop param từ env
- `frontend/package.json` — devDep + scripts
- `frontend/.gitignore` — `e2e/.auth/`

---

## Workflow
```bash
# 1. Setup env
cp frontend/.env.example frontend/.env
# Edit VITE_DEV_SHOP với shop domain

# 2. Login Shopify lần đầu (hoặc khi session hết hạn)
cd frontend && npm run test:e2e:setup
# → Browser mở, user login thủ công (email + password + 2FA authenticator)
# → Nhấn Resume trong Playwright Inspector sau khi login xong
# → Session saved to e2e/.auth/session.json

# 3. Chạy test (dùng session đã lưu)
npm run test:e2e          # headless
npm run test:e2e:headed   # xem browser
```
