import type { QuoteButtonConfig } from '../../../shared/types/config';
import { itemCount, isDrawerOpen, openDrawer } from '../store';

interface FloatingButtonProps {
  config: QuoteButtonConfig;
}

export function FloatingButton({ config }: FloatingButtonProps) {
  const count = itemCount.value;
  const open = isDrawerOpen.value;

  if (count === 0 || open) return null;

  const { appearance } = config;

  return (
    <button
      class="quote-floating-btn quote-floating-btn--bottom-right"
      style={{ backgroundColor: appearance.bg_color, color: appearance.text_color }}
      onClick={() => openDrawer()}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 5H2v16h20V5h-7M9 5a3 3 0 0 1 6 0M9 5v4m6-4v4" />
      </svg>
      <span class="quote-floating-badge" style={{ display: 'flex', backgroundColor: appearance.bg_color }}>
        {count}
      </span>
    </button>
  );
}
