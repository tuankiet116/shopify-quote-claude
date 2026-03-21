---
title: Model Best Practices
impact: HIGH
impactDescription: Clean models with proper relationships, scopes, and casts
tags: models, eloquent
---

## Model Best Practices

Models are the heart of a Laravel app. Keep them focused on data representation,
relationships, and simple domain logic.

### Property ordering convention

Organize model properties in this order for consistency:

```php
class Quote extends Model
{
    // 1. Traits
    use HasFactory, SoftDeletes;

    // 2. Constants
    const STATUS_PENDING = 'pending';
    const STATUS_SENT = 'sent';

    // 3. Table/connection config (only if non-default)
    protected $table = 'quotes';

    // 4. Fillable/guarded
    protected $fillable = [/* ... */];

    // 5. Casts
    protected function casts(): array
    {
        return [
            'form_responses' => 'array',
            'subtotal' => 'decimal:2',
            'expires_at' => 'datetime',
        ];
    }

    // 6. Relationships
    public function shop(): BelongsTo { /* ... */ }
    public function items(): HasMany { /* ... */ }

    // 7. Scopes
    public function scopeForShop(Builder $query, Shop $shop): void { /* ... */ }

    // 8. Accessors / Mutators
    protected function fullPrice(): Attribute { /* ... */ }

    // 9. Domain methods
    public function recalculateTotals(): void { /* ... */ }
}
```

### Use query scopes

Extract repeated query conditions into scopes. This makes queries readable
and reusable:

```php
// ❌ Repeated conditions across controllers
$quotes = Quote::where('shop_id', $shop->id)
    ->where('status', 'sent')
    ->where('expires_at', '<', now())
    ->get();

// ✅ Named scopes
class Quote extends Model
{
    public function scopeForShop(Builder $query, Shop $shop): void
    {
        $query->where('shop_id', $shop->id);
    }

    public function scopeExpired(Builder $query): void
    {
        $query->where('status', 'sent')
            ->where('expires_at', '<', now());
    }

    public function scopeByStatus(Builder $query, string $status): void
    {
        $query->where('status', $status);
    }
}

// Usage
$expired = Quote::forShop($shop)->expired()->get();
$pending = Quote::forShop($shop)->byStatus('pending')->paginate(20);
```

### Use proper casts

Always cast non-string fields. This prevents type bugs and improves DX:

```php
protected function casts(): array
{
    return [
        // JSON columns
        'form_responses' => 'array',
        'options' => 'array',

        // Booleans (MySQL tinyint)
        'is_active' => 'boolean',
        'is_required' => 'boolean',

        // Decimals (avoid floating point issues)
        'price' => 'decimal:2',

        // Dates
        'expires_at' => 'datetime',

        // Sensitive data
        'access_token' => 'encrypted',
    ];
}
```

### Eager loading

Always eager load relationships when you know you'll need them. Use `with()`
to prevent N+1 queries:

```php
// ❌ N+1: loops over quotes then lazy-loads items for each
$quotes = Quote::forShop($shop)->get();
foreach ($quotes as $quote) {
    echo $quote->items->count(); // Extra query per quote!
}

// ✅ Eager load
$quotes = Quote::forShop($shop)->with('items')->get();

// ✅ Nested eager loading
$quote = Quote::with(['items', 'activities' => fn ($q) => $q->latest()])->findOrFail($id);
```

### Relationships with constraints

Use constrained relationships for common patterns:

```php
public function items(): HasMany
{
    return $this->hasMany(QuoteItem::class)->orderBy('sort_order');
}

public function activities(): HasMany
{
    return $this->hasMany(QuoteActivity::class)->latest('created_at');
}

public function activeFormConfig(): HasOne
{
    return $this->hasOne(QuoteFormConfig::class)->where('is_active', true);
}
```

### Keep domain methods simple

Models can have simple domain methods that operate on their own data.
Complex multi-model operations belong in services/actions:

```php
// ✅ Good: operates on own data
public function recalculateTotals(): void
{
    $this->subtotal = $this->items->sum(fn ($item) => $item->offered_price * $item->quantity);

    $this->discount_amount = match ($this->discount_type) {
        'percentage' => $this->subtotal * ($this->discount_value / 100),
        'fixed' => min($this->discount_value, $this->subtotal),
        default => 0,
    };

    $this->total = $this->subtotal - $this->discount_amount;
    $this->save();
}

// ✅ Good: simple status check
public function isSendable(): bool
{
    return in_array($this->status, ['pending', 'reviewed']);
}

// ❌ Bad: model calling external API
public function sendToShopify(): void
{
    Http::post('shopify.com/...'); // This belongs in a service
}
```
