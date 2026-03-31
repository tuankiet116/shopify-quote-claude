import { Icon, type IconSource } from '@shopify/polaris';
import { useIsEmbedded } from '@/hooks/useIsEmbedded';

export interface QIconProps {
  /** Polaris React icon component (e.g. OrderIcon from @shopify/polaris-icons) */
  readonly source: IconSource;
  /** Web component icon name (e.g. "order") — used when embedded */
  readonly name: string;
  readonly tone?: 'info' | 'success' | 'warning' | 'critical';
}

export function QIcon({ source, name, tone }: Readonly<QIconProps>) {
  const isEmbedded = useIsEmbedded();

  if (isEmbedded) {
    return <s-icon type={name} tone={tone} />;
  }

  return <Icon source={source} tone={tone} />;
}
