import { Page, Layout, Banner, Card, Text, BlockStack, Icon } from '@shopify/polaris';
import { CheckCircleIcon } from '@shopify/polaris-icons';

export default function HomePage() {
  return (
    <Page title="Claude Quote AI">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <BlockStack gap="200" align="center">
                <Icon source={CheckCircleIcon} tone="success" />
                <Text as="h2" variant="headingLg">App is running!</Text>
              </BlockStack>
              <Text as="p" tone="subdued">
                Claude Quote AI has been installed successfully. Phase 1 features coming soon.
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
