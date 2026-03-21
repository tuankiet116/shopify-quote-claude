---
title: Repository Pattern
impact: HIGH
impactDescription: Centralizes database queries, keeps services focused on business logic
tags: architecture, repository, database
---

## Repository Pattern

Repositories own all database queries. Services call repositories for data access,
never touching Eloquent directly. This keeps services focused on business logic
and makes queries reusable, testable, and easy to find.

### Layer responsibilities

```
Controller → Service → Repository → Database
     ↓           ↓          ↓
  HTTP I/O   Business    Queries
  Validation  Logic      Eloquent
  Response    Rules      Scopes
              Actions    Pagination
              DTOs       Filtering
```

- **Repository**: Query building, filtering, pagination, eager loading, raw queries
- **Service**: Business rules, orchestration, calling multiple repositories, external APIs
- **Model**: Relationships, casts, scopes, simple domain methods (`isSendable()`, `recalculateTotals()`)

### When to use a Repository

- The domain has multiple query patterns (list with filters, search, aggregate stats)
- Queries are reused across services or commands
- You want a clear place for all queries related to a model

When a domain only has `findOrFail($id)` and basic CRUD, a repository adds
unnecessary indirection. Use it when queries have real complexity.

### Structure

```
app/Repositories/
├── QuoteRepository.php
├── ShopRepository.php
└── FormConfigRepository.php
```

No interfaces by default — add them only when you genuinely need to swap
implementations (e.g., caching decorator, test doubles for external data sources).
For Eloquent repositories, mocking the repository class directly is sufficient.

### Implementation

```php
namespace App\Repositories;

use App\Models\Quote;
use App\Models\Shop;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class QuoteRepository
{
    /**
     * Paginated listing with filters.
     */
    public function listForShop(
        Shop $shop,
        ?string $status = null,
        ?string $search = null,
        int $perPage = 20,
    ): LengthAwarePaginator {
        return Quote::query()
            ->where('shop_id', $shop->id)
            ->when($status, fn ($q) => $q->where('status', $status))
            ->when($search, fn ($q) => $q->where(function ($q) use ($search) {
                $q->where('quote_number', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_email', 'like', "%{$search}%");
            }))
            ->with('items')
            ->latest()
            ->paginate($perPage);
    }

    /**
     * Single quote with all related data.
     */
    public function findWithDetails(Shop $shop, int $id): Quote
    {
        return Quote::query()
            ->where('shop_id', $shop->id)
            ->with(['items', 'activities' => fn ($q) => $q->latest()])
            ->findOrFail($id);
    }

    /**
     * Quotes ready for auto-expiry.
     */
    public function findExpired(): Collection
    {
        return Quote::query()
            ->where('status', 'sent')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<', now())
            ->get();
    }

    /**
     * Quotes expiring soon (for reminders).
     */
    public function findExpiringSoon(int $daysBeforeExpiry): Collection
    {
        $threshold = now()->addDays($daysBeforeExpiry);

        return Quote::query()
            ->where('status', 'sent')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', $threshold)
            ->where('expires_at', '>', now())
            ->get();
    }

    /**
     * Dashboard aggregate stats.
     */
    public function getStatsForShop(Shop $shop): array
    {
        $base = Quote::query()->where('shop_id', $shop->id);

        return [
            'total' => (clone $base)->count(),
            'pending' => (clone $base)->where('status', 'pending')->count(),
            'sent' => (clone $base)->where('status', 'sent')->count(),
            'accepted' => (clone $base)->where('status', 'accepted')->count(),
            'converted' => (clone $base)->where('status', 'converted')->count(),
            'revenue' => (clone $base)->where('status', 'converted')->sum('total'),
        ];
    }

    /**
     * Recent quotes for dashboard widget.
     */
    public function recentForShop(Shop $shop, int $limit = 10): Collection
    {
        return Quote::query()
            ->where('shop_id', $shop->id)
            ->with('items')
            ->latest()
            ->limit($limit)
            ->get();
    }
}
```

### Service using Repository

The service no longer builds queries — it focuses on business rules:

```php
namespace App\Services;

use App\Repositories\QuoteRepository;
use App\Models\Shop;

class DashboardService
{
    public function __construct(
        private readonly QuoteRepository $quoteRepository,
    ) {}

    public function getStats(Shop $shop): DashboardStats
    {
        $stats = $this->quoteRepository->getStatsForShop($shop);
        $recent = $this->quoteRepository->recentForShop($shop);

        return new DashboardStats(
            ...$stats,
            recentQuotes: $recent,
        );
    }
}
```

```php
namespace App\Services;

use App\Repositories\QuoteRepository;
use App\Models\Quote;

class QuoteAutomationService
{
    public function __construct(
        private readonly QuoteRepository $quoteRepository,
    ) {}

    public function processExpiredQuotes(): int
    {
        $expired = $this->quoteRepository->findExpired();
        $count = 0;

        foreach ($expired as $quote) {
            try {
                $quote->update(['status' => 'expired']);
                $quote->activities()->create([
                    'action' => 'status_changed',
                    'details' => ['from' => 'sent', 'to' => 'expired'],
                    'actor' => 'system',
                ]);
                $count++;
            } catch (\Throwable $e) {
                report($e);
            }
        }

        return $count;
    }
}
```

### What stays in the Model

Repositories handle queries, but Models still own:

```php
class Quote extends Model
{
    // ✅ Relationships — define how models connect
    public function items(): HasMany { ... }

    // ✅ Scopes — reusable query fragments (repositories compose these)
    public function scopeByStatus(Builder $query, string $status): void { ... }

    // ✅ Domain methods — operate on own data
    public function recalculateTotals(): void { ... }
    public function isSendable(): bool { ... }

    // ❌ Complex queries — these belong in Repository
    // public static function getExpiredForShop(Shop $shop) { ... }
}
```

Repositories can use model scopes internally:

```php
// In repository — composing model scopes
public function findPendingForShop(Shop $shop): Collection
{
    return Quote::query()
        ->forShop($shop)    // model scope
        ->byStatus('pending') // model scope
        ->with('items')
        ->latest()
        ->get();
}
```

### Don't over-abstract

```php
// ❌ Generic base repository with 20 methods you'll never use
abstract class BaseRepository
{
    public function all() { ... }
    public function find($id) { ... }
    public function create(array $data) { ... }
    public function update($id, array $data) { ... }
    public function delete($id) { ... }
    public function paginate($perPage) { ... }
    public function findBy($field, $value) { ... }
    // ... wrapping every Eloquent method
}

// ❌ Interface for every repository when you only have one implementation
interface QuoteRepositoryInterface { ... }
class EloquentQuoteRepository implements QuoteRepositoryInterface { ... }

// ✅ Concrete class with methods you actually need
class QuoteRepository
{
    public function listForShop(...) { ... }
    public function findWithDetails(...) { ... }
    public function findExpired() { ... }
}
```

### Updated architecture table

| Complexity | Layers |
|---|---|
| Simple CRUD, trivial query | Controller (inline) |
| Moderate logic, reusable queries | Controller + FormRequest + Service + Repository |
| Complex business logic | Controller + FormRequest + Service + Repository + Action + DTO |
| Domain-critical | Full domain layer with all of the above |
