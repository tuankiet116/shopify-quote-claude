import type { ReactNode } from 'react';
import { BlockStack } from '@shopify/polaris';
import { useIsEmbedded } from '@/hooks/useIsEmbedded';

export interface QBlockStackProps {
  readonly gap?: '100' | '200' | '300' | '400' | '500' | '600' | '800';
  readonly children: ReactNode;
}

export function QBlockStack({ gap = '400', children }: Readonly<QBlockStackProps>) {
  const isEmbedded = useIsEmbedded();

  if (isEmbedded) {
    return (
      <s-stack direction="block" gap={gap}>
        {children}
      </s-stack>
    );
  }

  return (
    <BlockStack gap={gap}>
      {children}
    </BlockStack>
  );
}
