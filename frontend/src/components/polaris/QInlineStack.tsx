import type { ReactNode } from 'react';
import { InlineStack } from '@shopify/polaris';
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

export interface QInlineStackProps {
  readonly gap?: PolarisGap;
  readonly align?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
  readonly blockAlign?: 'start' | 'center' | 'end' | 'baseline' | 'stretch';
  readonly wrap?: boolean;
  readonly children: ReactNode;
}

export function QInlineStack({ gap = '400', align, blockAlign, wrap = true, children }: Readonly<QInlineStackProps>) {
  const isEmbedded = useIsEmbedded();

  if (isEmbedded) {
    return (
      <s-stack
        direction="inline"
        gap={gapMap[gap]}
        justifyContent={align}
        alignItems={blockAlign}
      >
        {children}
      </s-stack>
    );
  }

  return (
    <InlineStack gap={gap} align={align} blockAlign={blockAlign} wrap={wrap}>
      {children}
    </InlineStack>
  );
}
