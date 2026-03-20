<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Quote extends Model
{
    protected $fillable = [
        'shop_id',
        'quote_number',
        'status',
        'customer_email',
        'customer_name',
        'customer_phone',
        'customer_company',
        'shopify_customer_id',
        'form_responses',
        'customer_notes',
        'internal_notes',
        'discount_type',
        'discount_value',
        'expires_at',
        'sent_at',
        'accepted_at',
        'converted_at',
        'draft_order_gid',
        'order_gid',
        'invoice_url',
        'subtotal',
        'total_discount',
        'total_price',
        'currency_code',
    ];

    protected function casts(): array
    {
        return [
            'form_responses' => 'array',
            'discount_value' => 'decimal:2',
            'subtotal' => 'decimal:2',
            'total_discount' => 'decimal:2',
            'total_price' => 'decimal:2',
            'expires_at' => 'datetime',
            'sent_at' => 'datetime',
            'accepted_at' => 'datetime',
            'converted_at' => 'datetime',
        ];
    }

    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(QuoteItem::class)->orderBy('sort_order');
    }

    public function activities(): HasMany
    {
        return $this->hasMany(QuoteActivity::class)->orderByDesc('created_at');
    }

    public function recalculateTotals(): void
    {
        $subtotal = $this->items->sum(function ($item) {
            $price = $item->offered_price ?? $item->original_price;
            return $price * $item->quantity;
        });

        $totalDiscount = 0;
        if ($this->discount_type === 'percentage' && $this->discount_value) {
            $totalDiscount = $subtotal * ($this->discount_value / 100);
        } elseif ($this->discount_type === 'fixed' && $this->discount_value) {
            $totalDiscount = $this->discount_value;
        }

        $this->subtotal = $subtotal;
        $this->total_discount = $totalDiscount;
        $this->total_price = max(0, $subtotal - $totalDiscount);
        $this->save();
    }
}
