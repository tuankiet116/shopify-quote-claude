import { Page, Layout, Card, BlockStack, TextField, Button, Banner, InlineStack, Text } from '@shopify/polaris';
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiPost } from '../../api/client';
import QuoteItemRow from '../../components/QuoteItemRow';

interface LineItem {
    product_id: string;
    variant_id: string;
    product_title: string;
    variant_title: string;
    sku: string;
    image_url: string;
    quantity: number;
    original_price: number;
    offered_price: number | null;
}

export default function QuoteCreate() {
    const navigate = useNavigate();
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerCompany, setCustomerCompany] = useState('');
    const [customerNotes, setCustomerNotes] = useState('');
    const [items, setItems] = useState<LineItem[]>([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleAddProduct = useCallback(async () => {
        try {
            const shopify = (window as any).shopify;
            const selected = await shopify.resourcePicker({
                type: 'product',
                action: 'select',
                multiple: true,
            });

            if (selected && selected.length > 0) {
                const newItems: LineItem[] = [];
                for (const product of selected) {
                    for (const variant of product.variants) {
                        newItems.push({
                            product_id: String(product.id),
                            variant_id: String(variant.id),
                            product_title: product.title,
                            variant_title: variant.title !== 'Default Title' ? variant.title : '',
                            sku: variant.sku || '',
                            image_url: product.images?.[0]?.originalSrc || '',
                            quantity: 1,
                            original_price: parseFloat(variant.price),
                            offered_price: null,
                        });
                    }
                }
                setItems(prev => [...prev, ...newItems]);
            }
        } catch (e) {
            // User cancelled picker
        }
    }, []);

    const handleSave = useCallback(async () => {
        if (!customerName || !customerEmail || items.length === 0) {
            setError('Please fill in customer name, email, and add at least one product');
            return;
        }
        setSaving(true);
        setError('');
        try {
            const quote = await apiPost('quotes', {
                customer_name: customerName,
                customer_email: customerEmail,
                customer_phone: customerPhone || null,
                customer_company: customerCompany || null,
                customer_notes: customerNotes || null,
                items,
            });
            navigate(`/app/quotes/${quote.id}`);
        } catch (e: any) {
            setError(e.message || 'Failed to create quote');
        } finally {
            setSaving(false);
        }
    }, [customerName, customerEmail, customerPhone, customerCompany, customerNotes, items, navigate]);

    const updateItem = (index: number, updates: Partial<LineItem>) => {
        setItems(prev => prev.map((item, i) => i === index ? { ...item, ...updates } : item));
    };

    const removeItem = (index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <Page
            title="Create Quote"
            backAction={{ onAction: () => navigate('/app/quotes') }}
            primaryAction={{ content: 'Create Quote', onAction: handleSave, loading: saving }}
        >
            {error && (
                <Layout.Section>
                    <Banner tone="critical" onDismiss={() => setError('')}>{error}</Banner>
                </Layout.Section>
            )}
            <Layout>
                <Layout.Section>
                    <Card>
                        <BlockStack gap="400">
                            <Text as="h2" variant="headingMd">Products</Text>
                            {items.map((item, index) => (
                                <QuoteItemRow
                                    key={index}
                                    item={item}
                                    editable
                                    onQuantityChange={(q) => updateItem(index, { quantity: q })}
                                    onPriceChange={(p) => updateItem(index, { offered_price: p })}
                                    onRemove={() => removeItem(index)}
                                />
                            ))}
                            <Button onClick={handleAddProduct}>Add Products</Button>
                        </BlockStack>
                    </Card>
                </Layout.Section>

                <Layout.Section variant="oneThird">
                    <Card>
                        <BlockStack gap="400">
                            <Text as="h2" variant="headingMd">Customer Information</Text>
                            <TextField label="Name" value={customerName} onChange={setCustomerName} autoComplete="name" requiredIndicator />
                            <TextField label="Email" value={customerEmail} onChange={setCustomerEmail} type="email" autoComplete="email" requiredIndicator />
                            <TextField label="Phone" value={customerPhone} onChange={setCustomerPhone} autoComplete="tel" />
                            <TextField label="Company" value={customerCompany} onChange={setCustomerCompany} autoComplete="organization" />
                            <TextField label="Notes" value={customerNotes} onChange={setCustomerNotes} multiline={4} autoComplete="off" />
                        </BlockStack>
                    </Card>
                </Layout.Section>
            </Layout>
        </Page>
    );
}
