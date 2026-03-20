<?php

namespace App\Http\Controllers;

use App\Models\QuoteFormConfig;
use App\Services\Shopify\ShopifyGraphqlService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QuoteFormConfigController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $shop = $request->attributes->get('shopifyShop');

        $configs = QuoteFormConfig::where('shop_id', $shop->id)
            ->with('fields')
            ->orderByDesc('created_at')
            ->get();

        return response()->json($configs);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $shop = $request->attributes->get('shopifyShop');

        $config = QuoteFormConfig::where('shop_id', $shop->id)
            ->with('fields')
            ->findOrFail($id);

        return response()->json($config);
    }

    public function store(Request $request): JsonResponse
    {
        $shop = $request->attributes->get('shopifyShop');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'is_default' => 'boolean',
            'is_active' => 'boolean',
            'fields' => 'sometimes|array',
            'fields.*.field_name' => 'required|string',
            'fields.*.field_label' => 'required|string',
            'fields.*.field_type' => 'required|in:text,email,phone,textarea,select,number',
            'fields.*.is_required' => 'boolean',
            'fields.*.options' => 'nullable|array',
            'fields.*.sort_order' => 'integer',
        ]);

        if (!empty($validated['is_default'])) {
            QuoteFormConfig::where('shop_id', $shop->id)->update(['is_default' => false]);
        }

        $config = QuoteFormConfig::create([
            'shop_id' => $shop->id,
            'name' => $validated['name'],
            'is_default' => $validated['is_default'] ?? false,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        if (!empty($validated['fields'])) {
            foreach ($validated['fields'] as $index => $fieldData) {
                $config->fields()->create(array_merge($fieldData, [
                    'sort_order' => $fieldData['sort_order'] ?? $index,
                ]));
            }
        }

        return response()->json($config->load('fields'), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $shop = $request->attributes->get('shopifyShop');
        $config = QuoteFormConfig::where('shop_id', $shop->id)->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'is_default' => 'boolean',
            'is_active' => 'boolean',
            'fields' => 'sometimes|array',
            'fields.*.field_name' => 'required|string',
            'fields.*.field_label' => 'required|string',
            'fields.*.field_type' => 'required|in:text,email,phone,textarea,select,number',
            'fields.*.is_required' => 'boolean',
            'fields.*.options' => 'nullable|array',
            'fields.*.sort_order' => 'integer',
        ]);

        if (!empty($validated['is_default'])) {
            QuoteFormConfig::where('shop_id', $shop->id)->where('id', '!=', $id)->update(['is_default' => false]);
        }

        $config->update(collect($validated)->except('fields')->toArray());

        if (isset($validated['fields'])) {
            $config->fields()->delete();
            foreach ($validated['fields'] as $index => $fieldData) {
                $config->fields()->create(array_merge($fieldData, [
                    'sort_order' => $fieldData['sort_order'] ?? $index,
                ]));
            }
        }

        return response()->json($config->fresh('fields'));
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $shop = $request->attributes->get('shopifyShop');
        $config = QuoteFormConfig::where('shop_id', $shop->id)->findOrFail($id);
        $config->delete();

        return response()->json(['message' => 'Form config deleted']);
    }

    public function publish(Request $request, int $id): JsonResponse
    {
        $shop = $request->attributes->get('shopifyShop');
        $config = QuoteFormConfig::where('shop_id', $shop->id)->with('fields')->findOrFail($id);

        $formConfigJson = json_encode([
            'formId' => 'cf_' . $config->id,
            'title' => 'Request a Quote',
            'description' => 'Fill in details and we\'ll get back to you',
            'submitButtonText' => 'Submit Quote',
            'successMessage' => 'Quote submitted! We\'ll contact you soon.',
            'fields' => $config->fields->map(fn ($f) => [
                'name' => $f->field_name,
                'label' => $f->field_label,
                'type' => $f->field_type,
                'required' => $f->is_required,
                'options' => $f->options,
            ])->toArray(),
        ]);

        $graphql = new ShopifyGraphqlService($shop);
        $graphql->mutate(<<<'GRAPHQL'
        mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
            metafieldsSet(metafields: $metafields) {
                metafields {
                    id
                    key
                }
                userErrors {
                    field
                    message
                }
            }
        }
        GRAPHQL, [
            'metafields' => [[
                'namespace' => '$app',
                'key' => 'quote_form_config',
                'value' => $formConfigJson,
                'type' => 'json',
                'ownerId' => "gid://shopify/Shop",
            ]],
        ]);

        return response()->json(['message' => 'Form config published to metafield']);
    }
}
