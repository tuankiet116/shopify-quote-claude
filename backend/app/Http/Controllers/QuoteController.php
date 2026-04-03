<?php

namespace App\Http\Controllers;

use App\Exceptions\ApiException;
use App\Services\QuoteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QuoteController extends Controller
{
    private const VALID_STATUSES = ['pending', 'reviewed', 'accepted', 'rejected', 'expired'];

    public function __construct(private QuoteService $quotes) {}

    public function index(Request $request): JsonResponse
    {
        $shop = $this->shop($request);
        $status = $request->query('status');

        $quotes = $this->quotes->listForShop($shop, $status);

        return $this->success($quotes);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $shop = $this->shop($request);
        $quote = $this->quotes->getForShop($shop, $id);

        return $this->success($quote);
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:' . implode(',', self::VALID_STATUSES)],
        ]);

        $shop = $this->shop($request);
        $quote = $this->quotes->updateStatus($shop, $id, $validated['status']);

        return $this->success($quote);
    }
}
