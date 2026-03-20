<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuoteFormField extends Model
{
    protected $fillable = [
        'form_config_id',
        'field_name',
        'field_label',
        'field_type',
        'is_required',
        'options',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_required' => 'boolean',
            'options' => 'array',
        ];
    }

    public function formConfig(): BelongsTo
    {
        return $this->belongsTo(QuoteFormConfig::class, 'form_config_id');
    }
}
