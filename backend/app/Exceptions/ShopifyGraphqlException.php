<?php

namespace App\Exceptions;

use Exception;

class ShopifyGraphqlException extends Exception
{
    public function __construct(
        public readonly array $errors,
        ?\Throwable $previous = null,
    ) {
        $message = collect($errors)->pluck('message')->implode('; ');

        parent::__construct($message ?: 'Shopify GraphQL error', 0, $previous);
    }

    public function getGraphqlErrors(): array
    {
        return $this->errors;
    }
}
