import { Page, Layout, Card, BlockStack, InlineStack, Text, IndexTable, Button } from '@shopify/polaris';
import { useNavigate } from 'react-router-dom';
import { useAppQuery } from '../hooks/useAppQuery';
import QuoteStatusBadge from '../components/QuoteStatusBadge';

interface DashboardData {
    stats: {
        total_quotes: number;
        pending: number;
        sent: number;
        accepted: number;
        converted_this_month: number;
        revenue_this_month: number;
    };
    recent_quotes: any[];
}

export default function Dashboard() {
    const { data, loading } = useAppQuery<DashboardData>('dashboard/stats');
    const navigate = useNavigate();

    const stats = data?.stats;

    const statCards = [
        { title: 'Total Quotes', value: stats?.total_quotes ?? 0 },
        { title: 'Pending', value: stats?.pending ?? 0 },
        { title: 'Sent', value: stats?.sent ?? 0 },
        { title: 'Accepted', value: stats?.accepted ?? 0 },
        { title: 'Converted This Month', value: stats?.converted_this_month ?? 0 },
        { title: 'Revenue This Month', value: `$${(stats?.revenue_this_month ?? 0).toFixed(2)}` },
    ];

    const rowMarkup = (data?.recent_quotes ?? []).map((quote: any, index: number) => (
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
            <IndexTable.Cell>{quote.items?.length ?? 0} items</IndexTable.Cell>
            <IndexTable.Cell>${parseFloat(quote.total_price).toFixed(2)}</IndexTable.Cell>
            <IndexTable.Cell><QuoteStatusBadge status={quote.status} /></IndexTable.Cell>
            <IndexTable.Cell>{new Date(quote.created_at).toLocaleDateString()}</IndexTable.Cell>
        </IndexTable.Row>
    ));

    return (
        <Page title="Dashboard">
            <Layout>
                <Layout.Section>
                    <InlineStack gap="400" wrap>
                        {statCards.map((stat) => (
                            <div key={stat.title} style={{ flex: '1 1 180px' }}>
                                <Card>
                                    <BlockStack gap="200">
                                        <Text as="p" variant="bodySm" tone="subdued">{stat.title}</Text>
                                        <Text as="p" variant="headingLg">{String(stat.value)}</Text>
                                    </BlockStack>
                                </Card>
                            </div>
                        ))}
                    </InlineStack>
                </Layout.Section>

                <Layout.Section>
                    <Card>
                        <BlockStack gap="400">
                            <InlineStack align="space-between">
                                <Text as="h2" variant="headingMd">Recent Quotes</Text>
                                <Button onClick={() => navigate('/app/quotes/new')}>Create Quote</Button>
                            </InlineStack>
                            <IndexTable
                                itemCount={data?.recent_quotes?.length ?? 0}
                                headings={[
                                    { title: 'Quote #' },
                                    { title: 'Customer' },
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
                        </BlockStack>
                    </Card>
                </Layout.Section>
            </Layout>
        </Page>
    );
}
