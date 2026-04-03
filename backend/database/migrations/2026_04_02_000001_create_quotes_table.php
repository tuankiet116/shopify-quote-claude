<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quotes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_id')->constrained()->cascadeOnDelete();
            $table->string('quote_number', 20);
            $table->string('status', 20)->default('pending');
            $table->string('customer_name');
            $table->string('customer_email');
            $table->string('customer_phone', 50)->nullable();
            $table->string('customer_company')->nullable();
            $table->text('message')->nullable();
            $table->string('locale', 10)->nullable();
            $table->string('currency', 3)->nullable();
            $table->unsignedInteger('total_items')->default(0);
            $table->string('ip_address', 45)->nullable();
            $table->timestamp('submitted_at')->useCurrent();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->unique(['shop_id', 'quote_number']);
            $table->index(['shop_id', 'status']);
            $table->index(['shop_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quotes');
    }
};
