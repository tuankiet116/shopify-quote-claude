import type { ReactNode } from 'react';
import { Card, Text, BlockStack } from '@shopify/polaris';
import { useIsEmbedded } from '@/hooks/useIsEmbedded';

export interface QSectionProps {
  readonly heading?: string;
  readonly children: ReactNode;
}

/**
 * Maps to <s-section> (embedded) / <Card> (standalone).
 * Use for grouping content with an optional heading.
 */
export function QSection({ heading, children }: Readonly<QSectionProps>) {
  const isEmbedded = useIsEmbedded();

  if (isEmbedded) {
    return (
      <s-section heading={heading}>
        {children}
      </s-section>
    );
  }

  return (
    <Card>
      {heading ? (
        <BlockStack gap="300">
          <Text as="h2" variant="headingMd">{heading}</Text>
          {children}
        </BlockStack>
      ) : (
        children
      )}
    </Card>
  );
}
