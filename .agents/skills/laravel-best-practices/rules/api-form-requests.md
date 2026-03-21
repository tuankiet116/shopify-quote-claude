---
title: FormRequest Validation
impact: HIGH
impactDescription: Separates validation from controllers, reusable and testable
tags: api, validation
---

## FormRequest Classes

Extract validation into FormRequest classes when:

- Validation rules are more than 3-4 simple rules
- The same validation is used in multiple endpoints
- Validation has complex conditional logic
- You want to add authorization checks

For trivial validation (1-2 rules), inline `$request->validate()` is fine.

### Structure

Place in `app/Http/Requests/` organized by domain:

```
app/Http/Requests/
├── Quote/
│   ├── StoreQuoteRequest.php
│   ├── UpdateQuoteRequest.php
│   └── AddNoteRequest.php
└── FormConfig/
    └── StoreFormConfigRequest.php
```

### Implementation

```php
namespace App\Http\Requests\Quote;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreQuoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Authorization is handled by middleware (VerifyShopifySession)
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_email' => ['required', 'email', 'max:255'],
            'customer_phone' => ['nullable', 'string', 'max:50'],
            'customer_company' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:5000'],

            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer'],
            'items.*.variant_id' => ['required', 'integer'],
            'items.*.title' => ['required', 'string', 'max:255'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.original_price' => ['required', 'numeric', 'min:0'],
            'items.*.offered_price' => ['nullable', 'numeric', 'min:0'],

            'discount_type' => ['nullable', Rule::in(['percentage', 'fixed'])],
            'discount_value' => ['nullable', 'numeric', 'min:0'],
            'expires_at' => ['nullable', 'date', 'after:now'],
        ];
    }

    public function messages(): array
    {
        return [
            'items.required' => 'At least one item is required.',
            'items.*.product_id.required' => 'Each item must have a product.',
        ];
    }
}
```

### Using in controller

```php
// ❌ Inline validation cluttering the controller
public function store(Request $request): JsonResponse
{
    $validated = $request->validate([
        'customer_name' => 'required|string|max:255',
        'customer_email' => 'required|email',
        // ... 15 more rules
    ]);
    // ... logic
}

// ✅ Clean controller with FormRequest
public function store(StoreQuoteRequest $request): JsonResponse
{
    $data = QuoteData::fromRequest($request);
    $quote = $this->createQuoteAction->execute($shop, $data);

    return response()->json(new QuoteResource($quote), 201);
}
```

### Conditional validation

Use `sometimes` and `when` for conditional rules, or override `withValidator()`:

```php
public function withValidator($validator): void
{
    $validator->sometimes('discount_value', 'max:100', function ($input) {
        return $input->discount_type === 'percentage';
    });
}
```

### Tip: prepareForValidation

Normalize input before validation:

```php
protected function prepareForValidation(): void
{
    if ($this->has('customer_email')) {
        $this->merge([
            'customer_email' => strtolower(trim($this->customer_email)),
        ]);
    }
}
```
