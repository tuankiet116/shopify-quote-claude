import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  QPage,
  QSection,
  QBlockStack,
  QBadge,
  QText,
  QSpinner,
  QButton,
  QSelect,
} from '@/components/polaris';
import { apiGet } from '@/api/client';

interface QuoteSummary {
  id: number;
  quote_number: string;
  customer_name: string;
  customer_email: string;
  status: string;
  total_items: number;
  submitted_at: string;
}

interface PaginatedResponse {
  success: boolean;
  data: {
    data: QuoteSummary[];
    current_page: number;
    last_page: number;
    total: number;
  };
}

const STATUS_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Reviewed', value: 'reviewed' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Expired', value: 'expired' },
];

const STATUS_TONE: Record<string, 'info' | 'success' | 'warning' | 'critical'> = {
  pending: 'warning',
  reviewed: 'info',
  accepted: 'success',
  rejected: 'critical',
  expired: 'critical',
};

export default function QuotesPage() {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<QuoteSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    params.set('page', String(page));

    apiGet<PaginatedResponse>(`quotes?${params}`)
      .then((res) => {
        setQuotes(res.data.data);
        setLastPage(res.data.last_page);
        setTotal(res.data.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status, page]);

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPage(1);
  };

  if (loading && quotes.length === 0) {
    return (
      <QPage title="Quotes">
        <QBlockStack gap="400">
          <QSpinner />
        </QBlockStack>
      </QPage>
    );
  }

  return (
    <QPage title="Quotes">
      <QBlockStack gap="400">
        <QSection>
          <QBlockStack gap="300">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <QText fontWeight="bold">{total} quote(s)</QText>
              <div style={{ width: 200 }}>
                <QSelect
                  label="Status"
                  options={STATUS_OPTIONS}
                  value={status}
                  onChange={handleStatusChange}
                />
              </div>
            </div>

            {quotes.length === 0 ? (
              <QText tone="subdued">No quotes found.</QText>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                    <th style={{ padding: '8px 12px' }}>Quote #</th>
                    <th style={{ padding: '8px 12px' }}>Customer</th>
                    <th style={{ padding: '8px 12px' }}>Email</th>
                    <th style={{ padding: '8px 12px' }}>Items</th>
                    <th style={{ padding: '8px 12px' }}>Status</th>
                    <th style={{ padding: '8px 12px' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {quotes.map((q) => (
                    <tr
                      key={q.id}
                      style={{ borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }}
                      onClick={() => navigate(`/quotes/${q.id}`)}
                    >
                      <td style={{ padding: '10px 12px', fontWeight: 600 }}>{q.quote_number}</td>
                      <td style={{ padding: '10px 12px' }}>{q.customer_name}</td>
                      <td style={{ padding: '10px 12px' }}>{q.customer_email}</td>
                      <td style={{ padding: '10px 12px' }}>{q.total_items}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <QBadge tone={STATUS_TONE[q.status] || 'info'}>{q.status}</QBadge>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        {new Date(q.submitted_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {lastPage > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                <QButton disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  Previous
                </QButton>
                <QText>
                  Page {page} of {lastPage}
                </QText>
                <QButton disabled={page >= lastPage} onClick={() => setPage(page + 1)}>
                  Next
                </QButton>
              </div>
            )}
          </QBlockStack>
        </QSection>
      </QBlockStack>
    </QPage>
  );
}
