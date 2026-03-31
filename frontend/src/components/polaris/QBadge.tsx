import { Badge } from '@shopify/polaris';
import { useIsEmbedded } from '@/hooks/useIsEmbedded';

export interface QBadgeProps {
  readonly tone?: 'info' | 'success' | 'warning' | 'critical';
  readonly children: string;
}

export function QBadge({ tone, children }: Readonly<QBadgeProps>) {
  const isEmbedded = useIsEmbedded();

  if (isEmbedded) {
    return <s-badge tone={tone}>{children}</s-badge>;
  }

  return <Badge tone={tone}>{children}</Badge>;
}
