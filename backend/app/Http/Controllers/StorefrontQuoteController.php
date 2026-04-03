<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreQuoteRequest;
use App\Services\QuoteService;
use Illuminate\Http\JsonResponse;

class StorefrontQuoteController extends Controller
{
    public function __construct(private QuoteService $quotes) {}

    public function store(StoreQuoteRequest $request): JsonResponse
    {
        $quote = $this->quotes->createFromStorefront(
            $request->validated(),
            $request->ip(),
        );

        return $this->created([
            'quote_number' => $quote->quote_number,
        ]);
    }
}
