---
title: Code Quality & Conventions
impact: MEDIUM
impactDescription: Consistent naming, organization, and coding style
tags: quality, conventions
---

## Code Quality & Conventions

### File organization

```
app/
├── Actions/              # Single-responsibility operations
│   └── Quote/
├── DTOs/                 # Shared data objects (or keep in Services/)
├── Exceptions/           # Custom exceptions
├── Http/
│   ├── Controllers/      # Thin, delegate to services/actions
│   ├── Middleware/
│   ├── Requests/         # FormRequest validation
│   └── Resources/        # API response formatting
├── Models/               # Eloquent models
├── Services/             # Business logic (can contain DTOs)
│   └── Shopify/          # Group by domain
└── Console/Commands/     # Artisan commands
```

### Naming conventions

```php
// Controllers: plural resource + "Controller"
QuoteController, SettingsController

// Models: singular
Quote, QuoteItem, ShopSetting

// Services: domain + "Service"
QuoteNumberService, ShopifyAuthService

// Actions: verb + noun + "Action"
CreateQuoteAction, SendQuoteAction

// FormRequests: verb + model + "Request"
StoreQuoteRequest, UpdateQuoteRequest

// Resources: model + "Resource"
QuoteResource, QuoteItemResource

// DTOs: descriptive + "Data"
QuoteData, QuoteItemData

// Exceptions: descriptive + "Exception"
QuoteNotSendableException

// Events: past tense
QuoteCreated, QuoteSent

// Migrations: descriptive
create_quotes_table, add_invoice_url_to_quotes_table
```

### Controller conventions

Controllers should be thin. Their job is:
1. Resolve the authenticated context (shop, user)
2. Pass validated input to a service/action
3. Return a formatted response

```php
class QuoteController extends Controller
{
    public function __construct(
        private readonly QuoteService $quoteService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $shop = $request->attributes->get('shopifyShop');
        $quotes = $this->quoteService->list($shop, $request->query());

        return QuoteResource::collection($quotes)->response();
    }

    public function store(StoreQuoteRequest $request, CreateQuoteAction $action): JsonResponse
    {
        $shop = $request->attributes->get('shopifyShop');
        $quote = $action->execute($shop, QuoteData::fromRequest($request));

        return response()->json(new QuoteResource($quote), 201);
    }
}
```

### Route conventions

```php
// Group by auth middleware
Route::middleware('verify.shopify.session')->prefix('shopify')->group(function () {
    // Use apiResource for standard CRUD
    Route::apiResource('quotes', QuoteController::class);

    // Custom actions as separate routes
    Route::post('quotes/{quote}/send', [QuoteController::class, 'send']);
    Route::post('quotes/{quote}/convert', [QuoteController::class, 'convert']);
});
```

### Use PHP 8.2+ features

```php
// Readonly classes for DTOs
readonly class QuoteData { /* ... */ }

// Enums instead of string constants
enum QuoteStatus: string
{
    case Pending = 'pending';
    case Reviewed = 'reviewed';
    case Sent = 'sent';
    case Accepted = 'accepted';
    case Rejected = 'rejected';
    case Converted = 'converted';
    case Expired = 'expired';
    case Cancelled = 'cancelled';
}

// Named arguments for clarity
$quote->update(
    status: QuoteStatus::Sent,
    sent_at: now(),
);

// Constructor promotion
public function __construct(
    private readonly QuoteNumberService $numberService,
    private readonly ShopifyDraftOrderService $draftOrderService,
) {}

// Match expression
$this->discount_amount = match ($this->discount_type) {
    'percentage' => $this->subtotal * ($this->discount_value / 100),
    'fixed' => min($this->discount_value, $this->subtotal),
    default => 0,
};
```

### Avoid common anti-patterns

```php
// ❌ God controller — doing everything inline
public function store(Request $request) {
    $validated = $request->validate([...]);
    $quote = Quote::create($validated);
    $quote->items()->createMany($request->items);
    $quote->recalculateTotals();
    $quote->activities()->create([...]);
    $number = DB::transaction(function () { ... });
    Http::post('shopify.com/...');  // calling API from controller
    return response()->json($quote);
}

// ❌ Unnecessary abstraction — repository for one query
interface QuoteRepositoryInterface {
    public function findById(int $id): Quote;
}
class QuoteRepository implements QuoteRepositoryInterface {
    public function findById(int $id): Quote {
        return Quote::findOrFail($id); // Wrapping one line in an interface
    }
}

// ❌ Premature generalization
class BaseService {
    protected function findOrFail(string $model, int $id) { ... }
    protected function paginate(string $model, int $perPage) { ... }
}
// Every service extends BaseService for no real benefit

// ✅ Simple and direct
$quote = Quote::findOrFail($id);
```

### Config and environment

```php
// Always use config() not env() outside config files
// ❌
$key = env('SHOPIFY_API_KEY');
// ✅
$key = config('shopify.api_key');

// Keep secrets in .env, reference in config/
// config/shopify.php
return [
    'api_key' => env('SHOPIFY_API_KEY'),
    'api_secret' => env('SHOPIFY_API_SECRET'),
];
```
