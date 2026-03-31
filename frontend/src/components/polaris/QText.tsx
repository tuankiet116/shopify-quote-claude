import type { ReactNode } from 'react';
import { Text } from '@shopify/polaris';
import { useIsEmbedded } from '@/hooks/useIsEmbedded';

export interface QTextProps {
  readonly as?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  readonly variant?: 'headingXl' | 'headingLg' | 'headingMd' | 'headingSm' | 'bodyLg' | 'bodyMd' | 'bodySm';
  readonly tone?: 'subdued' | 'success' | 'critical' | 'caution';
  readonly fontWeight?: 'bold' | 'semibold' | 'medium' | 'regular';
  readonly children: ReactNode;
}

type EmbeddedTone = 'info' | 'success' | 'warning' | 'critical' | 'auto' | 'neutral' | 'caution';

const toneToEmbedded: Record<string, EmbeddedTone> = {
  success: 'success',
  critical: 'critical',
  caution: 'warning',
};

export function QText({ as = 'span', variant, tone, fontWeight, children }: Readonly<QTextProps>) {
  const isEmbedded = useIsEmbedded();

  if (isEmbedded) {
    const isHeading = variant?.startsWith('heading');

    if (isHeading) {
      return <s-heading>{children}</s-heading>;
    }

    return (
      <s-text
        tone={tone && tone !== 'subdued' ? toneToEmbedded[tone] : undefined}
        color={tone === 'subdued' ? 'subdued' : undefined}
        type={fontWeight === 'bold' || fontWeight === 'semibold' ? 'strong' : undefined}
      >
        {children}
      </s-text>
    );
  }

  return (
    <Text as={as} variant={variant} tone={tone} fontWeight={fontWeight}>
      {children}
    </Text>
  );
}
