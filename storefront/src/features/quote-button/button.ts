import type { QuoteButtonConfig } from './config';

const VALID_SIZES = ['small', 'medium', 'large'];
const HEX_COLOR_RE = /^#[0-9A-Fa-f]{6}$/;

function sanitizeColor(value: string, fallback: string): string {
  return HEX_COLOR_RE.test(value) ? value : fallback;
}

function sanitizeSize(value: string): string {
  return VALID_SIZES.includes(value) ? value : 'medium';
}

function sanitizeNumber(value: number, min: number, max: number): number {
  const n = Number(value);
  if (isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}

/** Create a quote button DOM element with styles from config */
export function createQuoteButton(config: QuoteButtonConfig): HTMLButtonElement {
  const { appearance } = config;
  const btn = document.createElement('button');

  const size = sanitizeSize(appearance.size);
  const bgColor = sanitizeColor(appearance.bg_color, '#000000');
  const textColor = sanitizeColor(appearance.text_color, '#ffffff');
  const borderColor = sanitizeColor(appearance.border_color, '#000000');
  const borderRadius = sanitizeNumber(appearance.border_radius, 0, 100);
  const borderWidth = sanitizeNumber(appearance.border_width, 0, 10);

  btn.className = `quote-btn quote-btn--${size}`;
  btn.textContent = appearance.button_text;
  btn.setAttribute('data-quote-button', '');

  // Apply inline styles from sanitized settings
  btn.style.backgroundColor = bgColor;
  btn.style.color = textColor;
  btn.style.borderRadius = `${borderRadius}px`;
  btn.style.borderWidth = `${borderWidth}px`;
  btn.style.borderColor = borderColor;
  btn.style.borderStyle = borderWidth > 0 ? 'solid' : 'none';

  // Click handler — placeholder for future quote drawer/modal
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Open quote drawer/modal in future phase
  });

  return btn;
}

/** Create a container div wrapping a quote button */
export function createQuoteButtonContainer(config: QuoteButtonConfig): HTMLDivElement {
  const container = document.createElement('div');
  container.className = 'quote-btn-container';
  container.appendChild(createQuoteButton(config));
  return container;
}
