<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ButtonSetting extends Model
{
    protected $fillable = [
        'shop_id',
        'is_enabled',
        'show_on_product',
        'show_on_collection',
        'show_on_search',
        'show_on_home',
        'appearance',
    ];

    protected function casts(): array
    {
        return [
            'is_enabled' => 'boolean',
            'show_on_product' => 'boolean',
            'show_on_collection' => 'boolean',
            'show_on_search' => 'boolean',
            'show_on_home' => 'boolean',
            'appearance' => 'array',
        ];
    }

    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class);
    }

    public function toMetafieldJson(): array
    {
        return [
            'is_enabled' => $this->is_enabled,
            'show_on_product' => $this->show_on_product,
            'show_on_collection' => $this->show_on_collection,
            'show_on_search' => $this->show_on_search,
            'show_on_home' => $this->show_on_home,
            'appearance' => $this->appearance,
        ];
    }

    public static function defaults(): array
    {
        return [
            'is_enabled' => true,
            'show_on_product' => true,
            'show_on_collection' => true,
            'show_on_search' => true,
            'show_on_home' => true,
            'appearance' => [
                'button_text' => 'Request a Quote',
                'bg_color' => '#000000',
                'text_color' => '#FFFFFF',
                'hover_bg_color' => '#333333',
                'border_radius' => 4,
                'border_width' => 0,
                'border_color' => '#000000',
                'size' => 'medium',
            ],
        ];
    }
}
