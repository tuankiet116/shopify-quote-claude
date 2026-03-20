<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shop_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_id')->constrained()->cascadeOnDelete();
            $table->integer('quote_expiry_days')->default(30);
            $table->boolean('auto_expire_enabled')->default(true);
            $table->integer('reminder_days_before')->default(3);
            $table->boolean('notify_on_new_quote')->default(true);
            $table->boolean('notify_on_accepted')->default(true);
            $table->string('email_subject_template')->default('Your Quote #{quoteNumber}');
            $table->text('email_body_template')->default('');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shop_settings');
    }
};
