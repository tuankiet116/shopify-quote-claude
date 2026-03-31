import type { ReactNode } from 'react';
import { Page, Layout } from '@shopify/polaris';
import { useIsEmbedded } from '@/hooks/useIsEmbedded';

interface QPageAction {
  readonly content: string;
  readonly onAction?: () => void;
  readonly url?: string;
}

export interface QPageProps {
  readonly title: string;
  readonly primaryAction?: QPageAction;
  readonly secondaryActions?: readonly QPageAction[];
  readonly backAction?: { readonly url: string };
  readonly children: ReactNode;
}

export function QPage({ title, primaryAction, secondaryActions, backAction, children }: Readonly<QPageProps>) {
  const isEmbedded = useIsEmbedded();

  if (isEmbedded) {
    return (
      <s-page heading={title}>
        {backAction && (
          <s-link slot="breadcrumb-actions" href={backAction.url}>Back</s-link>
        )}
        {primaryAction && (
          <s-button
            slot="primary-action"
            variant="primary"
            onClick={primaryAction.onAction}
            href={primaryAction.url}
          >
            {primaryAction.content}
          </s-button>
        )}
        {secondaryActions?.map((action) => (
          <s-button
            key={action.content}
            slot="secondary-actions"
            variant="secondary"
            onClick={action.onAction}
            href={action.url}
          >
            {action.content}
          </s-button>
        ))}
        {children}
      </s-page>
    );
  }

  return (
    <Page
      title={title}
      primaryAction={primaryAction ? {
        content: primaryAction.content,
        onAction: primaryAction.onAction,
        url: primaryAction.url,
      } : undefined}
      secondaryActions={secondaryActions?.map(a => ({
        content: a.content,
        onAction: a.onAction,
        url: a.url,
      }))}
      backAction={backAction ? { url: backAction.url } : undefined}
    >
      <Layout>
        <Layout.Section>
          {children}
        </Layout.Section>
      </Layout>
    </Page>
  );
}
