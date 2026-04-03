import { useState, useEffect, useCallback } from 'react';
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
import { apiGet, apiPost } from '@/api/client';

interface TokenStatus {
  has_token: boolean;
  token_preview: string | null;
}

interface TokenResponse {
  success: boolean;
  data: TokenStatus;
}

export default function HomePage() {
  const [tokenStatus, setTokenStatus] = useState<TokenStatus | null>(null);
  const [tokenLoading, setTokenLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [tokenBanner, setTokenBanner] = useState<{ tone: 'success' | 'critical'; message: string } | null>(null);

  useEffect(() => {
    apiGet<TokenResponse>('storefront-token')
      .then((res) => setTokenStatus(res.data))
      .catch(() => {})
      .finally(() => setTokenLoading(false));
  }, []);

  const handleRegenerate = useCallback(async () => {
    setRegenerating(true);
    setTokenBanner(null);
    try {
      const res = await apiPost<TokenResponse>('storefront-token/regenerate');
      setTokenStatus(res.data);
      setTokenBanner({ tone: 'success', message: 'Storefront access token created successfully. Product data on collection pages will now load with full currency support.' });
    } catch {
      setTokenBanner({ tone: 'critical', message: 'Failed to create storefront token. Please try again.' });
    } finally {
      setRegenerating(false);
    }
  }, []);

  return (
    <QPage title="Claude Quote AI">
      <QBlockStack gap="400">
        {/* Storefront Token Banner */}
        {!tokenLoading && (
          <QBanner
            tone={tokenStatus?.has_token ? 'success' : 'warning'}
            dismissible={false}
          >
            <QBlockStack gap="200">
              {tokenStatus?.has_token ? (
                <>
                  <QText fontWeight="bold">Storefront API connected</QText>
                  <QText>
                    Token active ({tokenStatus.token_preview}). Product data on collection pages loads via Storefront API with full multi-currency support.
                  </QText>
                </>
              ) : (
                <>
                  <QText fontWeight="bold">Storefront API token required</QText>
                  <QText>
                    Generate a token to enable product data loading on collection and search pages. Without it, product info may be limited.
                  </QText>
                </>
              )}
              <QInlineStack gap="200">
                <QButton
                  onClick={handleRegenerate}
                  variant={tokenStatus?.has_token ? undefined : 'primary'}
                  disabled={regenerating}
                >
                  {regenerating
                    ? 'Generating...'
                    : tokenStatus?.has_token
                      ? 'Regenerate token'
                      : 'Generate token'}
                </QButton>
              </QInlineStack>
            </QBlockStack>
          </QBanner>
        )}

        {tokenBanner && (
          <QBanner
            tone={tokenBanner.tone}
            dismissible
            onDismiss={() => setTokenBanner(null)}
          >
            <p>{tokenBanner.message}</p>
          </QBanner>
        )}

        <QBanner tone="info">
          <p>Welcome! Let's set up your quote request system in a few simple steps.</p>
        </QBanner>

        <QSection heading="What this app does">
          <QBlockStack gap="200">
            <QInlineStack gap="200" blockAlign="center" align="start">
              <QIcon source={OrderIcon} name="order" />
              <QText>Customers request quotes directly from your store</QText>
            </QInlineStack>
            <QInlineStack gap="200" blockAlign="center" align="start">
              <QIcon source={EmailIcon} name="email" />
              <QText>You receive and manage all quote requests in one place</QText>
            </QInlineStack>
            <QInlineStack gap="200" blockAlign="center" align="start">
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
            <QInlineStack>
              <QButton variant="primary" onClick={() => {}}>
                Start setup
              </QButton>
            </QInlineStack>
          </QBlockStack>
        </QSection>
      </QBlockStack>
    </QPage>
  );
}
