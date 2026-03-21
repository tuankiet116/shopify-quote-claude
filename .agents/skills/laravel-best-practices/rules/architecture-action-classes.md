---
title: Action Classes
impact: MEDIUM
impactDescription: Single-responsibility units for complex operations
tags: architecture, actions
---

## Action Classes

An Action is a class with one public method (`execute` or `__invoke`) that does
one specific thing. Use actions when a service method grows complex or when you
want to compose multiple steps.

### When to use Actions vs Service methods

| Situation | Use |
|---|---|
| Simple, related operations on one domain | Service methods |
| Complex multi-step operation (>30 lines) | Action class |
| Operation reused across services/commands | Action class |
| One-off simple logic | Keep in service or controller |

### Structure

Place actions in `app/Actions/` organized by domain:

```
app/Actions/
├── Quote/
│   ├── CreateQuoteAction.php
│   ├── SendQuoteAction.php
│   └── ConvertQuoteToOrderAction.php
└── Shop/
    └── InitializeShopAction.php
```

### Implementation

```php
namespace App\Actions\Quote;

use App\Models\Quote;
use App\Models\Shop;
use App\Services\QuoteNumberService;

class CreateQuoteAction
{
    public function __construct(
        private readonly QuoteNumberService $numberService,
    ) {}

    public function execute(Shop $shop, QuoteData $data): Quote
    {
        $quote = $shop->quotes()->create([
            'quote_number' => $this->numberService->generate($shop),
            'customer_name' => $data->customerName,
            'customer_email' => $data->customerEmail,
            'status' => 'pending',
        ]);

        foreach ($data->items as $item) {
            $quote->items()->create($item->toArray());
        }

        $quote->recalculateTotals();

        $quote->activities()->create([
            'action' => 'created',
            'actor' => $data->actor,
        ]);

        return $quote->load('items');
    }
}
```

### Using actions in controllers

```php
class QuoteController extends Controller
{
    public function store(
        StoreQuoteRequest $request,
        CreateQuoteAction $action,
    ): JsonResponse {
        $shop = $request->attributes->get('shopifyShop');
        $data = QuoteData::fromRequest($request);

        $quote = $action->execute($shop, $data);

        return response()->json(new QuoteResource($quote), 201);
    }
}
```

### Don't over-use actions

Not every controller method needs an action. If the logic is 5 lines, just
put it in the controller or service. Actions shine when there's real complexity
to encapsulate.
