<?php

namespace App\Exceptions;

use Exception;

class ApiException extends Exception
{
    public function __construct(
        string $message,
        public readonly string $errorCode = 'api_error',
        int $httpStatus = 400,
        ?\Throwable $previous = null,
    ) {
        parent::__construct($message, $httpStatus, $previous);
    }

    public function getHttpStatus(): int
    {
        return $this->getCode();
    }

    public function getErrorCode(): string
    {
        return $this->errorCode;
    }
}
