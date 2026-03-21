---
title: Database & Migration Conventions
impact: MEDIUM
impactDescription: Clean schema design and migration practices
tags: database, migrations
---

## Database & Migration Conventions

### Table naming

- Plural, snake_case: `quotes`, `quote_items`, `shop_settings`
- Pivot tables: alphabetical order: `quote_tag` (not `tag_quote`)
- Settings/config tables: `{domain}_settings`, `{domain}_configs`

### Column naming

```php
// Foreign keys: singular model + _id
$table->foreignId('shop_id')->constrained()->cascadeOnDelete();

// Status/type enums: descriptive name
$table->enum('status', ['pending', 'sent', 'accepted']);
$table->enum('discount_type', ['percentage', 'fixed']);

// Booleans: is_, has_, can_ prefix
$table->boolean('is_active')->default(true);
$table->boolean('has_discount')->default(false);

// Timestamps: _at suffix
$table->timestamp('expires_at')->nullable();
$table->timestamp('sent_at')->nullable();

// JSON columns: plural or descriptive
$table->json('form_responses')->nullable();
$table->json('options')->nullable();

// Money: store as integer cents or use decimal
$table->unsignedInteger('price');           // cents (recommended)
$table->decimal('subtotal', 10, 2);         // or decimal
```

### Indexes

Add indexes based on how you query, not just "add index to everything":

```php
// Composite index for filtered listing (most common query pattern)
$table->index(['shop_id', 'status']);
$table->index(['shop_id', 'created_at']);

// Single column for lookups
$table->index('customer_email');

// Unique constraints
$table->unique('shopify_domain');
$table->unique('shop_id'); // for one-to-one like settings
```

### Foreign key cascades

Think carefully about cascade behavior:

```php
// Shop deleted → delete all related data
$table->foreignId('shop_id')->constrained()->cascadeOnDelete();

// Quote deleted → items should be deleted too
$table->foreignId('quote_id')->constrained()->cascadeOnDelete();

// Don't cascade if the relationship is informational
$table->unsignedBigInteger('product_id'); // No FK constraint (external Shopify ID)
```

### Migration best practices

```php
// Use descriptive migration names
// ✅ 2026_03_21_000001_create_quotes_table.php
// ✅ 2026_03_22_000001_add_invoice_url_to_quotes_table.php
// ❌ 2026_03_22_000001_update_quotes.php

// Always include down() for reversibility
public function down(): void
{
    Schema::dropIfExists('quotes');
}

// For adding columns to existing tables
public function up(): void
{
    Schema::table('quotes', function (Blueprint $table) {
        $table->string('invoice_url')->nullable()->after('draft_order_gid');
    });
}

public function down(): void
{
    Schema::table('quotes', function (Blueprint $table) {
        $table->dropColumn('invoice_url');
    });
}
```

### Default values

Set sensible defaults at the database level:

```php
$table->enum('status', [...])->default('pending');
$table->boolean('is_active')->default(true);
$table->unsignedInteger('sort_order')->default(0);
$table->unsignedInteger('last_number')->default(1000);
```
