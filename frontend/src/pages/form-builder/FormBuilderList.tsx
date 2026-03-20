import { Page, Card, IndexTable, Text, Button, Badge } from '@shopify/polaris';
import { useNavigate } from 'react-router-dom';
import { useAppQuery } from '../../hooks/useAppQuery';
import { apiPost } from '../../api/client';
import { useState, useCallback } from 'react';

export default function FormBuilderList() {
    const navigate = useNavigate();
    const { data: configs, loading, refetch } = useAppQuery<any[]>('form-configs');

    const handleCreate = useCallback(async () => {
        try {
            const config = await apiPost('form-configs', {
                name: 'New Quote Form',
                is_default: false,
                is_active: true,
                fields: [
                    { field_name: 'customer_name', field_label: 'Full Name', field_type: 'text', is_required: true },
                    { field_name: 'customer_email', field_label: 'Email', field_type: 'email', is_required: true },
                    { field_name: 'customer_phone', field_label: 'Phone', field_type: 'phone', is_required: false },
                    { field_name: 'notes', field_label: 'Additional Notes', field_type: 'textarea', is_required: false },
                ],
            });
            navigate(`/app/form-builder/${config.id}`);
        } catch (e) {
            console.error(e);
        }
    }, [navigate]);

    const rowMarkup = (configs ?? []).map((config: any, index: number) => (
        <IndexTable.Row
            id={String(config.id)}
            key={config.id}
            position={index}
            onClick={() => navigate(`/app/form-builder/${config.id}`)}
        >
            <IndexTable.Cell>
                <Text as="span" fontWeight="semibold">{config.name}</Text>
            </IndexTable.Cell>
            <IndexTable.Cell>{config.fields?.length ?? 0} fields</IndexTable.Cell>
            <IndexTable.Cell>
                {config.is_default && <Badge tone="info">Default</Badge>}
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Badge tone={config.is_active ? 'success' : undefined}>
                    {config.is_active ? 'Active' : 'Inactive'}
                </Badge>
            </IndexTable.Cell>
        </IndexTable.Row>
    ));

    return (
        <Page
            title="Form Builder"
            primaryAction={{ content: 'Create Form', onAction: handleCreate }}
        >
            <Card>
                <IndexTable
                    itemCount={configs?.length ?? 0}
                    headings={[
                        { title: 'Name' },
                        { title: 'Fields' },
                        { title: 'Default' },
                        { title: 'Status' },
                    ]}
                    selectable={false}
                    loading={loading}
                >
                    {rowMarkup}
                </IndexTable>
            </Card>
        </Page>
    );
}
