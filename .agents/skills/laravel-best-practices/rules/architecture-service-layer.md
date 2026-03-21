---
title: Service Layer Pattern
impact: HIGH
impactDescription: Keeps controllers thin and business logic reusable
tags: architecture, services
---

## Service Layer Pattern

Controllers should delegate business logic to services. A controller's job is:
receive request → call service → return response. Nothing more.

Services own business logic but delegate database queries to repositories.
The flow is: Controller → Service → Repository → Database.

### When to create a service

- Logic is more than 3-5 lines in a controller method
- Logic is reused across multiple controllers or commands
- Logic involves multiple models or external APIs
- Logic has complex branching or calculations

When the logic is trivial (simple CRUD, one-liner), keep it in the controller —
creating a service for `Model::find($id)` is over-engineering.

### Service sizing

Split services when they grow beyond ~200 lines or handle unrelated concerns.
A service should have a clear, single domain.

**Too broad:**

```php
// One massive service doing everything
class ShopifyService
{
    public function authenticate() { /* ... */ }
    public function createDraftOrder() { /* ... */ }
    public function registerWebhooks() { /* ... */ }
    public function searchProducts() { /* ... */ }
}
```

**Right-sized:**

```php
// Each service owns one domain
class ShopifyAuthService { /* OAuth, JWT, HMAC */ }
class ShopifyDraftOrderService { /* Draft order CRUD */ }
class ShopifyWebhookService { /* Register/unregister */ }
```

### Constructor injection

Always inject dependencies through the constructor. Laravel's container resolves them automatically.

```php
class QuoteService
{
    public function __construct(
        private readonly QuoteNumberService $numberService,
        private readonly ShopifyDraftOrderService $draftOrderService,
    ) {}

    public function createQuote(Shop $shop, array $data): Quote
    {
        $quote = $shop->quotes()->create([
            'quote_number' => $this->numberService->generate($shop),
            // ...
        ]);

        return $quote;
    }
}
```

### Return types

Services should return domain objects (Models, DTOs, collections) — never HTTP responses.
That's the controller's job.

```php
// ❌ Service returning HTTP response
public function getStats(Shop $shop): JsonResponse
{
    return response()->json(['total' => $shop->quotes()->count()]);
}

// ✅ Service returning data
public function getStats(Shop $shop): DashboardStats
{
    return new DashboardStats(
        total: $shop->quotes()->count(),
        pending: $shop->quotes()->where('status', 'pending')->count(),
    );
}
```

### Database transactions

Wrap multi-step operations in transactions at the service level:

```php
public function convertToOrder(Quote $quote): Quote
{
    return DB::transaction(function () use ($quote) {
        $order = $this->draftOrderService->complete($quote->draft_order_gid);

        $quote->update([
            'status' => 'converted',
            'order_gid' => $order['id'],
        ]);

        $quote->activities()->create([
            'action' => 'status_changed',
            'details' => ['from' => 'accepted', 'to' => 'converted'],
            'actor' => 'merchant',
        ]);

        return $quote->fresh();
    });
}
```
