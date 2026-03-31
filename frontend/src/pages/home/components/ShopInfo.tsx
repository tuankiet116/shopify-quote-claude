import {
  QSection,
  QBlockStack,
  QInlineStack,
  QText,
  QBadge,
  QSpinner,
} from '@/components/polaris';

interface ShopInfoProps {
  readonly shop: string;
  readonly isActive: boolean;
  readonly installedAt: string | null;
  readonly loading: boolean;
}

export default function ShopInfo({ shop, isActive, installedAt, loading }: Readonly<ShopInfoProps>) {
  if (loading) {
    return (
      <QSection>
        <QBlockStack gap="200">
          <QSpinner size="small" />
          <QText as="p" tone="subdued">Loading shop information...</QText>
        </QBlockStack>
      </QSection>
    );
  }

  return (
    <QSection heading="Shop Information">
      <QBlockStack gap="300">
        <QInlineStack gap="200">
          <QText fontWeight="semibold">Domain:</QText>
          <QText>{shop}</QText>
        </QInlineStack>
        <QInlineStack gap="200">
          <QText fontWeight="semibold">Status:</QText>
          <QBadge tone={isActive ? 'success' : 'critical'}>
            {isActive ? 'Active' : 'Inactive'}
          </QBadge>
        </QInlineStack>
        {installedAt && (
          <QInlineStack gap="200">
            <QText fontWeight="semibold">Installed:</QText>
            <QText>{new Date(installedAt).toLocaleDateString()}</QText>
          </QInlineStack>
        )}
      </QBlockStack>
    </QSection>
  );
}
