# CLAUDE.md - Backend Instructions

## Stack
- **PHP 8.3+**, **Laravel 13**
- **MySQL** (local dev: root:root, database `shopify_quote`)
- **Firebase/php-jwt** cho JWT decode (không dùng package Shopify nào)
- Session/Cache/Queue: database driver (production sẽ dùng Redis)

## Chạy dev
```bash
php artisan serve --port=8001
```
Nginx proxy SSL: `https://quote-claude.local` → `http://127.0.0.1:8001`

## Cấu trúc thư mục

```
backend/
├── app/
│   ├── Exceptions/
│   │   └── ApiException.php           # Custom exception → JSON error response
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Controller.php         # Base: shop(), success(), created()
│   │   │   └── WebhookController.php  # Webhook routing (app/uninstalled)
│   │   └── Middleware/
│   │       ├── EnsureShopifyInstalled.php   # Install check + token exchange + CSP
│   │       ├── VerifyShopifySession.php    # API auth: JWT verify + load shop
│   │       └── VerifyShopifyWebhook.php   # Webhook HMAC verify
│   ├── Models/
│   │   ├── Shop.php                   # shop, access_token (encrypted), is_active
│   │   └── User.php                   # Không dùng (Laravel default)
│   ├── Providers/
│   │   └── AppServiceProvider.php     # Trống
│   └── Services/
│       └── Shopify/
│           └── ShopifyAuthService.php # JWT, token exchange, HMAC, helpers
├── config/
│   └── shopify.php                    # api_key, api_secret, api_version, app_url, dev_shop_domain
├── database/migrations/
│   ├── 0001_01_01_000000_create_users_table.php
│   ├── 0001_01_01_000001_create_cache_table.php
│   ├── 0001_01_01_000002_create_jobs_table.php
│   └── 2026_03_21_000001_create_shops_table.php
├── resources/views/
│   └── app.blade.php                  # SPA shell (App Bridge CDN + Vite)
├── routes/
│   ├── web.php                        # GET / + GET /app/{any?} → SPA
│   └── api.php                        # API + webhook routes
└── bootstrap/
    └── app.php                        # Middleware aliases + exception handlers
```

## Middleware

| Alias | Class | Dùng cho | Chức năng |
|-------|-------|----------|-----------|
| `ensure.shopify.installed` | `EnsureShopifyInstalled` | Web routes (`/`, `/app/*`) | Lấy `id_token` từ query → token exchange nếu chưa install → set CSP header |
| `verify.shopify.session` | `VerifyShopifySession` | API routes (`/api/shopify/*`) | Verify JWT Bearer token → load shop từ DB → set `shopifyShop` attribute |
| `verify.shopify.webhook` | `VerifyShopifyWebhook` | Webhook route (`/api/webhooks`) | Verify HMAC-SHA256 → set `shopifyDomain` + `webhookTopic` attributes |

### Developer mode
Khi `APP_ENV=local` và request có `?scope=developer`:
- `VerifyShopifySession` bypass JWT, load shop từ `SHOPIFY_DEV_SHOP_DOMAIN` env
- Frontend tự append `?scope=developer` khi `import.meta.env.DEV === true`

## Routes

### Web (routes/web.php)
```
GET /          → app.blade.php   [ensure.shopify.installed]
GET /app/{any} → app.blade.php   [ensure.shopify.installed]
```

### API (routes/api.php)
```
GET  /api/shopify/shop    → inline closure    [verify.shopify.session]
POST /api/webhooks        → WebhookController [verify.shopify.webhook]
```

## Base Controller helpers

```php
// Lấy shop model từ request (đã set bởi middleware)
$shop = $this->shop($request);

// Response thành công
return $this->success($data);                    // 200
return $this->success($data, 'Created', 201);
return $this->created($data);                    // 201

// Response lỗi
throw new ApiException('Not found', 'not_found', 404);
```

## API Response Format

```json
// Success
{ "success": true, "data": { ... } }
{ "success": true, "data": { ... }, "message": "Created" }

// Error
{ "success": false, "error": { "code": "error_code", "message": "Human readable" } }

// Validation error (422)
{ "success": false, "error": { "code": "validation_error", "message": "...", "errors": { "field": ["..."] } } }
```

## Exception Handling (bootstrap/app.php)

Đã đăng ký renderers cho:
- `ApiException` → JSON với error code + message + http status
- `ValidationException` → 422 với field errors
- `ModelNotFoundException` → 404
- `NotFoundHttpException` → 404
- `HttpException` → JSON với status code
- `Throwable` catch-all → 500, log kèm shop context nếu có

