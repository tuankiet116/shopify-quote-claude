<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreQuoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'shop' => ['required', 'string', 'max:255', 'regex:/^[a-z0-9-]+\.myshopify\.com$/'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'company' => ['nullable', 'string', 'max:255'],
            'message' => ['nullable', 'string', 'max:5000'],
            'website' => ['nullable', 'string', 'max:0'],
            'locale' => ['nullable', 'string', 'max:10'],
            'currency' => ['nullable', 'string', 'size:3'],
            'items' => ['required', 'array', 'min:1', 'max:50'],
            'items.*.product_id' => ['required', 'integer'],
            'items.*.variant_id' => ['nullable', 'integer'],
            'items.*.product_title' => ['required', 'string', 'max:255'],
            'items.*.variant_title' => ['nullable', 'string', 'max:255'],
            'items.*.product_handle' => ['required', 'string', 'max:255'],
            'items.*.image_url' => ['nullable', 'string', 'max:2048', 'regex:/^(https?:)?\/\//'],
            'items.*.price' => ['nullable', 'numeric', 'min:0'],
            'items.*.currency' => ['nullable', 'string', 'size:3'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:9999'],
        ];
    }
}
