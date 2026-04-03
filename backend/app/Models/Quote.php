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
        'customer_name',
        'customer_email',
        'customer_phone',
        'customer_company',
        'message',
        'locale',
        'currency',
        'total_items',
        'ip_address',
        'submitted_at',
        'reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'submitted_at' => 'datetime',
            'reviewed_at' => 'datetime',
            'total_items' => 'integer',
        ];
    }

    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(QuoteItem::class);
    }

    public static function generateQuoteNumber(int $shopId): string
    {
        $last = static::where('shop_id', $shopId)
            ->orderByDesc('id')
            ->value('quote_number');

        if ($last && preg_match('/QR-(\d+)/', $last, $matches)) {
            $next = (int) $matches[1] + 1;
        } else {
            $next = 1;
        }

        return 'QR-' . str_pad($next, 6, '0', STR_PAD_LEFT);
    }
}
