---
title: Data Transfer Objects
impact: MEDIUM
impactDescription: Type-safe data passing between layers
tags: architecture, dtos
---

## Data Transfer Objects (DTOs)

DTOs are simple readonly classes that carry data between layers (controller → service,
service → action). They replace passing raw arrays, giving you type safety and
self-documenting code.

### When to use DTOs

- **Use DTOs** when passing 4+ fields between layers, or when the data structure
  is important to get right (e.g., creating a quote with items).
- **Skip DTOs** for simple operations with 1-3 obvious parameters. Passing `$id`
  and `$status` directly is clearer than wrapping them in a DTO.

### Placement

- **In Service directory** — for DTOs used by one service: `app/Services/QuoteData.php`
- **In Domain directory** — for important, shared DTOs: `app/DTOs/QuoteData.php`

Use the simpler placement (service directory) by default. Promote to `app/DTOs/`
only when the DTO is used across multiple services or domains.

### Implementation

Use PHP 8.2+ readonly classes:

```php
namespace App\DTOs;

use Illuminate\Http\Request;

readonly class QuoteData
{
    /**
     * @param QuoteItemData[] $items
     */
    public function __construct(
        public string $customerName,
        public string $customerEmail,
        public ?string $customerPhone,
        public ?string $customerCompany,
        public ?string $notes,
        public array $items,
        public string $actor = 'merchant',
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            customerName: $request->input('customer_name'),
            customerEmail: $request->input('customer_email'),
            customerPhone: $request->input('customer_phone'),
            customerCompany: $request->input('customer_company'),
            notes: $request->input('notes'),
            items: array_map(
                fn (array $item) => QuoteItemData::fromArray($item),
                $request->input('items', []),
            ),
        );
    }
}
```

```php
readonly class QuoteItemData
{
    public function __construct(
        public int $productId,
        public int $variantId,
        public string $title,
        public string $variantTitle,
        public int $quantity,
        public float $originalPrice,
        public ?float $offeredPrice,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            productId: $data['product_id'],
            variantId: $data['variant_id'],
            title: $data['title'],
            variantTitle: $data['variant_title'] ?? '',
            quantity: $data['quantity'],
            originalPrice: $data['original_price'],
            offeredPrice: $data['offered_price'] ?? null,
        );
    }

    public function toArray(): array
    {
        return get_object_vars($this);
    }
}
```

### DTOs vs arrays

```php
// ❌ Array — no type safety, easy to mistype keys
$this->quoteService->create($shop, $request->validated());

// ✅ DTO — explicit fields, IDE autocomplete, self-documenting
$data = QuoteData::fromRequest($request);
$this->quoteService->create($shop, $data);
```

### Keep DTOs simple

DTOs carry data — they should not contain business logic, database queries,
or side effects. Just properties and factory methods (`fromRequest`, `fromArray`, `fromModel`).
