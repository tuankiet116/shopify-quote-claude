import { useEffect } from 'preact/hooks';
import type { QuoteButtonConfig } from '../../../shared/types/config';
import { isDrawerOpen, drawerView, closeDrawer } from '../store';
import { ItemsView } from './items-view';
import { FormView } from './form-view';
import { SuccessView } from './success-view';

interface DrawerProps {
  config: QuoteButtonConfig;
}

export function Drawer({ config }: DrawerProps) {
  const open = isDrawerOpen.value;
  const view = drawerView.value;

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Escape key closes drawer
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  if (!open) return null;

  return (
    <div class="quote-drawer-container quote-drawer-container--open"
         style={{ display: 'block', position: 'fixed', inset: 0, zIndex: 9998 }}>
      <div class="quote-drawer-overlay" onClick={() => closeDrawer()} />
      <div class="quote-drawer quote-drawer--bottom-right">
        <div class="quote-drawer-header">
          <h3>Request a Quote</h3>
          <button class="quote-drawer-close" onClick={() => closeDrawer()}>&times;</button>
        </div>
        {view === 'items' && <ItemsView />}
        {view === 'form' && <FormView config={config} />}
        {view === 'success' && <SuccessView />}
      </div>
    </div>
  );
}
