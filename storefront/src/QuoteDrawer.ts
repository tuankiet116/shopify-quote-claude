import { CartSettings, QuoteCartItem } from './types';
import { QuoteCart } from './QuoteCart';
import { QuoteForm } from './QuoteForm';

export class QuoteDrawer {
    private config: CartSettings;
    private cart: QuoteCart;
    private form: QuoteForm;
    private drawerEl: HTMLElement | null = null;
    private floatingBtn: HTMLElement | null = null;
    private isOpen = false;

    constructor(config: CartSettings, cart: QuoteCart, form: QuoteForm) {
        this.config = config;
        this.cart = cart;
        this.form = form;
    }

    init(): void {
        if (!this.config.enabled) return;

        this.renderFloatingButton();
        this.renderDrawer();

        this.cart.on('cart:updated', () => {
            this.updateBadge();
            this.updateDrawerContent();
        });
    }

    private renderFloatingButton(): void {
        const btn = document.createElement('button');
        btn.className = `quote-floating-btn quote-floating-btn--${this.config.position}`;
        btn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            <span class="quote-floating-badge" style="background:${this.config.badgeColor}">0</span>
        `;

        btn.addEventListener('click', () => this.toggle());
        document.body.appendChild(btn);
        this.floatingBtn = btn;
        this.updateBadge();
    }

    private renderDrawer(): void {
        const overlay = document.createElement('div');
        overlay.className = 'quote-drawer-overlay';
        overlay.addEventListener('click', () => this.close());

        const drawer = document.createElement('div');
        drawer.className = `quote-drawer quote-drawer--${this.config.position}`;
        drawer.style.width = this.config.drawerWidth || '400px';

        drawer.innerHTML = `
            <div class="quote-drawer-header">
                <h3>Quote Cart</h3>
                <button class="quote-drawer-close">&times;</button>
            </div>
            <div class="quote-drawer-items"></div>
            <div class="quote-drawer-footer">
                <div class="quote-drawer-subtotal">
                    <span>Subtotal:</span>
                    <span class="quote-drawer-subtotal-value">$0.00</span>
                </div>
                <button class="quote-btn quote-btn--medium quote-drawer-submit">Submit Quote Request</button>
                <button class="quote-drawer-continue">Continue Shopping</button>
            </div>
        `;

        drawer.querySelector('.quote-drawer-close')!.addEventListener('click', () => this.close());
        drawer.querySelector('.quote-drawer-continue')!.addEventListener('click', () => this.close());
        drawer.querySelector('.quote-drawer-submit')!.addEventListener('click', () => {
            this.close();
            this.form.renderSubmitForm(this.cart.getItems());
        });

        const container = document.createElement('div');
        container.className = 'quote-drawer-container';
        container.appendChild(overlay);
        container.appendChild(drawer);
        document.body.appendChild(container);
        this.drawerEl = container;
        this.updateDrawerContent();
    }

    private updateBadge(): void {
        const badge = this.floatingBtn?.querySelector('.quote-floating-badge');
        if (badge) {
            const count = this.cart.getCount();
            badge.textContent = String(count);
            (badge as HTMLElement).style.display = count > 0 ? 'flex' : 'none';
        }
    }

    private updateDrawerContent(): void {
        if (!this.drawerEl) return;
        const itemsContainer = this.drawerEl.querySelector('.quote-drawer-items');
        const subtotalEl = this.drawerEl.querySelector('.quote-drawer-subtotal-value');
        if (!itemsContainer) return;

        const items = this.cart.getItems();
        if (items.length === 0) {
            itemsContainer.innerHTML = '<p class="quote-drawer-empty">Your quote cart is empty</p>';
        } else {
            itemsContainer.innerHTML = items.map(item => `
                <div class="quote-drawer-item" data-variant-id="${item.variantId}">
                    ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.title}" class="quote-drawer-item-img">` : ''}
                    <div class="quote-drawer-item-info">
                        <p class="quote-drawer-item-title">${item.title}</p>
                        ${item.variantTitle ? `<p class="quote-drawer-item-variant">${item.variantTitle}</p>` : ''}
                        <p class="quote-drawer-item-price">$${(item.price / 100).toFixed(2)}</p>
                    </div>
                    <div class="quote-drawer-item-qty">
                        <button class="quote-qty-btn" data-action="decrease">-</button>
                        <span>${item.quantity}</span>
                        <button class="quote-qty-btn" data-action="increase">+</button>
                    </div>
                    <button class="quote-drawer-item-remove" data-action="remove">&times;</button>
                </div>
            `).join('');

            // Attach event listeners
            itemsContainer.querySelectorAll('[data-action]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const target = e.currentTarget as HTMLElement;
                    const action = target.dataset.action;
                    const itemEl = target.closest('.quote-drawer-item') as HTMLElement;
                    const variantId = parseInt(itemEl.dataset.variantId!);
                    const item = items.find(i => i.variantId === variantId);
                    if (!item) return;

                    if (action === 'increase') {
                        this.cart.updateQuantity(variantId, item.quantity + 1);
                    } else if (action === 'decrease') {
                        if (item.quantity > 1) {
                            this.cart.updateQuantity(variantId, item.quantity - 1);
                        }
                    } else if (action === 'remove') {
                        this.cart.removeItem(variantId);
                    }
                });
            });
        }

        if (subtotalEl) {
            subtotalEl.textContent = '$' + (this.cart.getSubtotal() / 100).toFixed(2);
        }
    }

    open(): void {
        if (this.drawerEl) {
            this.drawerEl.classList.add('quote-drawer-container--open');
            this.isOpen = true;
        }
    }

    close(): void {
        if (this.drawerEl) {
            this.drawerEl.classList.remove('quote-drawer-container--open');
            this.isOpen = false;
        }
    }

    toggle(): void {
        this.isOpen ? this.close() : this.open();
    }
}
