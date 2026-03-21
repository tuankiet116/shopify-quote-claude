---
title: Testing Strategy
impact: HIGH
impactDescription: Confidence in code correctness without over-testing
tags: testing
---

## Testing Strategy

Test the things that matter. Don't chase 100% coverage — focus on business logic,
API contracts, and integration points.

### What to test (priority order)

1. **Service/Action logic** — Business rules, calculations, state transitions (Unit)
2. **API endpoints** — Request/response contracts, validation, auth (Feature)
3. **Model scopes & methods** — Query scopes, calculated properties (Unit)
4. **Edge cases** — Boundary conditions, error paths

### What NOT to test

- Simple getters/setters
- Framework features (Laravel's validation engine works — test your rules, not the engine)
- Private methods directly (test through public interface)
- Third-party API responses (mock them)

### Directory structure

```
tests/
├── Feature/
│   ├── Api/
│   │   ├── QuoteControllerTest.php
│   │   ├── SettingsControllerTest.php
│   │   └── StorefrontProxyTest.php
│   └── Services/
│       └── ShopifyDraftOrderServiceTest.php
├── Unit/
│   ├── Models/
│   │   └── QuoteTest.php
│   ├── Services/
│   │   └── QuoteNumberServiceTest.php
│   └── Actions/
│       └── CreateQuoteActionTest.php
└── TestCase.php
```

### Feature test example (API endpoint)

```php
namespace Tests\Feature\Api;

use App\Models\Shop;
use App\Models\Quote;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class QuoteControllerTest extends TestCase
{
    use RefreshDatabase;

    private Shop $shop;

    protected function setUp(): void
    {
        parent::setUp();
        $this->shop = Shop::factory()->create();
    }

    public function test_index_returns_paginated_quotes(): void
    {
        Quote::factory()->count(5)->for($this->shop)->create();

        $response = $this->actingAsShop($this->shop)
            ->getJson('/api/shopify/quotes');

        $response->assertOk()
            ->assertJsonCount(5, 'data')
            ->assertJsonStructure([
                'data' => [['id', 'quote_number', 'status', 'customer']],
                'meta' => ['current_page', 'total'],
            ]);
    }

    public function test_store_validates_required_fields(): void
    {
        $response = $this->actingAsShop($this->shop)
            ->postJson('/api/shopify/quotes', []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['customer_name', 'customer_email', 'items']);
    }

    public function test_store_creates_quote_with_items(): void
    {
        $data = [
            'customer_name' => 'John Doe',
            'customer_email' => 'john@example.com',
            'items' => [
                [
                    'product_id' => 123,
                    'variant_id' => 456,
                    'title' => 'Test Product',
                    'quantity' => 2,
                    'original_price' => 29.99,
                ],
            ],
        ];

        $response = $this->actingAsShop($this->shop)
            ->postJson('/api/shopify/quotes', $data);

        $response->assertCreated()
            ->assertJsonPath('data.customer.name', 'John Doe');

        $this->assertDatabaseHas('quotes', [
            'shop_id' => $this->shop->id,
            'customer_email' => 'john@example.com',
        ]);
        $this->assertDatabaseCount('quote_items', 1);
    }
}
```

### Unit test example (Service)

```php
namespace Tests\Unit\Services;

use App\Models\Shop;
use App\Models\QuoteNumberSequence;
use App\Services\QuoteNumberService;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class QuoteNumberServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_generates_sequential_numbers(): void
    {
        $shop = Shop::factory()->create();
        QuoteNumberSequence::create(['shop_id' => $shop->id, 'last_number' => 1000]);

        $service = new QuoteNumberService();

        $first = $service->generate($shop);
        $second = $service->generate($shop);

        $this->assertEquals('Q-1001', $first);
        $this->assertEquals('Q-1002', $second);
    }
}
```

### Unit test example (Model)

```php
namespace Tests\Unit\Models;

use App\Models\Quote;
use App\Models\QuoteItem;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class QuoteTest extends TestCase
{
    use RefreshDatabase;

    public function test_recalculate_totals_with_percentage_discount(): void
    {
        $quote = Quote::factory()->create(['discount_type' => 'percentage', 'discount_value' => 10]);
        QuoteItem::factory()->create(['quote_id' => $quote->id, 'offered_price' => 100, 'quantity' => 2]);

        $quote->load('items')->recalculateTotals();

        $this->assertEquals(200.00, $quote->subtotal);
        $this->assertEquals(20.00, $quote->discount_amount);
        $this->assertEquals(180.00, $quote->total);
    }

    public function test_is_sendable_returns_true_for_valid_statuses(): void
    {
        $quote = Quote::factory()->make(['status' => 'reviewed']);
        $this->assertTrue($quote->isSendable());

        $quote->status = 'converted';
        $this->assertFalse($quote->isSendable());
    }
}
```

### Mocking external services

Mock Shopify API calls — don't hit real APIs in tests:

```php
public function test_send_quote_creates_draft_order(): void
{
    $mockDraftOrder = $this->mock(ShopifyDraftOrderService::class);
    $mockDraftOrder->shouldReceive('createFromQuote')
        ->once()
        ->andReturn(['id' => 'gid://shopify/DraftOrder/1', 'invoice_url' => 'https://...']);

    // ... test the action/service that calls it
}
```

### Test helper: actingAsShop

Add to your base TestCase for authenticated shop requests:

```php
// tests/TestCase.php
protected function actingAsShop(Shop $shop): static
{
    // Simulate the middleware setting the shop attribute
    $this->withMiddleware();
    $this->app['request']->attributes->set('shopifyShop', $shop);

    return $this;
}
```
