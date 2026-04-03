import { render } from 'preact';
import type { QuoteButtonConfig } from '../../shared/types/config';
import { Drawer } from './components/drawer';
import { FloatingButton } from './components/floating-button';

export function initQuoteDrawer(config: QuoteButtonConfig): void {
  const container = document.createElement('div');
  container.id = 'quote-app-root';
  document.body.appendChild(container);

  render(
    <>
      <Drawer config={config} />
      <FloatingButton config={config} />
    </>,
    container,
  );
}
