import { ButtonSettings, ProductData, ProductVariant } from './types';
import { QuoteCart } from './QuoteCart';
import { QuoteForm } from './QuoteForm';
import { createElement } from './utils/dom';

export class QuoteButton {
    private config: ButtonSettings;
    private cart: QuoteCart;
    private form: QuoteForm;

    constructor(config: ButtonSettings, cart: QuoteCart, form: QuoteForm) {
        this.config = config;
        this.cart = cart;
        this.form = form;
    }

    injectOnProductPage(product: ProductData): void {
        if (!this.config.showOnProduct) return;

        const productForm = document.querySelector('form[action*="/cart/add"]');
        if (!productForm) return;

        const container = document.createElement('div');
        container.className = 'quote-btn-container';

        let selectedVariantId = product.selectedVariantId;
        let quantity = 1;

        // Quantity selector
        if (this.config.showQuantitySelector) {
            const qtyWrapper = createElement('div', { className: 'quote-qty-wrapper' });
            const qtyMinus = createElement('button', { className: 'quote-qty-btn', type: 'button' }, ['-']);
            const qtyInput = createElement('input', {
                className: 'quote-qty-input',
                type: 'number',
            }) as HTMLInputElement;
            qtyInput.value = '1';
            qtyInput.min = '1';
            const qtyPlus = createElement('button', { className: 'quote-qty-btn', type: 'button' }, ['+']);

            qtyMinus.addEventListener('click', () => {
                quantity = Math.max(1, quantity - 1);
                qtyInput.value = String(quantity);
            });
            qtyPlus.addEventListener('click', () => {
                quantity++;
                qtyInput.value = String(quantity);
            });
            qtyInput.addEventListener('change', () => {
                quantity = Math.max(1, parseInt(qtyInput.value) || 1);
                qtyInput.value = String(quantity);
            });

            qtyWrapper.append(qtyMinus, qtyInput, qtyPlus);
            container.appendChild(qtyWrapper);
        }

        // Main button
        const btn = this.createButtonElement();
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const variant = product.variants.find(v => v.id === selectedVariantId) || product.variants[0];
            if (!variant) return;

            this.cart.addItem({
                productId: product.id,
                variantId: variant.id,
                title: product.title,
                variantTitle: variant.title !== 'Default Title' ? variant.title : '',
                price: variant.price,
                quantity,
                imageUrl: variant.image || product.image || '',
                sku: variant.sku || '',
            });

            // Show brief confirmation
            const originalText = btn.textContent;
            btn.textContent = 'Added to Quote!';
            btn.classList.add('quote-btn--success');
            setTimeout(() => {
                btn.textContent = originalText;
                btn.classList.remove('quote-btn--success');
            }, 1500);
        });

        container.appendChild(btn);

        // Insert based on position config
        if (this.config.position === 'before_atc') {
            productForm.insertBefore(container, productForm.querySelector('[type="submit"], button[name="add"]'));
        } else {
            const submitBtn = productForm.querySelector('[type="submit"], button[name="add"]');
            if (submitBtn?.parentNode) {
                submitBtn.parentNode.insertBefore(container, submitBtn.nextSibling);
            } else {
                productForm.appendChild(container);
            }
        }

        // Listen for variant changes
        document.addEventListener('change', (e) => {
            const target = e.target as HTMLSelectElement;
            if (target.name === 'id' || target.closest('[data-variant-select]')) {
                selectedVariantId = parseInt(target.value) || selectedVariantId;
            }
        });
    }

    injectOnCollectionPage(): void {
        if (!this.config.showOnCollection) return;

        const productCards = document.querySelectorAll('.product-card, .grid__item, [data-product-card]');
        productCards.forEach(card => {
            const link = card.querySelector('a[href*="/products/"]') as HTMLAnchorElement;
            if (!link) return;

            const handle = link.href.split('/products/')[1]?.split('?')[0]?.split('/')[0];
            if (!handle) return;

            const btn = this.createButtonElement('small');
            btn.textContent = 'Add to Quote';
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                // Redirect to product page for proper variant selection
                window.location.href = `/products/${handle}?quote=true`;
            });

            const priceEl = card.querySelector('.price, [data-product-price]');
            if (priceEl?.parentNode) {
                priceEl.parentNode.insertBefore(btn, priceEl.nextSibling);
            } else {
                card.appendChild(btn);
            }
        });
    }

    private createButtonElement(sizeOverride?: string): HTMLButtonElement {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `quote-btn quote-btn--${sizeOverride || this.config.size}`;
        btn.textContent = this.config.text || 'Request Quote';
        btn.style.backgroundColor = this.config.backgroundColor || '#000';
        btn.style.color = this.config.textColor || '#fff';
        btn.style.borderRadius = this.config.borderRadius || '4px';
        return btn;
    }
}
