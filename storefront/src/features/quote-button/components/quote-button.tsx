import type { QuoteButtonConfig } from '../../../shared/types/config';

const VALID_SIZES = ['small', 'medium', 'large'];
const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

function sanitize(value: string, fallback: string): string {
  return HEX_RE.test(value) ? value : fallback;
}

interface QuoteButtonProps {
  config: QuoteButtonConfig;
  onClick: () => void;
}

export function QuoteButton({ config, onClick }: QuoteButtonProps) {
  const { appearance } = config;
  const size = VALID_SIZES.includes(appearance.size) ? appearance.size : 'medium';
  const bgColor = sanitize(appearance.bg_color, '#000000');
  const textColor = sanitize(appearance.text_color, '#ffffff');
  const borderColor = sanitize(appearance.border_color, '#000000');
  const borderRadius = Math.max(0, Math.min(100, appearance.border_radius || 0));
  const borderWidth = Math.max(0, Math.min(10, appearance.border_width || 0));

  return (
    <div class="quote-btn-container" style={{ position: 'relative', zIndex: 1, pointerEvents: 'auto' }}>
      <button
        class={`quote-btn quote-btn--${size}`}
        data-quote-button
        style={{
          backgroundColor: bgColor,
          color: textColor,
          borderRadius: `${borderRadius}px`,
          borderWidth: `${borderWidth}px`,
          borderColor,
          borderStyle: borderWidth > 0 ? 'solid' : 'none',
        }}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick(); }}
      >
        {appearance.button_text}
      </button>
    </div>
  );
}
