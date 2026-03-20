import { Page, Layout, Card, BlockStack, TextField, Checkbox, Button, Banner, Select, InlineStack, Text } from '@shopify/polaris';
import { useState, useCallback, useEffect } from 'react';
import { useAppQuery } from '../hooks/useAppQuery';
import { apiPut } from '../api/client';

export default function Settings() {
    const { data: settings, loading, refetch } = useAppQuery<any>('settings');
    const [formData, setFormData] = useState<any>({});
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    // Storefront settings state
    const [buttonSettings, setButtonSettings] = useState({
        text: 'Request Quote',
        backgroundColor: '#000000',
        textColor: '#FFFFFF',
        size: 'medium',
        borderRadius: '4px',
        position: 'after_atc',
        showOnProduct: true,
        showOnCollection: true,
        showQuantitySelector: true,
        iconEnabled: true,
    });

    const [cartSettings, setCartSettings] = useState({
        enabled: true,
        position: 'bottom-right',
        badgeColor: '#FF0000',
        drawerWidth: '400px',
    });

    useEffect(() => {
        if (settings) {
            setFormData(settings);
        }
    }, [settings]);

    const updateField = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleSave = useCallback(async () => {
        setSaving(true);
        setError('');
        try {
            await apiPut('settings', formData);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    }, [formData]);

    const handleSaveStorefront = useCallback(async () => {
        setSaving(true);
        setError('');
        try {
            await apiPut('settings/storefront', { buttonSettings, cartSettings });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    }, [buttonSettings, cartSettings]);

    return (
        <Page title="Settings">
            {saved && <Banner tone="success" onDismiss={() => setSaved(false)}>Settings saved</Banner>}
            {error && <Banner tone="critical" onDismiss={() => setError('')}>{error}</Banner>}

            <Layout>
                <Layout.AnnotatedSection
                    title="Quote Settings"
                    description="Configure quote expiry and automation"
                >
                    <Card>
                        <BlockStack gap="400">
                            <TextField
                                label="Quote Expiry (days)"
                                type="number"
                                value={String(formData.quote_expiry_days || 30)}
                                onChange={(val) => updateField('quote_expiry_days', parseInt(val))}
                                autoComplete="off"
                            />
                            <Checkbox
                                label="Auto-expire quotes"
                                checked={formData.auto_expire_enabled ?? true}
                                onChange={(val) => updateField('auto_expire_enabled', val)}
                            />
                            <TextField
                                label="Send reminder (days before expiry)"
                                type="number"
                                value={String(formData.reminder_days_before || 3)}
                                onChange={(val) => updateField('reminder_days_before', parseInt(val))}
                                autoComplete="off"
                            />
                        </BlockStack>
                    </Card>
                </Layout.AnnotatedSection>

                <Layout.AnnotatedSection
                    title="Notifications"
                    description="Configure email notifications"
                >
                    <Card>
                        <BlockStack gap="400">
                            <Checkbox
                                label="Notify on new quote"
                                checked={formData.notify_on_new_quote ?? true}
                                onChange={(val) => updateField('notify_on_new_quote', val)}
                            />
                            <Checkbox
                                label="Notify on accepted quote"
                                checked={formData.notify_on_accepted ?? true}
                                onChange={(val) => updateField('notify_on_accepted', val)}
                            />
                            <TextField
                                label="Email Subject Template"
                                value={formData.email_subject_template || 'Your Quote #{quoteNumber}'}
                                onChange={(val) => updateField('email_subject_template', val)}
                                autoComplete="off"
                            />
                            <TextField
                                label="Email Body Template"
                                value={formData.email_body_template || ''}
                                onChange={(val) => updateField('email_body_template', val)}
                                multiline={4}
                                autoComplete="off"
                            />
                        </BlockStack>
                    </Card>
                </Layout.AnnotatedSection>

                <Layout.Section>
                    <InlineStack align="end">
                        <Button variant="primary" onClick={handleSave} loading={saving}>Save Settings</Button>
                    </InlineStack>
                </Layout.Section>

                <Layout.AnnotatedSection
                    title="Button Appearance"
                    description="Customize the quote button on your storefront"
                >
                    <Card>
                        <BlockStack gap="400">
                            <TextField
                                label="Button Text"
                                value={buttonSettings.text}
                                onChange={(val) => setButtonSettings(prev => ({ ...prev, text: val }))}
                                autoComplete="off"
                            />
                            <InlineStack gap="400">
                                <TextField
                                    label="Background Color"
                                    value={buttonSettings.backgroundColor}
                                    onChange={(val) => setButtonSettings(prev => ({ ...prev, backgroundColor: val }))}
                                    autoComplete="off"
                                    placeholder="#000000"
                                />
                                <TextField
                                    label="Text Color"
                                    value={buttonSettings.textColor}
                                    onChange={(val) => setButtonSettings(prev => ({ ...prev, textColor: val }))}
                                    autoComplete="off"
                                    placeholder="#FFFFFF"
                                />
                            </InlineStack>
                            <Select
                                label="Size"
                                options={[
                                    { label: 'Small', value: 'small' },
                                    { label: 'Medium', value: 'medium' },
                                    { label: 'Large', value: 'large' },
                                ]}
                                value={buttonSettings.size}
                                onChange={(val) => setButtonSettings(prev => ({ ...prev, size: val }))}
                            />
                            <Select
                                label="Position"
                                options={[
                                    { label: 'After Add to Cart', value: 'after_atc' },
                                    { label: 'Before Add to Cart', value: 'before_atc' },
                                ]}
                                value={buttonSettings.position}
                                onChange={(val) => setButtonSettings(prev => ({ ...prev, position: val }))}
                            />
                            <Checkbox
                                label="Show on product pages"
                                checked={buttonSettings.showOnProduct}
                                onChange={(val) => setButtonSettings(prev => ({ ...prev, showOnProduct: val }))}
                            />
                            <Checkbox
                                label="Show on collection pages"
                                checked={buttonSettings.showOnCollection}
                                onChange={(val) => setButtonSettings(prev => ({ ...prev, showOnCollection: val }))}
                            />
                            <Checkbox
                                label="Show quantity selector"
                                checked={buttonSettings.showQuantitySelector}
                                onChange={(val) => setButtonSettings(prev => ({ ...prev, showQuantitySelector: val }))}
                            />
                        </BlockStack>
                    </Card>
                </Layout.AnnotatedSection>

                <Layout.AnnotatedSection
                    title="Quote Cart"
                    description="Configure the floating cart on your storefront"
                >
                    <Card>
                        <BlockStack gap="400">
                            <Checkbox
                                label="Enable floating cart"
                                checked={cartSettings.enabled}
                                onChange={(val) => setCartSettings(prev => ({ ...prev, enabled: val }))}
                            />
                            <Select
                                label="Position"
                                options={[
                                    { label: 'Bottom Right', value: 'bottom-right' },
                                    { label: 'Bottom Left', value: 'bottom-left' },
                                ]}
                                value={cartSettings.position}
                                onChange={(val) => setCartSettings(prev => ({ ...prev, position: val }))}
                            />
                            <TextField
                                label="Badge Color"
                                value={cartSettings.badgeColor}
                                onChange={(val) => setCartSettings(prev => ({ ...prev, badgeColor: val }))}
                                autoComplete="off"
                                placeholder="#FF0000"
                            />
                        </BlockStack>
                    </Card>
                </Layout.AnnotatedSection>

                <Layout.Section>
                    <InlineStack align="end">
                        <Button variant="primary" onClick={handleSaveStorefront} loading={saving}>Save Storefront Settings</Button>
                    </InlineStack>
                </Layout.Section>
            </Layout>
        </Page>
    );
}
