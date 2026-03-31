import { Spinner } from '@shopify/polaris';
import { useIsEmbedded } from '@/hooks/useIsEmbedded';

export interface QSpinnerProps {
  readonly size?: 'small' | 'large';
}

export function QSpinner({ size = 'large' }: Readonly<QSpinnerProps>) {
  const isEmbedded = useIsEmbedded();

  if (isEmbedded) {
    return <s-spinner />;
  }

  return <Spinner size={size} />;
}
