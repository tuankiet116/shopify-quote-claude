<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuoteItem extends Model
{
    protected $fillable = [
        'quote_id',
        'product_id',
        'variant_id',
        'product_title',
        'variant_title',
        'sku',
        'image_url',
        'quantity',
        'original_price',
        'offered_price',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'original_price' => 'decimal:2',
            'offered_price' => 'decimal:2',
        ];
    }

    public function quote(): BelongsTo
    {
        return $this->belongsTo(Quote::class);
    }
}