## Shop Model

```php
// Fields
$shop->shop              // "store.myshopify.com"
$shop->access_token       // Tự động encrypt/decrypt (cast: encrypted)
$shop->is_active          // bool
$shop->installed_at       // Carbon
$shop->uninstalled_at     // Carbon|null

// Query
$shop = Shop::where('shop', $domain)->first();
```

## ShopifyAuthService

```php
$service = app(ShopifyAuthService::class);

// Decode session token JWT (verify signature + audience)
$payload = $service->decodeSessionToken($jwt);
// Returns: ['iss', 'dest', 'aud', 'sub', 'exp', 'iat', ...]

// Extract shop domain from dest claim
$domain = $service->extractShopDomain($payload['dest']);
// "https://store.myshopify.com" → "store.myshopify.com"

// Token exchange: session token → offline access token
$tokenData = $service->exchangeSessionTokenForAccessToken($domain, $jwt);
// Returns: ['access_token' => 'shpat_xxx', 'scope' => '...']

// Verify webhook HMAC
$valid = $service->verifyWebhookHmac($rawBody, $hmacHeader);

// Validate shop domain format
$clean = $service->sanitizeShopDomain('Store.myshopify.com'); // "store.myshopify.com"
$null = $service->sanitizeShopDomain('invalid'); // null
```

## Shopify Admin API Call Pattern

Khi cần gọi Shopify Admin API từ backend:

```php
$shop = $this->shop($request);
$version = config('shopify.api_version'); // "2025-07"

$response = Http::withHeaders([
    'X-Shopify-Access-Token' => $shop->access_token,
    'Content-Type' => 'application/json',
])->get("https://{$shop->shop}/admin/api/{$version}/products.json");

$data = $response->json();
```

## Thêm API endpoint mới

1. **Tạo Controller:**
```bash
php artisan make:controller QuoteController
```

2. **Đăng ký route** trong `routes/api.php`:
```php
Route::middleware(['verify.shopify.session'])->prefix('shopify')->group(function () {
    Route::get('quotes', [QuoteController::class, 'index']);
    Route::get('quotes/{id}', [QuoteController::class, 'show']);
    Route::post('quotes/{id}/accept', [QuoteController::class, 'accept']);
});
```

3. **Controller pattern:**
```php
class QuoteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $shop = $this->shop($request);
        $quotes = Quote::where('shop_id', $shop->id)->paginate(20);
        return $this->success($quotes);
    }
}
```

4. **Validation** dùng Form Request:
```bash
php artisan make:request StoreQuoteRequest
```

## Thêm webhook topic mới

1. Thêm topic vào `storefront/shopify.app.toml`:
```toml
[[webhooks.subscriptions]]
topics = [ "orders/create" ]
uri = "/api/webhooks"
```

2. Thêm handler trong `WebhookController.php`:
```php
match ($topic) {
    'app/uninstalled' => $this->handleAppUninstalled($shopDomain),
    'orders/create' => $this->handleOrderCreated($shopDomain, $request),
    default => Log::warning('Unhandled webhook topic', ['topic' => $topic]),
};
```

## Thêm Migration mới

```bash
php artisan make:migration create_quotes_table
```

Convention:
- Tên file: `create_{table}_table` hoặc `add_{column}_to_{table}_table`
- Luôn có `$table->id()` + `$table->timestamps()`
- Foreign key: `$table->foreignId('shop_id')->constrained()->cascadeOnDelete()`
- Soft delete nếu cần: `$table->softDeletes()`

## Config (.env)

```env
# App
APP_URL=https://quote-claude.local

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=shopify_quote
DB_USERNAME=root
DB_PASSWORD=root

# Shopify
SHOPIFY_API_KEY=<from Partner Dashboard>
SHOPIFY_API_SECRET=<from Partner Dashboard>
SHOPIFY_API_VERSION=2025-07
SHOPIFY_APP_URL=https://quote-claude.local
SHOPIFY_DEV_SHOP_DOMAIN=kietdt-claude-store.myshopify.com
```

## Do NOT
- Install shopify/shopify-api hoặc bất kỳ Shopify package nào. Auth là custom.
- Dùng OAuth redirect flow. App dùng managed installation + token exchange.
- Đặt business logic trong Controller. Tạo Service class riêng.
- Trả response không theo format chuẩn. Luôn dùng `$this->success()` hoặc throw `ApiException`.
- Quên thêm `shop_id` foreign key khi tạo table mới. Mọi data đều thuộc về 1 shop.
- Lưu access_token dạng plain text. Model Shop đã dùng `encrypted` cast.
