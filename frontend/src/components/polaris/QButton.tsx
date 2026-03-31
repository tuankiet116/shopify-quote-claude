import { Button } from '@shopify/polaris';
import { useIsEmbedded } from '@/hooks/useIsEmbedded';

export interface QButtonProps {
  readonly variant?: 'primary' | 'secondary' | 'tertiary';
  readonly tone?: 'critical';
  readonly icon?: string;
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly url?: string;
  readonly onClick?: () => void;
  readonly children: string;
}

export function QButton({ variant, tone, icon, disabled, loading, url, onClick, children }: Readonly<QButtonProps>) {
  const isEmbedded = useIsEmbedded();

  if (isEmbedded) {
    return (
      <s-button
        variant={variant}
        tone={tone}
        icon={icon}
        disabled={disabled || undefined}
        loading={loading || undefined}
        href={url}
        onClick={onClick}
      >
        {children}
      </s-button>
    );
  }

  return (
    <Button
      variant={variant}
      tone={tone}
      disabled={disabled}
      loading={loading}
      url={url}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
