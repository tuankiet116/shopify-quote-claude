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
        'product_handle',
        'image_url',
        'price',
        'currency',
        'quantity',
    ];

    protected function casts(): array
    {
        return [
            'product_id' => 'integer',
            'variant_id' => 'integer',
            'price' => 'decimal:2',
            'quantity' => 'integer',
        ];
    }

    public function quote(): BelongsTo
    {
        return $this->belongsTo(Quote::class);
    }
}
