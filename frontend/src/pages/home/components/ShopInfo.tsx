import { Card, BlockStack, Text, InlineStack, Badge } from '@shopify/polaris';

interface ShopInfoProps {
  shop: string;
  isActive: boolean;
  installedAt: string | null;
  loading: boolean;
}

export default function ShopInfo({ shop, isActive, installedAt, loading }: ShopInfoProps) {
  if (loading) {
    return (
      <Card>
        <BlockStack gap="200">
          <Text as="p" tone="subdued">Loading shop information...</Text>
        </BlockStack>
      </Card>
    );
  }

  return (
    <Card>
      <BlockStack gap="300">
        <Text as="h2" variant="headingMd">Shop Information</Text>
        <InlineStack gap="200" align="start">
          <Text as="span" fontWeight="semibold">Domain:</Text>
          <Text as="span">{shop}</Text>
        </InlineStack>
        <InlineStack gap="200" align="start">
          <Text as="span" fontWeight="semibold">Status:</Text>
          <Badge tone={isActive ? 'success' : 'critical'}>
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        </InlineStack>
        {installedAt && (
          <InlineStack gap="200" align="start">
            <Text as="span" fontWeight="semibold">Installed:</Text>
            <Text as="span">{new Date(installedAt).toLocaleDateString()}</Text>
          </InlineStack>
        )}
      </BlockStack>
    </Card>
  );
}
