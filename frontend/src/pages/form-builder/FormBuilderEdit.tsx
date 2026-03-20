import { Page, Layout, Card, BlockStack, TextField, Checkbox, Button, Banner, InlineStack, Text } from '@shopify/polaris';
import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppQuery } from '../../hooks/useAppQuery';
import { apiPut, apiPost, apiDelete } from '../../api/client';
import FormFieldEditor from '../../components/FormFieldEditor';

interface FormField {
    field_name: string;
    field_label: string;
    field_type: string;
    is_required: boolean;
    options: string[] | null;
}

export default function FormBuilderEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: config, loading } = useAppQuery<any>(`form-configs/${id}`);

    const [name, setName] = useState('');
    const [isDefault, setIsDefault] = useState(false);
    const [isActive, setIsActive] = useState(true);
    const [fields, setFields] = useState<FormField[]>([]);
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (config) {
            setName(config.name);
            setIsDefault(config.is_default);
            setIsActive(config.is_active);
            setFields(config.fields?.map((f: any) => ({
                field_name: f.field_name,
                field_label: f.field_label,
                field_type: f.field_type,
                is_required: f.is_required,
                options: f.options,
            })) || []);
        }
    }, [config]);

    const handleSave = useCallback(async () => {
        setSaving(true);
        setError('');
        try {
            await apiPut(`form-configs/${id}`, {
                name,
                is_default: isDefault,
                is_active: isActive,
                fields: fields.map((f, i) => ({ ...f, sort_order: i })),
            });
            setSuccess('Form saved successfully');
            setTimeout(() => setSuccess(''), 3000);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    }, [id, name, isDefault, isActive, fields]);

    const handlePublish = useCallback(async () => {
        setPublishing(true);
        setError('');
        try {
            await apiPost(`form-configs/${id}/publish`);
            setSuccess('Form published to storefront');
            setTimeout(() => setSuccess(''), 3000);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setPublishing(false);
        }
    }, [id]);

    const handleDelete = useCallback(async () => {
        try {
            await apiDelete(`form-configs/${id}`);
            navigate('/app/form-builder');
        } catch (e: any) {
            setError(e.message);
        }
    }, [id, navigate]);

    const addField = () => {
        setFields(prev => [...prev, {
            field_name: `field_${prev.length + 1}`,
            field_label: 'New Field',
            field_type: 'text',
            is_required: false,
            options: null,
        }]);
    };

    const updateField = (index: number, field: FormField) => {
        setFields(prev => prev.map((f, i) => i === index ? field : f));
    };

    const removeField = (index: number) => {
        setFields(prev => prev.filter((_, i) => i !== index));
    };

    if (loading) {
        return <Page title="Loading..." backAction={{ onAction: () => navigate('/app/form-builder') }} />;
    }

    return (
        <Page
            title={name || 'Edit Form'}
            backAction={{ onAction: () => navigate('/app/form-builder') }}
            primaryAction={{ content: 'Save', onAction: handleSave, loading: saving }}
            secondaryActions={[
                { content: 'Publish to Storefront', onAction: handlePublish, loading: publishing },
                { content: 'Delete', onAction: handleDelete, destructive: true },
            ]}
        >
            {success && <Banner tone="success" onDismiss={() => setSuccess('')}>{success}</Banner>}
            {error && <Banner tone="critical" onDismiss={() => setError('')}>{error}</Banner>}

            <Layout>
                <Layout.Section>
                    <BlockStack gap="400">
                        <Card>
                            <BlockStack gap="400">
                                <TextField label="Form Name" value={name} onChange={setName} autoComplete="off" />
                                <InlineStack gap="400">
                                    <Checkbox label="Default form" checked={isDefault} onChange={setIsDefault} />
                                    <Checkbox label="Active" checked={isActive} onChange={setIsActive} />
                                </InlineStack>
                            </BlockStack>
                        </Card>

                        <InlineStack align="space-between">
                            <Text as="h2" variant="headingMd">Form Fields</Text>
                            <Button onClick={addField}>Add Field</Button>
                        </InlineStack>

                        {fields.map((field, index) => (
                            <FormFieldEditor
                                key={index}
                                field={field}
                                onChange={(f) => updateField(index, f)}
                                onRemove={() => removeField(index)}
                            />
                        ))}
                    </BlockStack>
                </Layout.Section>

                <Layout.Section variant="oneThird">
                    <Card>
                        <BlockStack gap="300">
                            <Text as="h2" variant="headingSm">Preview</Text>
                            <div style={{ padding: '16px', border: '1px solid #e1e3e5', borderRadius: '8px' }}>
                                <h3 style={{ marginBottom: '8px' }}>Request a Quote</h3>
                                {fields.map((field, i) => (
                                    <div key={i} style={{ marginBottom: '12px' }}>
                                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                                            {field.field_label} {field.is_required && <span style={{ color: 'red' }}>*</span>}
                                        </label>
                                        {field.field_type === 'textarea' ? (
                                            <textarea disabled style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} rows={3} />
                                        ) : field.field_type === 'select' ? (
                                            <select disabled style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
                                                <option>Select...</option>
                                                {(field.options || []).map(opt => <option key={opt}>{opt}</option>)}
                                            </select>
                                        ) : (
                                            <input disabled type={field.field_type} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                                        )}
                                    </div>
                                ))}
                                <button disabled style={{ padding: '10px 20px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '4px', width: '100%' }}>
                                    Submit Quote
                                </button>
                            </div>
                        </BlockStack>
                    </Card>
                </Layout.Section>
            </Layout>
        </Page>
    );
}
