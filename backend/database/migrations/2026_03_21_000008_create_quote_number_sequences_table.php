<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quote_number_sequences', function (Blueprint $table) {
            $table->foreignId('shop_id')->constrained()->cascadeOnDelete()->unique();
            $table->integer('last_number')->default(1000);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quote_number_sequences');
    }
};
