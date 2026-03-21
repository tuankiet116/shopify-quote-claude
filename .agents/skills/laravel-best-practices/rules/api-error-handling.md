---
title: Error Handling
impact: HIGH
impactDescription: Consistent error responses and proper exception management
tags: api, errors
---

## Error Handling

API errors should be consistent, informative for debugging, and safe for production.

### Response format

Use a consistent error structure across all endpoints:

```json
{
    "message": "Human-readable error message",
    "errors": {
        "field_name": ["Specific validation error"]
    }
}
```

Laravel's default exception handler already produces this format for validation
errors (422). Match it for custom errors.

### Custom exceptions for domain errors

Create specific exceptions instead of throwing generic ones:

```php
namespace App\Exceptions;

use Symfony\Component\HttpKernel\Exception\HttpException;

class QuoteNotSendableException extends HttpException
{
    public function __construct(string $reason)
    {
        parent::__construct(422, "Quote cannot be sent: {$reason}");
    }
}
```

```php
// In service
if ($quote->status !== 'reviewed') {
    throw new QuoteNotSendableException("status is '{$quote->status}', expected 'reviewed'");
}
```

### Controller error handling

Let exceptions bubble up to Laravel's handler for most cases. Only catch
when you need to add context or handle gracefully:

```php
public function sendQuote(Request $request, int $id): JsonResponse
{
    $quote = $shop->quotes()->findOrFail($id);

    try {
        $result = $this->sendQuoteAction->execute($quote);
        return response()->json(new QuoteResource($result));
    } catch (ShopifyApiException $e) {
        // Add context, then re-throw or return specific error
        report($e);
        return response()->json([
            'message' => 'Failed to create draft order on Shopify',
        ], 502);
    }
}
```

### Service error handling

Services should throw exceptions for failures, not return error arrays:

```php
// ❌ Returning error state
public function createDraftOrder(Quote $quote): array
{
    $response = Http::post(...);
    if ($response->failed()) {
        return ['success' => false, 'error' => 'API failed'];
    }
    return ['success' => true, 'data' => $response->json()];
}

// ✅ Throw on failure, return data on success
public function createDraftOrder(Quote $quote): array
{
    $response = Http::post(...);

    if ($response->failed()) {
        throw new ShopifyApiException(
            "Draft order creation failed: " . $response->body()
        );
    }

    return $response->json('data');
}
```

### Handle external API failures gracefully

For non-critical external calls (webhooks, notifications), catch and log
without crashing the main operation:

```php
public function processExpiredQuotes(): int
{
    $expired = Quote::where('status', 'sent')
        ->where('expires_at', '<', now())
        ->get();

    $count = 0;
    foreach ($expired as $quote) {
        try {
            $quote->update(['status' => 'expired']);
            $count++;
        } catch (\Throwable $e) {
            report($e); // Log but continue processing others
        }
    }

    return $count;
}
```

### Never expose internals in production

```php
// bootstrap/app.php — Laravel's exception handler configuration
// Already handles this, but be mindful in custom error responses:

// ❌ Exposing stack trace
return response()->json(['error' => $e->getMessage(), 'trace' => $e->getTrace()], 500);

// ✅ Generic message in production
return response()->json(['message' => 'An unexpected error occurred'], 500);
```
