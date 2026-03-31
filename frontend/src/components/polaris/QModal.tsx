import type { ReactNode } from 'react';
import { Modal } from '@shopify/polaris';
import { useIsEmbedded } from '@/hooks/useIsEmbedded';

export interface QModalProps {
  readonly open: boolean;
  readonly title: string;
  readonly onClose: () => void;
  readonly primaryAction?: { readonly content: string; readonly onAction: () => void; readonly loading?: boolean };
  readonly secondaryActions?: readonly { readonly content: string; readonly onAction: () => void }[];
  readonly children: ReactNode;
}

export function QModal({ open, title, onClose, primaryAction, secondaryActions, children }: Readonly<QModalProps>) {
  const isEmbedded = useIsEmbedded();

  if (isEmbedded) {
    return (
      <s-modal heading={title} open={open || undefined}>
        {children}
        {primaryAction && (
          <s-button slot="primary-action" variant="primary" onClick={primaryAction.onAction}>
            {primaryAction.content}
          </s-button>
        )}
        {secondaryActions?.map((action) => (
          <s-button key={action.content} slot="secondary-actions" onClick={action.onAction}>
            {action.content}
          </s-button>
        ))}
      </s-modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      primaryAction={primaryAction ? {
        content: primaryAction.content,
        onAction: primaryAction.onAction,
        loading: primaryAction.loading,
      } : undefined}
      secondaryActions={secondaryActions?.map(a => ({
        content: a.content,
        onAction: a.onAction,
      }))}
    >
      <Modal.Section>
        {children}
      </Modal.Section>
    </Modal>
  );
}
