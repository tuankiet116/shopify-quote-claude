<?php

namespace App\Http\Controllers;

use App\Models\Shop;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

abstract class Controller
{
    protected function shop(Request $request): Shop
    {
        return $request->attributes->get('shopifyShop');
    }

    protected function success(mixed $data = null, ?string $message = null, int $status = 200): JsonResponse
    {
        return response()->json(array_filter([
            'success' => true,
            'data' => $data,
            'message' => $message,
        ], fn ($v) => $v !== null), $status);
    }

    protected function created(mixed $data = null, string $message = 'Created.'): JsonResponse
    {
        return $this->success($data, $message, 201);
    }
}
