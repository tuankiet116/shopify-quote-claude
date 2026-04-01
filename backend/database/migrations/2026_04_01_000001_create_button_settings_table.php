<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('button_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_id')->unique()->constrained()->cascadeOnDelete();
            $table->boolean('is_enabled')->default(true);
            $table->boolean('show_on_product')->default(true);
            $table->boolean('show_on_collection')->default(true);
            $table->boolean('show_on_search')->default(true);
            $table->boolean('show_on_home')->default(true);
            $table->json('appearance');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('button_settings');
    }
};
