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
            $table->string('quote_number')->unique();
            $table->enum('status', ['pending', 'reviewed', 'sent', 'accepted', 'rejected', 'converted', 'expired', 'cancelled'])->default('pending');
            $table->string('customer_email');
            $table->string('customer_name');
            $table->string('customer_phone')->nullable();
            $table->string('customer_company')->nullable();
            $table->string('shopify_customer_id')->nullable();
            $table->json('form_responses')->nullable();
            $table->text('customer_notes')->nullable();
            $table->text('internal_notes')->nullable();
            $table->enum('discount_type', ['percentage', 'fixed'])->nullable();
            $table->decimal('discount_value', 10, 2)->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('converted_at')->nullable();
            $table->string('draft_order_gid')->nullable();
            $table->string('order_gid')->nullable();
            $table->text('invoice_url')->nullable();
            $table->decimal('subtotal', 10, 2)->default(0);
            $table->decimal('total_discount', 10, 2)->default(0);
            $table->decimal('total_price', 10, 2)->default(0);
            $table->string('currency_code', 3)->default('USD');
            $table->timestamps();

            $table->index(['shop_id', 'status']);
            $table->index(['shop_id', 'created_at']);
            $table->index('customer_email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quotes');
    }
};
