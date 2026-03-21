---
title: API Resources
impact: MEDIUM
impactDescription: Consistent JSON response formatting and data transformation
tags: api, resources
---

## API Resources

API Resources transform models into consistent JSON responses. They act as a
presentation layer between your models and the API output.

### When to use Resources

- **Use Resources** when the API response needs formatting, field renaming,
  conditional fields, or nested relationships. Especially for complex endpoints
  consumed by a frontend app.
- **Skip Resources** for simple internal endpoints, webhooks, or when you're
  returning raw data that matches the model exactly.

### Structure

```
app/Http/Resources/
├── QuoteResource.php
├── QuoteItemResource.php
├── QuoteCollection.php         # Only if pagination needs customization
├── FormConfigResource.php
└── DashboardStatsResource.php
```

### Implementation

```php
namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuoteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'quote_number' => $this->quote_number,
            'status' => $this->status,

            // Format for frontend
            'customer' => [
                'name' => $this->customer_name,
                'email' => $this->customer_email,
                'phone' => $this->customer_phone,
                'company' => $this->customer_company,
            ],

            // Pricing as formatted values
            'subtotal' => $this->subtotal,
            'discount' => [
                'type' => $this->discount_type,
                'value' => $this->discount_value,
                'amount' => $this->discount_amount,
            ],
            'total' => $this->total,

            // Conditional nested resources (only when loaded)
            'items' => QuoteItemResource::collection($this->whenLoaded('items')),
            'activities' => QuoteActivityResource::collection($this->whenLoaded('activities')),

            // Conditional fields
            'draft_order_gid' => $this->when($this->draft_order_gid, $this->draft_order_gid),
            'invoice_url' => $this->when($this->invoice_url, $this->invoice_url),

            'expires_at' => $this->expires_at?->toISOString(),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}
```

### Using in controllers

```php
// Single resource
return new QuoteResource($quote->load(['items', 'activities']));

// Collection with pagination
return QuoteResource::collection(
    $shop->quotes()->paginate(20)
);

// Additional meta data
return (new QuoteResource($quote))
    ->additional(['meta' => ['permissions' => $permissions]]);
```

### Keep it simple

Don't create Resources for models where `toArray()` output is already what you need.
A Resource with no transformations adds complexity without value:

```php
// ❌ Pointless resource — just returns the model as-is
public function toArray(Request $request): array
{
    return parent::toArray($request);
}

// ✅ Just return the model directly
return response()->json($model);
```

### Tip: wrap/unwrap

By default, Resources wrap data in `"data"` key. For single responses where you
don't want wrapping:

```php
// In AppServiceProvider::boot()
JsonResource::withoutWrapping();

// Or per-resource
return (new QuoteResource($quote))->response();
```
