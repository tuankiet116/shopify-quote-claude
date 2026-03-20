<?php

namespace App\Services;

use App\Models\QuoteNumberSequence;
use App\Models\Shop;
use Illuminate\Support\Facades\DB;

class QuoteNumberService
{
    public function generate(Shop $shop): string
    {
        return DB::transaction(function () use ($shop) {
            $sequence = QuoteNumberSequence::lockForUpdate()
                ->firstOrCreate(
                    ['shop_id' => $shop->id],
                    ['last_number' => 1000]
                );

            $sequence->increment('last_number');
            $sequence->refresh();

            return 'Q-' . $sequence->last_number;
        });
    }
}
