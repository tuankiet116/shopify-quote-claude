import { quoteItems, itemCount, setView, closeDrawer } from '../store';
import { ItemRow } from './item-row';

export function ItemsView() {
  const items = quoteItems.value;

  return (
    <>
      <div class="quote-drawer-items">
        {items.length === 0 ? (
          <div class="quote-drawer-empty">No items added yet.</div>
        ) : (
          items.map((item, i) => (
            <ItemRow key={`${item.product.productId}-${item.product.variantId}`} item={item} index={i} />
          ))
        )}
      </div>
      <div class="quote-drawer-footer">
        <div class="quote-drawer-subtotal">{itemCount.value} item(s)</div>
        {itemCount.value > 0 && (
          <button class="quote-btn quote-btn--medium quote-drawer-submit" onClick={() => setView('form')}>
            Continue to Quote
          </button>
        )}
        <button class="quote-drawer-continue" onClick={() => closeDrawer()}>Continue Shopping</button>
      </div>
    </>
  );
}
