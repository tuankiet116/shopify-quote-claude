import {
  QPage,
  QSection,
  QBanner,
  QText,
  QBlockStack,
  QInlineStack,
  QIcon,
  QButton,
} from '@/components/polaris';
import {
  OrderIcon,
  EmailIcon,
  CheckCircleIcon,
} from '@shopify/polaris-icons';

export default function HomePage() {
  const handleGetStarted = () => {
    // Will navigate to setup/onboarding flow once implemented
  };

  return (
    <QPage title="Claude Quote AI">
      <QBlockStack gap="400">
        <QBanner tone="info">
          <p>Welcome! Let's set up your quote request system in a few simple steps.</p>
        </QBanner>

        <QSection heading="What this app does">
          <QBlockStack gap="200">
            <QInlineStack gap="200" blockAlign="center">
              <QIcon source={OrderIcon} name="order" />
              <QText>Customers request quotes directly from your store</QText>
            </QInlineStack>
            <QInlineStack gap="200" blockAlign="center">
              <QIcon source={EmailIcon} name="email" />
              <QText>You receive and manage all quote requests in one place</QText>
            </QInlineStack>
            <QInlineStack gap="200" blockAlign="center">
              <QIcon source={CheckCircleIcon} name="check-circle" />
              <QText>Send professional quotes and convert them to orders</QText>
            </QInlineStack>
          </QBlockStack>
        </QSection>

        <QSection heading="Get started">
          <QBlockStack gap="300">
            <QText as="p" tone="subdued">
              Set up your quote form and start receiving requests from customers.
            </QText>
            <QButton variant="primary" onClick={handleGetStarted}>
              Start setup
            </QButton>
          </QBlockStack>
        </QSection>
      </QBlockStack>
    </QPage>
  );
}
