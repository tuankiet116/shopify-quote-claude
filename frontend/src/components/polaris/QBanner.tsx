import type { ReactNode } from 'react';
import { Banner } from '@shopify/polaris';
import { useIsEmbedded } from '@/hooks/useIsEmbedded';

export interface QBannerProps {
  readonly title?: string;
  readonly tone?: 'info' | 'success' | 'warning' | 'critical';
  readonly dismissible?: boolean;
  readonly onDismiss?: () => void;
  readonly children: ReactNode;
}

export function QBanner({ title, tone = 'info', dismissible, onDismiss, children }: Readonly<QBannerProps>) {
  const isEmbedded = useIsEmbedded();

  if (isEmbedded) {
    return (
      <s-banner
        heading={title}
        tone={tone}
        dismissible={dismissible || undefined}
      >
        {children}
      </s-banner>
    );
  }

  return (
    <Banner
      title={title}
      tone={tone}
      onDismiss={dismissible ? onDismiss : undefined}
    >
      {children}
    </Banner>
  );
}
