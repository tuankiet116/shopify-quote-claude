import type { ButtonAppearance } from '@/types/settings';

interface ButtonPreviewProps {
  readonly appearance: ButtonAppearance;
  readonly isEnabled: boolean;
}

const SIZE_STYLES: Record<string, { padding: string; fontSize: string }> = {
  small: { padding: '6px 12px', fontSize: '12px' },
  medium: { padding: '10px 20px', fontSize: '14px' },
  large: { padding: '14px 28px', fontSize: '16px' },
};

export function ButtonPreview({ appearance, isEnabled }: ButtonPreviewProps) {
  const sizeStyle = SIZE_STYLES[appearance.size] ?? SIZE_STYLES.medium;

  const buttonStyle: React.CSSProperties = {
    backgroundColor: appearance.bg_color,
    color: appearance.text_color,
    borderRadius: `${appearance.border_radius}px`,
    borderWidth: `${appearance.border_width}px`,
    borderColor: appearance.border_color,
    borderStyle: appearance.border_width > 0 ? 'solid' : 'none',
    padding: sizeStyle.padding,
    fontSize: sizeStyle.fontSize,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    lineHeight: '1.4',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    transition: 'opacity 0.2s',
  };

  return (
    <div data-testid="preview-container" style={containerStyle}>
      <div style={headerStyle}>Preview</div>

      {!isEnabled ? (
        <div style={disabledStyle}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          </svg>
          <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>
            Quote button is currently <strong>disabled</strong>
          </p>
        </div>
      ) : (
        <>
          {/* Product page mock */}
          <div style={sectionStyle}>
            <div style={labelStyle}>Product page</div>
            <div style={productMockStyle}>
              <div style={productImageStyle}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="m21 15-5-5L5 21" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Product Title</div>
                <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 12 }}>$49.99</div>
                <button style={addToCartStyle}>Add to cart</button>
                <div style={{ marginTop: 8 }}>
                  <button
                    data-testid="button-preview"
                    className={`preview-btn--${appearance.size}`}
                    style={buttonStyle}
                  >
                    {appearance.button_text}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div style={dividerStyle} />

          {/* Collection page mock */}
          <div style={sectionStyle}>
            <div style={labelStyle}>Collection page</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[1, 2].map((i) => (
                <div key={i} style={cardStyle}>
                  <div style={cardImageStyle} />
                  <div style={{ padding: '8px 10px 10px' }}>
                    <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 2 }}>Product {i}</div>
                    <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6 }}>$29.99</div>
                    <button style={{ ...buttonStyle, ...SIZE_STYLES.small, width: '100%' }}>
                      {appearance.button_text}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  background: '#ffffff',
  borderRadius: 12,
  border: '1px solid #e3e3e3',
  overflow: 'hidden',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
};

const headerStyle: React.CSSProperties = {
  padding: '12px 16px',
  fontSize: 13,
  fontWeight: 600,
  color: '#303030',
  borderBottom: '1px solid #e3e3e3',
  background: '#f7f7f7',
};

const disabledStyle: React.CSSProperties = {
  padding: '40px 20px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 12,
};

const sectionStyle: React.CSSProperties = {
  padding: '14px 16px',
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: '#6d7175',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  marginBottom: 10,
};

const dividerStyle: React.CSSProperties = {
  height: 1,
  background: '#f1f1f1',
  margin: '0 16px',
};

const productMockStyle: React.CSSProperties = {
  display: 'flex',
  gap: 14,
  background: '#fafafa',
  padding: 12,
  borderRadius: 8,
  border: '1px solid #ebebeb',
};

const productImageStyle: React.CSSProperties = {
  width: 80,
  height: 80,
  background: '#f0f0f0',
  borderRadius: 6,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const addToCartStyle: React.CSSProperties = {
  padding: '8px 16px',
  background: '#1a1a1a',
  color: 'white',
  border: 'none',
  borderRadius: 6,
  fontWeight: 600,
  fontSize: 13,
  cursor: 'default',
  opacity: 0.5,
  width: '100%',
};

const cardStyle: React.CSSProperties = {
  background: '#fafafa',
  borderRadius: 8,
  border: '1px solid #ebebeb',
  overflow: 'hidden',
};

const cardImageStyle: React.CSSProperties = {
  width: '100%',
  height: 60,
  background: 'linear-gradient(135deg, #f0f0f0 0%, #e8e8e8 100%)',
};
