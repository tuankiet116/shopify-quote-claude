<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Shop extends Model
{
    protected $fillable = [
        'shopify_domain',
        'access_token',
        'scopes',
        'is_active',
        'installed_at',
        'uninstalled_at',
    ];

    protected function casts(): array
    {
        return [
            'access_token' => 'encrypted',
            'is_active' => 'boolean',
            'installed_at' => 'datetime',
            'uninstalled_at' => 'datetime',
        ];
    }

    public function settings(): HasOne
    {
        return $this->hasOne(ShopSetting::class);
    }

    public function quotes(): HasMany
    {
        return $this->hasMany(Quote::class);
    }

    public function formConfigs(): HasMany
    {
        return $this->hasMany(QuoteFormConfig::class);
    }

    public function numberSequence(): HasOne
    {
        return $this->hasOne(QuoteNumberSequence::class);
    }
}
