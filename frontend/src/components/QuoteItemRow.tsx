import { TextField, InlineStack, Text, Thumbnail, BlockStack } from '@shopify/polaris';
import { ImageIcon } from '@shopify/polaris-icons';

interface QuoteItemRowProps {
    item: {
        id?: number;
        product_title: string;
        variant_title?: string;
        sku?: string;
        image_url?: string;
        quantity: number;
        original_price: number;
        offered_price: number | null;
    };
    editable?: boolean;
    onQuantityChange?: (quantity: number) => void;
    onPriceChange?: (price: number) => void;
    onRemove?: () => void;
}

export default function QuoteItemRow({ item, editable = false, onQuantityChange, onPriceChange, onRemove }: QuoteItemRowProps) {
    const effectivePrice = item.offered_price ?? item.original_price;
    const lineTotal = effectivePrice * item.quantity;

    return (
        <InlineStack align="start" gap="400" blockAlign="center" wrap={false}>
            <Thumbnail
                source={item.image_url || ImageIcon}
                alt={item.product_title}
                size="small"
            />
            <div style={{ flex: 1, minWidth: 0 }}>
                <BlockStack gap="100">
                    <Text as="p" variant="bodyMd" fontWeight="semibold" truncate>
                        {item.product_title}
                    </Text>
                    {item.variant_title && (
                        <Text as="p" variant="bodySm" tone="subdued">{item.variant_title}</Text>
                    )}
                    {item.sku && (
                        <Text as="p" variant="bodySm" tone="subdued">SKU: {item.sku}</Text>
                    )}
                </BlockStack>
            </div>
            <div style={{ width: '80px' }}>
                {editable ? (
                    <TextField
                        label="Qty"
                        labelHidden
                        type="number"
                        value={String(item.quantity)}
                        onChange={(val) => onQuantityChange?.(parseInt(val) || 1)}
                        min={1}
                        autoComplete="off"
                    />
                ) : (
                    <Text as="p" alignment="center">{item.quantity}</Text>
                )}
            </div>
            <div style={{ width: '100px' }}>
                <Text as="p" variant="bodySm" tone="subdued" alignment="end">
                    ${item.original_price.toFixed(2)}
                </Text>
            </div>
            <div style={{ width: '100px' }}>
                {editable ? (
                    <TextField
                        label="Price"
                        labelHidden
                        type="number"
                        value={String(item.offered_price ?? item.original_price)}
                        onChange={(val) => onPriceChange?.(parseFloat(val) || 0)}
                        prefix="$"
                        autoComplete="off"
                    />
                ) : (
                    <Text as="p" alignment="end" fontWeight={item.offered_price !== null ? 'semibold' : 'regular'}>
                        ${effectivePrice.toFixed(2)}
                    </Text>
                )}
            </div>
            <div style={{ width: '100px' }}>
                <Text as="p" alignment="end" fontWeight="semibold">
                    ${lineTotal.toFixed(2)}
                </Text>
            </div>
            {editable && onRemove && (
                <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#bf0711' }}>
                    Remove
                </button>
            )}
        </InlineStack>
    );
}
