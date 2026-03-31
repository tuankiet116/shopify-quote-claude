import type { ReactNode } from 'react';
import { BlockStack } from '@shopify/polaris';
import { useIsEmbedded } from '@/hooks/useIsEmbedded';

type PolarisGap = '100' | '200' | '300' | '400' | '500' | '600' | '800';

const gapMap: Record<PolarisGap, string> = {
  '100': 'small',
  '200': 'small-100',
  '300': 'base',
  '400': 'large',
  '500': 'large-100',
  '600': 'large-100',
  '800': 'large-100',
};

export interface QBlockStackProps {
  readonly gap?: PolarisGap;
  readonly children: ReactNode;
}

export function QBlockStack({ gap = '400', children }: Readonly<QBlockStackProps>) {
  const isEmbedded = useIsEmbedded();

  if (isEmbedded) {
    return (
      <s-stack direction="block" gap={gapMap[gap]}>
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
