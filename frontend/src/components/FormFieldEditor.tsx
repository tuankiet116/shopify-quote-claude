import { Card, BlockStack, InlineStack, TextField, Select, Checkbox, Button, Text } from '@shopify/polaris';
import { DeleteIcon, DragHandleIcon } from '@shopify/polaris-icons';

interface FormField {
    field_name: string;
    field_label: string;
    field_type: string;
    is_required: boolean;
    options: string[] | null;
}

interface FormFieldEditorProps {
    field: FormField;
    onChange: (field: FormField) => void;
    onRemove: () => void;
}

const FIELD_TYPES = [
    { label: 'Text', value: 'text' },
    { label: 'Email', value: 'email' },
    { label: 'Phone', value: 'phone' },
    { label: 'Text Area', value: 'textarea' },
    { label: 'Select', value: 'select' },
    { label: 'Number', value: 'number' },
];

export default function FormFieldEditor({ field, onChange, onRemove }: FormFieldEditorProps) {
    const updateField = (key: keyof FormField, value: any) => {
        onChange({ ...field, [key]: value });
    };

    return (
        <Card>
            <InlineStack align="space-between" blockAlign="start">
                <div style={{ flex: 1 }}>
                    <BlockStack gap="300">
                        <InlineStack gap="300">
                            <div style={{ flex: 1 }}>
                                <TextField
                                    label="Field Name"
                                    value={field.field_name}
                                    onChange={(val) => updateField('field_name', val)}
                                    autoComplete="off"
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <TextField
                                    label="Label"
                                    value={field.field_label}
                                    onChange={(val) => updateField('field_label', val)}
                                    autoComplete="off"
                                />
                            </div>
                        </InlineStack>
                        <InlineStack gap="300" blockAlign="center">
                            <div style={{ width: '200px' }}>
                                <Select
                                    label="Type"
                                    options={FIELD_TYPES}
                                    value={field.field_type}
                                    onChange={(val) => updateField('field_type', val)}
                                />
                            </div>
                            <Checkbox
                                label="Required"
                                checked={field.is_required}
                                onChange={(val) => updateField('is_required', val)}
                            />
                        </InlineStack>
                        {field.field_type === 'select' && (
                            <TextField
                                label="Options (comma separated)"
                                value={(field.options || []).join(', ')}
                                onChange={(val) => updateField('options', val.split(',').map(s => s.trim()).filter(Boolean))}
                                autoComplete="off"
                            />
                        )}
                    </BlockStack>
                </div>
                <Button icon={DeleteIcon} tone="critical" onClick={onRemove} accessibilityLabel="Remove field" />
            </InlineStack>
        </Card>
    );
}
