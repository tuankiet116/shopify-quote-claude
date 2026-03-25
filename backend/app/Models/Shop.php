<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Shop extends Model
{
    protected $fillable = [
        'shop',
        'access_token',
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
}
