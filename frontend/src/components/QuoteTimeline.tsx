import { Card, BlockStack, InlineStack, Text, Box } from '@shopify/polaris';

interface Activity {
    id: number;
    action: string;
    details: Record<string, any> | null;
    actor: string;
    created_at: string;
}

interface QuoteTimelineProps {
    activities: Activity[];
}

function formatAction(action: string, details: Record<string, any> | null): string {
    switch (action) {
        case 'created':
            return `Quote created from ${details?.source || 'unknown'}`;
        case 'status_changed':
            return `Status changed from ${details?.from} to ${details?.to}`;
        case 'email_sent':
            return 'Invoice email sent';
        case 'note_added':
            return 'Note added';
        case 'reminder_sent':
            return 'Reminder sent';
        case 'price_changed':
            return 'Prices updated';
        default:
            return action;
    }
}

function formatActor(actor: string): string {
    switch (actor) {
        case 'buyer': return 'Customer';
        case 'merchant': return 'You';
        case 'system': return 'System';
        default: return actor;
    }
}

export default function QuoteTimeline({ activities }: QuoteTimelineProps) {
    return (
        <Card>
            <BlockStack gap="400">
                <Text as="h2" variant="headingSm">Timeline</Text>
                {activities.map((activity) => (
                    <Box key={activity.id} paddingBlockEnd="200" borderBlockEndWidth="025" borderColor="border">
                        <BlockStack gap="100">
                            <Text as="p" variant="bodySm" fontWeight="semibold">
                                {formatAction(activity.action, activity.details)}
                            </Text>
                            <InlineStack gap="200">
                                <Text as="span" variant="bodySm" tone="subdued">
                                    {formatActor(activity.actor)}
                                </Text>
                                <Text as="span" variant="bodySm" tone="subdued">
                                    {new Date(activity.created_at).toLocaleString()}
                                </Text>
                            </InlineStack>
                        </BlockStack>
                    </Box>
                ))}
                {activities.length === 0 && (
                    <Text as="p" tone="subdued">No activity yet</Text>
                )}
            </BlockStack>
        </Card>
    );
}
