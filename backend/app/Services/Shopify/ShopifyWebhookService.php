<?php

namespace App\Services\Shopify;

use App\Models\Shop;

class ShopifyWebhookService
{
    public function registerAll(Shop $shop): void
    {
        $graphql = new ShopifyGraphqlService($shop);
        $appUrl = config('shopify.app_url');

        $topics = [
            'DRAFT_ORDERS_CREATE',
            'DRAFT_ORDERS_UPDATE',
            'ORDERS_CREATE',
            'APP_UNINSTALLED',
        ];

        foreach ($topics as $topic) {
            $mutation = <<<'GRAPHQL'
            mutation webhookSubscriptionCreate($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
                webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
                    webhookSubscription {
                        id
                    }
                    userErrors {
                        field
                        message
                    }
                }
            }
            GRAPHQL;

            try {
                $graphql->mutate($mutation, [
                    'topic' => $topic,
                    'webhookSubscription' => [
                        'callbackUrl' => "{$appUrl}/api/webhooks",
                        'format' => 'JSON',
                    ],
                ]);
            } catch (\Exception $e) {
                report($e);
            }
        }
    }

    public function unregisterAll(Shop $shop): void
    {
        $graphql = new ShopifyGraphqlService($shop);

        $query = <<<'GRAPHQL'
        {
            webhookSubscriptions(first: 25) {
                edges {
                    node {
                        id
                    }
                }
            }
        }
        GRAPHQL;

        try {
            $data = $graphql->query($query);
            $edges = $data['webhookSubscriptions']['edges'] ?? [];

            foreach ($edges as $edge) {
                $graphql->mutate(<<<'GRAPHQL'
                mutation webhookSubscriptionDelete($id: ID!) {
                    webhookSubscriptionDelete(id: $id) {
                        deletedWebhookSubscriptionId
                        userErrors {
                            field
                            message
                        }
                    }
                }
                GRAPHQL, ['id' => $edge['node']['id']]);
            }
        } catch (\Exception $e) {
            report($e);
        }
    }
}
