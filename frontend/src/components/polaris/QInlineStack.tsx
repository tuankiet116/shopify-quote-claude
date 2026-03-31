import type { ReactNode } from 'react';
import { InlineStack } from '@shopify/polaris';
import { useIsEmbedded } from '@/hooks/useIsEmbedded';

export interface QInlineStackProps {
  readonly gap?: '100' | '200' | '300' | '400' | '500' | '600' | '800';
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
        gap={gap}
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
