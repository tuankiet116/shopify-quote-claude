import type { QuoteItem } from '../store';
import { updateQuantity, removeItem } from '../store';

interface ItemRowProps {
  item: QuoteItem;
  index: number;
}

export function ItemRow({ item, index }: ItemRowProps) {
  const { product, quantity } = item;
  const priceText = product.price ? `${product.price} ${product.currency || ''}` : null;

  return (
    <div class="quote-drawer-item">
      {product.imageUrl && (
        <img class="quote-drawer-item-img" src={product.imageUrl} alt={product.title} />
      )}
      <div class="quote-drawer-item-info">
        <p class="quote-drawer-item-title">{product.title}</p>
        {product.variantTitle && <p class="quote-drawer-item-variant">{product.variantTitle}</p>}
        {priceText && <p class="quote-drawer-item-price">{priceText}</p>}
      </div>
      <div class="quote-qty-wrapper">
        <button class="quote-qty-btn" onClick={() => { if (quantity > 1) updateQuantity(index, quantity - 1); }}>
          &minus;
        </button>
        <input
          class="quote-qty-input" type="number" min="1" value={quantity}
          onChange={(e) => {
            const v = parseInt((e.target as HTMLInputElement).value, 10);
            if (v >= 1) updateQuantity(index, v);
          }}
        />
        <button class="quote-qty-btn" onClick={() => updateQuantity(index, quantity + 1)}>+</button>
      </div>
      <button class="quote-drawer-item-remove" onClick={() => removeItem(index)}>&times;</button>
    </div>
  );
}
