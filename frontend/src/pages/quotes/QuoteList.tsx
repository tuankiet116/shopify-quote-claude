import { Page, Card, IndexTable, Text, Tabs, TextField, InlineStack, Pagination } from '@shopify/polaris';
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppQuery } from '../../hooks/useAppQuery';
import QuoteStatusBadge from '../../components/QuoteStatusBadge';

const STATUS_TABS = [
    { id: 'all', content: 'All' },
    { id: 'pending', content: 'Pending' },
    { id: 'sent', content: 'Sent' },
    { id: 'accepted', content: 'Accepted' },
    { id: 'converted', content: 'Converted' },
    { id: 'expired', content: 'Expired' },
];

export default function QuoteList() {
    const navigate = useNavigate();
    const [selectedTab, setSelectedTab] = useState(0);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const status = STATUS_TABS[selectedTab].id === 'all' ? '' : STATUS_TABS[selectedTab].id;
    const queryUrl = `quotes?page=${page}&per_page=20${status ? `&status=${status}` : ''}${search ? `&search=${search}` : ''}`;

    const { data, loading } = useAppQuery<any>(queryUrl);

    const handleTabChange = useCallback((index: number) => {
        setSelectedTab(index);
        setPage(1);
    }, []);

    const quotes = data?.data ?? [];
    const lastPage = data?.last_page ?? 1;

    const rowMarkup = quotes.map((quote: any, index: number) => (
        <IndexTable.Row
            id={String(quote.id)}
            key={quote.id}
            position={index}
            onClick={() => navigate(`/app/quotes/${quote.id}`)}
        >
            <IndexTable.Cell>
                <Text as="span" fontWeight="semibold">{quote.quote_number}</Text>
            </IndexTable.Cell>
            <IndexTable.Cell>{quote.customer_name}</IndexTable.Cell>
            <IndexTable.Cell>{quote.customer_email}</IndexTable.Cell>
            <IndexTable.Cell>{quote.items?.length ?? 0} items</IndexTable.Cell>
            <IndexTable.Cell>${parseFloat(quote.total_price).toFixed(2)}</IndexTable.Cell>
            <IndexTable.Cell><QuoteStatusBadge status={quote.status} /></IndexTable.Cell>
            <IndexTable.Cell>{new Date(quote.created_at).toLocaleDateString()}</IndexTable.Cell>
        </IndexTable.Row>
    ));

    return (
        <Page
            title="Quotes"
            primaryAction={{ content: 'Create Quote', onAction: () => navigate('/app/quotes/new') }}
        >
            <Card>
                <Tabs tabs={STATUS_TABS} selected={selectedTab} onSelect={handleTabChange}>
                    <div style={{ padding: '16px' }}>
                        <TextField
                            label="Search"
                            labelHidden
                            placeholder="Search by name, email, quote number..."
                            value={search}
                            onChange={setSearch}
                            autoComplete="off"
                            clearButton
                            onClearButtonClick={() => setSearch('')}
                        />
                    </div>
                    <IndexTable
                        itemCount={quotes.length}
                        headings={[
                            { title: 'Quote #' },
                            { title: 'Customer' },
                            { title: 'Email' },
                            { title: 'Items' },
                            { title: 'Total' },
                            { title: 'Status' },
                            { title: 'Date' },
                        ]}
                        selectable={false}
                        loading={loading}
                    >
                        {rowMarkup}
                    </IndexTable>
                    <div style={{ padding: '16px', display: 'flex', justifyContent: 'center' }}>
                        <Pagination
                            hasPrevious={page > 1}
                            hasNext={page < lastPage}
                            onPrevious={() => setPage(p => p - 1)}
                            onNext={() => setPage(p => p + 1)}
                        />
                    </div>
                </Tabs>
            </Card>
        </Page>
    );
}
