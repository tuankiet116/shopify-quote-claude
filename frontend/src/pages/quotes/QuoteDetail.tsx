import { Page, Layout, Card, BlockStack, InlineStack, Text, Button, TextField, Select, Modal, Banner, Divider } from '@shopify/polaris';
import { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppQuery } from '../../hooks/useAppQuery';
import { apiPost, apiPut } from '../../api/client';
import QuoteStatusBadge from '../../components/QuoteStatusBadge';
import QuoteItemRow from '../../components/QuoteItemRow';
import QuoteTimeline from '../../components/QuoteTimeline';

export default function QuoteDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: quote, loading, refetch } = useAppQuery<any>(`quotes/${id}`);

    const [editing, setEditing] = useState(false);
    const [items, setItems] = useState<any[]>([]);
    const [discountType, setDiscountType] = useState<string>('');
    const [discountValue, setDiscountValue] = useState('');
    const [internalNotes, setInternalNotes] = useState('');
    const [noteText, setNoteText] = useState('');
    const [sendModalOpen, setSendModalOpen] = useState(false);
    const [convertModalOpen, setConvertModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');

    const startEditing = useCallback(() => {
        if (quote) {
            setItems(quote.items || []);
            setDiscountType(quote.discount_type || '');
            setDiscountValue(String(quote.discount_value || ''));
            setInternalNotes(quote.internal_notes || '');
            setEditing(true);
        }
    }, [quote]);

    const handleSave = useCallback(async () => {
        setActionLoading(true);
        setError('');
        try {
            await apiPut(`quotes/${id}`, {
                items,
                discount_type: discountType || null,
                discount_value: discountValue ? parseFloat(discountValue) : null,
                internal_notes: internalNotes || null,
            });
            setEditing(false);
            refetch();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setActionLoading(false);
        }
    }, [id, items, discountType, discountValue, internalNotes, refetch]);

    const handleSendQuote = useCallback(async () => {
        setActionLoading(true);
        setError('');
        try {
            await apiPost(`quotes/${id}/send`);
            setSendModalOpen(false);
            refetch();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setActionLoading(false);
        }
    }, [id, refetch]);

    const handleConvert = useCallback(async () => {
        setActionLoading(true);
        setError('');
        try {
            await apiPost(`quotes/${id}/convert`);
            setConvertModalOpen(false);
            refetch();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setActionLoading(false);
        }
    }, [id, refetch]);

    const handleAddNote = useCallback(async () => {
        if (!noteText.trim()) return;
        try {
            await apiPost(`quotes/${id}/notes`, { note: noteText });
            setNoteText('');
            refetch();
        } catch (e: any) {
            setError(e.message);
        }
    }, [id, noteText, refetch]);

    const handleAddProduct = useCallback(async () => {
        try {
            const shopify = (window as any).shopify;
            const selected = await shopify.resourcePicker({
                type: 'product',
                action: 'select',
                multiple: true,
            });
            if (selected?.length) {
                const newItems: any[] = [];
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
        } catch (e) {}
    }, []);

    if (loading || !quote) {
        return <Page title="Loading..." backAction={{ onAction: () => navigate('/app/quotes') }} />;
    }

    const displayItems = editing ? items : (quote.items || []);
    const subtotal = displayItems.reduce((sum: number, item: any) => {
        const price = item.offered_price ?? item.original_price;
        return sum + (price * item.quantity);
    }, 0);

    const canSend = ['pending', 'reviewed'].includes(quote.status);
    const canConvert = quote.status === 'sent' && quote.draft_order_gid;

    return (
        <Page
            title={`Quote ${quote.quote_number}`}
            subtitle={quote.customer_name}
            backAction={{ onAction: () => navigate('/app/quotes') }}
            secondaryActions={[
                ...(editing ? [{ content: 'Cancel', onAction: () => setEditing(false) }] : [{ content: 'Edit', onAction: startEditing }]),
            ]}
            primaryAction={editing
                ? { content: 'Save', onAction: handleSave, loading: actionLoading }
                : canSend
                    ? { content: 'Send Quote', onAction: () => setSendModalOpen(true) }
                    : canConvert
                        ? { content: 'Convert to Order', onAction: () => setConvertModalOpen(true) }
                        : undefined
            }
        >
            {error && <Banner tone="critical" onDismiss={() => setError('')}>{error}</Banner>}

            <Layout>
                <Layout.Section>
                    <Card>
                        <BlockStack gap="400">
                            <InlineStack align="space-between">
                                <Text as="h2" variant="headingMd">Line Items</Text>
                                {editing && <Button onClick={handleAddProduct} size="slim">Add Products</Button>}
                            </InlineStack>

                            <InlineStack gap="400" wrap={false}>
                                <div style={{ width: '40px' }}></div>
                                <div style={{ flex: 1 }}><Text as="p" variant="bodySm" fontWeight="semibold">Product</Text></div>
                                <div style={{ width: '80px' }}><Text as="p" variant="bodySm" fontWeight="semibold">Qty</Text></div>
                                <div style={{ width: '100px' }}><Text as="p" variant="bodySm" fontWeight="semibold" alignment="end">Original</Text></div>
                                <div style={{ width: '100px' }}><Text as="p" variant="bodySm" fontWeight="semibold" alignment="end">Offered</Text></div>
                                <div style={{ width: '100px' }}><Text as="p" variant="bodySm" fontWeight="semibold" alignment="end">Line Total</Text></div>
                                {editing && <div style={{ width: '60px' }}></div>}
                            </InlineStack>

                            {displayItems.map((item: any, index: number) => (
                                <QuoteItemRow
                                    key={item.id || index}
                                    item={item}
                                    editable={editing}
                                    onQuantityChange={(q) => {
                                        const updated = [...items];
                                        updated[index] = { ...updated[index], quantity: q };
                                        setItems(updated);
                                    }}
                                    onPriceChange={(p) => {
                                        const updated = [...items];
                                        updated[index] = { ...updated[index], offered_price: p };
                                        setItems(updated);
                                    }}
                                    onRemove={() => setItems(items.filter((_, i) => i !== index))}
                                />
                            ))}

                            <Divider />
                            {editing && (
                                <InlineStack gap="400">
                                    <div style={{ width: '200px' }}>
                                        <Select
                                            label="Discount Type"
                                            options={[
                                                { label: 'None', value: '' },
                                                { label: 'Percentage', value: 'percentage' },
                                                { label: 'Fixed Amount', value: 'fixed' },
                                            ]}
                                            value={discountType}
                                            onChange={setDiscountType}
                                        />
                                    </div>
                                    {discountType && (
                                        <div style={{ width: '150px' }}>
                                            <TextField
                                                label="Discount Value"
                                                type="number"
                                                value={discountValue}
                                                onChange={setDiscountValue}
                                                prefix={discountType === 'fixed' ? '$' : undefined}
                                                suffix={discountType === 'percentage' ? '%' : undefined}
                                                autoComplete="off"
                                            />
                                        </div>
                                    )}
                                </InlineStack>
                            )}
                            <InlineStack align="end">
                                <BlockStack gap="200">
                                    <InlineStack gap="400" align="end">
                                        <Text as="p">Subtotal:</Text>
                                        <Text as="p" fontWeight="semibold">${subtotal.toFixed(2)}</Text>
                                    </InlineStack>
                                    {quote.total_discount > 0 && (
                                        <InlineStack gap="400" align="end">
                                            <Text as="p">Discount:</Text>
                                            <Text as="p" tone="critical">-${parseFloat(quote.total_discount).toFixed(2)}</Text>
                                        </InlineStack>
                                    )}
                                    <InlineStack gap="400" align="end">
                                        <Text as="p" fontWeight="bold">Total:</Text>
                                        <Text as="p" fontWeight="bold">${parseFloat(quote.total_price).toFixed(2)}</Text>
                                    </InlineStack>
                                </BlockStack>
                            </InlineStack>
                        </BlockStack>
                    </Card>
                </Layout.Section>

                <Layout.Section variant="oneThird">
                    <BlockStack gap="400">
                        <Card>
                            <BlockStack gap="300">
                                <InlineStack align="space-between">
                                    <Text as="h2" variant="headingSm">Status</Text>
                                    <QuoteStatusBadge status={quote.status} />
                                </InlineStack>
                                {quote.expires_at && (
                                    <Text as="p" variant="bodySm" tone="subdued">
                                        Expires: {new Date(quote.expires_at).toLocaleDateString()}
                                    </Text>
                                )}
                                {quote.invoice_url && (
                                    <Button url={quote.invoice_url} target="_blank" size="slim">View Invoice</Button>
                                )}
                            </BlockStack>
                        </Card>

                        <Card>
                            <BlockStack gap="200">
                                <Text as="h2" variant="headingSm">Customer</Text>
                                <Text as="p">{quote.customer_name}</Text>
                                <Text as="p" tone="subdued">{quote.customer_email}</Text>
                                {quote.customer_phone && <Text as="p" tone="subdued">{quote.customer_phone}</Text>}
                                {quote.customer_company && <Text as="p" tone="subdued">{quote.customer_company}</Text>}
                                {quote.customer_notes && (
                                    <>
                                        <Text as="p" variant="bodySm" fontWeight="semibold">Customer Notes:</Text>
                                        <Text as="p" variant="bodySm">{quote.customer_notes}</Text>
                                    </>
                                )}
                            </BlockStack>
                        </Card>

                        <Card>
                            <BlockStack gap="300">
                                <Text as="h2" variant="headingSm">Internal Notes</Text>
                                <TextField
                                    label="Add a note"
                                    labelHidden
                                    value={noteText}
                                    onChange={setNoteText}
                                    multiline={3}
                                    autoComplete="off"
                                />
                                <Button onClick={handleAddNote} size="slim">Add Note</Button>
                            </BlockStack>
                        </Card>

                        <QuoteTimeline activities={quote.activities || []} />
                    </BlockStack>
                </Layout.Section>
            </Layout>

            <Modal
                open={sendModalOpen}
                onClose={() => setSendModalOpen(false)}
                title="Send Quote"
                primaryAction={{ content: 'Send Quote', onAction: handleSendQuote, loading: actionLoading }}
                secondaryActions={[{ content: 'Cancel', onAction: () => setSendModalOpen(false) }]}
            >
                <Modal.Section>
                    <Text as="p">
                        This will create a draft order and send an invoice to {quote.customer_email}.
                    </Text>
                </Modal.Section>
            </Modal>

            <Modal
                open={convertModalOpen}
                onClose={() => setConvertModalOpen(false)}
                title="Convert to Order"
                primaryAction={{ content: 'Convert', onAction: handleConvert, loading: actionLoading }}
                secondaryActions={[{ content: 'Cancel', onAction: () => setConvertModalOpen(false) }]}
            >
                <Modal.Section>
                    <Text as="p">
                        This will complete the draft order and create a final order.
                    </Text>
                </Modal.Section>
            </Modal>
        </Page>
    );
}
