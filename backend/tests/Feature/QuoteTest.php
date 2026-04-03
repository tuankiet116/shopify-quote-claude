<?php

namespace Tests\Feature;

use App\Models\Quote;
use App\Models\Shop;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class QuoteTest extends TestCase
{
    use RefreshDatabase;

    private Shop $shop;

    protected function setUp(): void
    {
        parent::setUp();

        $this->shop = Shop::create([
            'shop' => 'test-shop.myshopify.com',
            'access_token' => 'test-token',
            'is_active' => true,
            'installed_at' => now(),
        ]);

        config(['shopify.dev_shop_domain' => 'test-shop.myshopify.com']);
    }

    private function validQuotePayload(array $overrides = []): array
    {
        return array_merge([
            'shop' => 'test-shop.myshopify.com',
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'phone' => '+84123456789',
            'company' => 'Acme Corp',
            'message' => 'I need a quote for these products',
            'locale' => 'en',
            'currency' => 'USD',
            'items' => [
                [
                    'product_id' => 12345,
                    'variant_id' => 67890,
                    'product_title' => 'Test Product',
                    'variant_title' => 'Large / Blue',
                    'product_handle' => 'test-product',
                    'image_url' => 'https://cdn.shopify.com/test.jpg',
                    'price' => 29.99,
                    'currency' => 'USD',
                    'quantity' => 2,
                ],
            ],
        ], $overrides);
    }

    // ========== Storefront Submit (Public API) ==========

    public function test_storefront_submit_creates_quote_with_valid_data(): void
    {
        $response = $this->postJson('/api/storefront/quotes', $this->validQuotePayload());

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonStructure([
                'data' => ['quote_number'],
            ]);

        $this->assertDatabaseHas('quotes', [
            'shop_id' => $this->shop->id,
            'customer_name' => 'John Doe',
            'customer_email' => 'john@example.com',
            'status' => 'pending',
            'total_items' => 1,
            'locale' => 'en',
            'currency' => 'USD',
        ]);

        $this->assertDatabaseHas('quote_items', [
            'product_id' => 12345,
            'variant_id' => 67890,
            'product_title' => 'Test Product',
            'quantity' => 2,
        ]);
    }

    public function test_storefront_submit_generates_sequential_quote_numbers(): void
    {
        $this->postJson('/api/storefront/quotes', $this->validQuotePayload());
        $this->postJson('/api/storefront/quotes', $this->validQuotePayload([
            'email' => 'jane@example.com',
            'name' => 'Jane Doe',
        ]));

        $numbers = Quote::where('shop_id', $this->shop->id)
            ->orderBy('id')
            ->pluck('quote_number')
            ->toArray();

        $this->assertEquals(['QR-000001', 'QR-000002'], $numbers);
    }

    public function test_storefront_submit_with_multiple_items(): void
    {
        $payload = $this->validQuotePayload([
            'items' => [
                [
                    'product_id' => 111,
                    'variant_id' => null,
                    'product_title' => 'Product A',
                    'variant_title' => null,
                    'product_handle' => 'product-a',
                    'image_url' => null,
                    'price' => 10.00,
                    'currency' => 'USD',
                    'quantity' => 3,
                ],
                [
                    'product_id' => 222,
                    'variant_id' => 333,
                    'product_title' => 'Product B',
                    'variant_title' => 'Red',
                    'product_handle' => 'product-b',
                    'image_url' => 'https://cdn.shopify.com/b.jpg',
                    'price' => 20.00,
                    'currency' => 'USD',
                    'quantity' => 1,
                ],
            ],
        ]);

        $response = $this->postJson('/api/storefront/quotes', $payload);

        $response->assertStatus(201);
        $this->assertDatabaseHas('quotes', ['total_items' => 2]);
        $this->assertEquals(2, \App\Models\QuoteItem::count());
    }

    public function test_storefront_submit_stores_ip_address(): void
    {
        $this->postJson('/api/storefront/quotes', $this->validQuotePayload());

        $quote = Quote::first();
        $this->assertNotNull($quote->ip_address);
    }

    // ========== Validation ==========

    public function test_storefront_submit_rejects_missing_required_fields(): void
    {
        $response = $this->postJson('/api/storefront/quotes', []);

        $response->assertStatus(422)
            ->assertJsonPath('success', false);
    }

    public function test_storefront_submit_rejects_invalid_email(): void
    {
        $response = $this->postJson('/api/storefront/quotes', $this->validQuotePayload([
            'email' => 'not-an-email',
        ]));

        $response->assertStatus(422);
    }

    public function test_storefront_submit_rejects_invalid_shop_domain(): void
    {
        $response = $this->postJson('/api/storefront/quotes', $this->validQuotePayload([
            'shop' => 'malicious.example.com',
        ]));

        $response->assertStatus(422);
    }

    public function test_storefront_submit_rejects_empty_items(): void
    {
        $response = $this->postJson('/api/storefront/quotes', $this->validQuotePayload([
            'items' => [],
        ]));

        $response->assertStatus(422);
    }

    public function test_storefront_submit_rejects_honeypot_filled(): void
    {
        $response = $this->postJson('/api/storefront/quotes', $this->validQuotePayload([
            'website' => 'http://spam.com',
        ]));

        $response->assertStatus(422);
    }

    public function test_storefront_submit_rejects_nonexistent_shop(): void
    {
        $response = $this->postJson('/api/storefront/quotes', $this->validQuotePayload([
            'shop' => 'nonexistent-shop.myshopify.com',
        ]));

        $response->assertStatus(404);
    }

    public function test_storefront_submit_rejects_inactive_shop(): void
    {
        $this->shop->update(['is_active' => false]);

        $response = $this->postJson('/api/storefront/quotes', $this->validQuotePayload());

        $response->assertStatus(404);
    }

    // ========== Admin API ==========

    private function adminGet(string $url): \Illuminate\Testing\TestResponse
    {
        $separator = str_contains($url, '?') ? '&' : '?';

        return $this->getJson("/api/shopify/{$url}{$separator}scope=developer");
    }

    private function adminPut(string $url, array $data = []): \Illuminate\Testing\TestResponse
    {
        return $this->putJson("/api/shopify/{$url}?scope=developer", $data);
    }

    public function test_admin_list_returns_quotes_for_shop(): void
    {
        // Create quotes via storefront
        $this->postJson('/api/storefront/quotes', $this->validQuotePayload());
        $this->postJson('/api/storefront/quotes', $this->validQuotePayload([
            'name' => 'Jane',
            'email' => 'jane@example.com',
        ]));

        $response = $this->adminGet('quotes');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(2, 'data.data');
    }

    public function test_admin_list_filters_by_status(): void
    {
        $this->postJson('/api/storefront/quotes', $this->validQuotePayload());

        $response = $this->adminGet('quotes?status=pending');
        $response->assertOk()->assertJsonCount(1, 'data.data');

        $response = $this->adminGet('quotes?status=accepted');
        $response->assertOk()->assertJsonCount(0, 'data.data');
    }

    public function test_admin_show_returns_quote_with_items(): void
    {
        $this->postJson('/api/storefront/quotes', $this->validQuotePayload());
        $quote = Quote::first();

        $response = $this->adminGet("quotes/{$quote->id}");

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.customer_name', 'John Doe')
            ->assertJsonCount(1, 'data.items');
    }

    public function test_admin_show_returns_404_for_other_shops_quote(): void
    {
        $otherShop = Shop::create([
            'shop' => 'other-shop.myshopify.com',
            'access_token' => 'other-token',
            'is_active' => true,
            'installed_at' => now(),
        ]);

        $quote = Quote::create([
            'shop_id' => $otherShop->id,
            'quote_number' => 'QR-000001',
            'status' => 'pending',
            'customer_name' => 'Other',
            'customer_email' => 'other@example.com',
            'total_items' => 0,
            'submitted_at' => now(),
        ]);

        $response = $this->adminGet("quotes/{$quote->id}");

        $response->assertStatus(404);
    }

    public function test_admin_update_status(): void
    {
        $this->postJson('/api/storefront/quotes', $this->validQuotePayload());
        $quote = Quote::first();

        $response = $this->adminPut("quotes/{$quote->id}/status", [
            'status' => 'reviewed',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.status', 'reviewed');

        $this->assertDatabaseHas('quotes', [
            'id' => $quote->id,
            'status' => 'reviewed',
        ]);
    }

    public function test_admin_update_status_rejects_invalid_status(): void
    {
        $this->postJson('/api/storefront/quotes', $this->validQuotePayload());
        $quote = Quote::first();

        $response = $this->adminPut("quotes/{$quote->id}/status", [
            'status' => 'invalid_status',
        ]);

        $response->assertStatus(422);
    }

    // ========== Quote Number Generation ==========

    public function test_quote_number_is_unique_per_shop(): void
    {
        $otherShop = Shop::create([
            'shop' => 'other-shop.myshopify.com',
            'access_token' => 'other-token',
            'is_active' => true,
            'installed_at' => now(),
        ]);

        // Both shops should start at QR-000001
        $this->assertEquals('QR-000001', Quote::generateQuoteNumber($this->shop->id));
        $this->assertEquals('QR-000001', Quote::generateQuoteNumber($otherShop->id));
    }
}
