<?php

namespace App\Http\Controllers;

use App\Services\Shopify\ShopifyGraphqlService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function search(Request $request): JsonResponse
    {
        $shop = $request->attributes->get('shopifyShop');
        $query = $request->query('q', '');

        $graphql = new ShopifyGraphqlService($shop);

        $data = $graphql->query(<<<'GRAPHQL'
        query searchProducts($query: String!) {
            products(first: 25, query: $query) {
                edges {
                    node {
                        id
                        title
                        handle
                        featuredImage {
                            url
                        }
                        variants(first: 50) {
                            edges {
                                node {
                                    id
                                    title
                                    price
                                    sku
                                    inventoryQuantity
                                    image {
                                        url
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        GRAPHQL, ['query' => $query]);

        return response()->json($data);
    }
}
