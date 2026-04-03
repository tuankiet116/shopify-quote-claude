import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  QPage,
  QSection,
  QBlockStack,
  QInlineStack,
  QText,
  QBadge,
  QButton,
  QBanner,
  QSpinner,
} from '@/components/polaris';
import { apiGet, apiPut } from '@/api/client';

interface QuoteItem {
  id: number;
  product_title: string;
  variant_title: string | null;
  product_handle: string;
  image_url: string | null;
  price: string | null;
  currency: string | null;
  quantity: number;
}

interface QuoteDetail {
  id: number;
  quote_number: string;
  status: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  customer_company: string | null;
  message: string | null;
  locale: string | null;
  currency: string | null;
  total_items: number;
  submitted_at: string;
  reviewed_at: string | null;
  items: QuoteItem[];
}

interface ApiResponse {
  success: boolean;
  data: QuoteDetail;
}

const STATUS_TONE: Record<string, 'info' | 'success' | 'warning' | 'critical'> = {
  pending: 'warning',
  reviewed: 'info',
  accepted: 'success',
  rejected: 'critical',
  expired: 'critical',
};

export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quote, setQuote] = useState<QuoteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [banner, setBanner] = useState<{ tone: 'success' | 'critical'; message: string } | null>(null);

  useEffect(() => {
    apiGet<ApiResponse>(`quotes/${id}`)
      .then((res) => setQuote(res.data))
      .catch(() => navigate('/quotes'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const updateStatus = useCallback(
    async (newStatus: string) => {
      setUpdating(true);
      setBanner(null);
      try {
        const res = await apiPut<ApiResponse>(`quotes/${id}/status`, { status: newStatus });
        setQuote(res.data);
        setBanner({ tone: 'success', message: `Quote marked as ${newStatus}.` });
      } catch {
        setBanner({ tone: 'critical', message: 'Failed to update status.' });
      } finally {
        setUpdating(false);
      }
    },
    [id],
  );

  if (loading || !quote) {
    return (
      <QPage title="Quote Details">
        <QSpinner />
      </QPage>
    );
  }

  return (
    <QPage title={`Quote ${quote.quote_number}`}>
      <QBlockStack gap="400">
        {banner && (
          <QBanner tone={banner.tone} dismissible onDismiss={() => setBanner(null)}>
            <p>{banner.message}</p>
          </QBanner>
        )}

        <QSection heading="Status">
          <QInlineStack gap="300">
            <QBadge tone={STATUS_TONE[quote.status] || 'info'}>{quote.status}</QBadge>
            {quote.status === 'pending' && (
              <QButton onClick={() => updateStatus('reviewed')} disabled={updating}>
                Mark Reviewed
              </QButton>
            )}
            {['pending', 'reviewed'].includes(quote.status) && (
              <>
                <QButton variant="primary" onClick={() => updateStatus('accepted')} disabled={updating}>
                  Accept
                </QButton>
                <QButton onClick={() => updateStatus('rejected')} disabled={updating}>
                  Reject
                </QButton>
              </>
            )}
          </QInlineStack>
        </QSection>

        <QSection heading="Customer">
          <QBlockStack gap="200">
            <QText fontWeight="bold">{quote.customer_name}</QText>
            <QText>{quote.customer_email}</QText>
            {quote.customer_phone && <QText>{quote.customer_phone}</QText>}
            {quote.customer_company && <QText tone="subdued">{quote.customer_company}</QText>}
            {quote.message && (
              <div style={{ padding: '8px 12px', background: '#f9fafb', borderRadius: 6, marginTop: 8 }}>
                <QText tone="subdued">{quote.message}</QText>
              </div>
            )}
          </QBlockStack>
        </QSection>

        <QSection heading={`Items (${quote.total_items})`}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                <th style={{ padding: '8px 12px' }}>Product</th>
                <th style={{ padding: '8px 12px' }}>Variant</th>
                <th style={{ padding: '8px 12px' }}>Price</th>
                <th style={{ padding: '8px 12px' }}>Qty</th>
              </tr>
            </thead>
            <tbody>
              {quote.items.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.product_title}
                          style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
                        />
                      )}
                      {item.product_title}
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px' }}>{item.variant_title || '-'}</td>
                  <td style={{ padding: '10px 12px' }}>
                    {item.price ? `${item.price} ${item.currency || ''}` : '-'}
                  </td>
                  <td style={{ padding: '10px 12px' }}>{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </QSection>

        <QSection heading="Details">
          <QBlockStack gap="200">
            <QText tone="subdued">
              Submitted: {new Date(quote.submitted_at).toLocaleString()}
            </QText>
            {quote.reviewed_at && (
              <QText tone="subdued">
                Reviewed: {new Date(quote.reviewed_at).toLocaleString()}
              </QText>
            )}
            {quote.locale && <QText tone="subdued">Locale: {quote.locale}</QText>}
            {quote.currency && <QText tone="subdued">Currency: {quote.currency}</QText>}
          </QBlockStack>
        </QSection>

        <QButton onClick={() => navigate('/quotes')}>Back to Quotes</QButton>
      </QBlockStack>
    </QPage>
  );
}
