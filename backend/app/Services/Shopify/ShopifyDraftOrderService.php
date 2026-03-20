<?php

namespace App\Services\Shopify;

use App\Models\Quote;
use App\Models\Shop;

class ShopifyDraftOrderService
{
    private ShopifyGraphqlService $graphql;

    public function __construct(Shop $shop)
    {
        $this->graphql = new ShopifyGraphqlService($shop);
    }

    public function createFromQuote(Quote $quote): array
    {
        $lineItems = $quote->items->map(function ($item) {
            $lineItem = [
                'variantId' => $item->variant_id,
                'quantity' => $item->quantity,
            ];

            if ($item->offered_price !== null) {
                $lineItem['appliedDiscount'] = [
                    'title' => 'Quote Price',
                    'value' => (float) ($item->original_price - $item->offered_price),
                    'valueType' => 'FIXED_AMOUNT',
                ];
            }

            return $lineItem;
        })->toArray();

        $input = [
            'lineItems' => $lineItems,
            'tags' => ['quote', 'quote-' . $quote->quote_number],
            'note' => "Quote #{$quote->quote_number}",
        ];

        if ($quote->customer_email) {
            $input['email'] = $quote->customer_email;
        }

        if ($quote->discount_type && $quote->discount_value) {
            $input['appliedDiscount'] = [
                'title' => 'Quote Discount',
                'value' => (float) $quote->discount_value,
                'valueType' => $quote->discount_type === 'percentage' ? 'PERCENTAGE' : 'FIXED_AMOUNT',
            ];
        }

        return $this->graphql->mutate(<<<'GRAPHQL'
        mutation draftOrderCreate($input: DraftOrderInput!) {
            draftOrderCreate(input: $input) {
                draftOrder {
                    id
                    invoiceUrl
                    status
                    totalPrice
                }
                userErrors {
                    field
                    message
                }
            }
        }
        GRAPHQL, ['input' => $input]);
    }

    public function sendInvoice(string $draftOrderGid, string $email): array
    {
        return $this->graphql->mutate(<<<'GRAPHQL'
        mutation draftOrderInvoiceSend($id: ID!, $email: EmailInput!) {
            draftOrderInvoiceSend(id: $id, email: $email) {
                draftOrder {
                    id
                    status
                }
                userErrors {
                    field
                    message
                }
            }
        }
        GRAPHQL, [
            'id' => $draftOrderGid,
            'email' => [
                'to' => $email,
                'subject' => 'Your Quote is Ready',
            ],
        ]);
    }

    public function complete(string $draftOrderGid): array
    {
        return $this->graphql->mutate(<<<'GRAPHQL'
        mutation draftOrderComplete($id: ID!) {
            draftOrderComplete(id: $id) {
                draftOrder {
                    id
                    order {
                        id
                        name
                    }
                }
                userErrors {
                    field
                    message
                }
            }
        }
        GRAPHQL, ['id' => $draftOrderGid]);
    }

    public function calculate(array $input): array
    {
        return $this->graphql->query(<<<'GRAPHQL'
        mutation draftOrderCalculate($input: DraftOrderInput!) {
            draftOrderCalculate(input: $input) {
                calculatedDraftOrder {
                    totalPrice
                    subtotalPrice
                    totalTax
                }
                userErrors {
                    field
                    message
                }
            }
        }
        GRAPHQL, ['input' => $input]);
    }
}
