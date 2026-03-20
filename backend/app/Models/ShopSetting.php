<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShopSetting extends Model
{
    protected $fillable = [
        'shop_id',
        'quote_expiry_days',
        'auto_expire_enabled',
        'reminder_days_before',
        'notify_on_new_quote',
        'notify_on_accepted',
        'email_subject_template',
        'email_body_template',
    ];

    protected function casts(): array
    {
        return [
            'auto_expire_enabled' => 'boolean',
            'notify_on_new_quote' => 'boolean',
            'notify_on_accepted' => 'boolean',
        ];
    }

    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class);
    }
}
