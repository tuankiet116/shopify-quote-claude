<?php

namespace App\Http\Controllers;

use App\Models\Quote;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats(Request $request): JsonResponse
    {
        $shop = $request->attributes->get('shopifyShop');

        $quotes = Quote::where('shop_id', $shop->id);

        $totalQuotes = (clone $quotes)->count();
        $pendingQuotes = (clone $quotes)->where('status', 'pending')->count();
        $sentQuotes = (clone $quotes)->where('status', 'sent')->count();
        $acceptedQuotes = (clone $quotes)->where('status', 'accepted')->count();
        $convertedThisMonth = (clone $quotes)
            ->where('status', 'converted')
            ->where('converted_at', '>=', now()->startOfMonth())
            ->count();
        $revenueThisMonth = (clone $quotes)
            ->where('status', 'converted')
            ->where('converted_at', '>=', now()->startOfMonth())
            ->sum('total_price');

        $recentQuotes = Quote::where('shop_id', $shop->id)
            ->with('items')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        return response()->json([
            'stats' => [
                'total_quotes' => $totalQuotes,
                'pending' => $pendingQuotes,
                'sent' => $sentQuotes,
                'accepted' => $acceptedQuotes,
                'converted_this_month' => $convertedThisMonth,
                'revenue_this_month' => $revenueThisMonth,
            ],
            'recent_quotes' => $recentQuotes,
        ]);
    }
}
