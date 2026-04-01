<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ButtonSettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'is_enabled' => ['required', 'boolean'],
            'show_on_product' => ['required', 'boolean'],
            'show_on_collection' => ['required', 'boolean'],
            'show_on_search' => ['required', 'boolean'],
            'show_on_home' => ['required', 'boolean'],
            'appearance' => ['required', 'array'],
            'appearance.button_text' => ['required', 'string', 'max:100'],
            'appearance.bg_color' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'appearance.text_color' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'appearance.hover_bg_color' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'appearance.border_radius' => ['required', 'integer', 'min:0', 'max:50'],
            'appearance.border_width' => ['required', 'integer', 'min:0', 'max:10'],
            'appearance.border_color' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'appearance.size' => ['required', 'string', 'in:small,medium,large'],
        ];
    }
}
