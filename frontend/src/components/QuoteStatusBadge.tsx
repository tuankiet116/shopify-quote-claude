import { Badge } from '@shopify/polaris';

const STATUS_MAP: Record<string, { tone: any; label: string }> = {
    pending: { tone: 'attention', label: 'Pending' },
    reviewed: { tone: 'info', label: 'Reviewed' },
    sent: { tone: 'info', label: 'Sent' },
    accepted: { tone: 'success', label: 'Accepted' },
    rejected: { tone: 'critical', label: 'Rejected' },
    converted: { tone: 'success', label: 'Converted' },
    expired: { tone: 'critical', label: 'Expired' },
    cancelled: { tone: 'critical', label: 'Cancelled' },
};

interface QuoteStatusBadgeProps {
    status: string;
}

export default function QuoteStatusBadge({ status }: QuoteStatusBadgeProps) {
    const config = STATUS_MAP[status] || { tone: undefined, label: status };
    return <Badge tone={config.tone}>{config.label}</Badge>;
}
