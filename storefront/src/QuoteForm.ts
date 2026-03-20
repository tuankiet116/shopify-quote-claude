import { FormConfig, FormField, QuoteCartItem } from './types';
import { QuoteAPI } from './QuoteAPI';
import { QuoteCart } from './QuoteCart';

export class QuoteForm {
    private config: FormConfig;
    private api: QuoteAPI;
    private cart: QuoteCart;
    private modalEl: HTMLElement | null = null;

    constructor(config: FormConfig, api: QuoteAPI, cart: QuoteCart) {
        this.config = config;
        this.api = api;
        this.cart = cart;
    }

    renderSubmitForm(items: QuoteCartItem[]): void {
        if (items.length === 0) return;
        this.removeModal();

        const modal = document.createElement('div');
        modal.className = 'quote-modal-overlay';

        modal.innerHTML = `
            <div class="quote-modal">
                <div class="quote-modal-header">
                    <h2>${this.config.title || 'Request a Quote'}</h2>
                    <button class="quote-modal-close">&times;</button>
                </div>
                <div class="quote-modal-body">
                    ${this.config.description ? `<p class="quote-modal-desc">${this.config.description}</p>` : ''}
                    <div class="quote-modal-items">
                        <h4>Items (${items.length})</h4>
                        ${items.map(item => `
                            <div class="quote-modal-item">
                                ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.title}">` : ''}
                                <div>
                                    <p><strong>${item.title}</strong></p>
                                    ${item.variantTitle ? `<p class="text-muted">${item.variantTitle}</p>` : ''}
                                    <p>Qty: ${item.quantity} &times; $${(item.price / 100).toFixed(2)}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <form class="quote-form" novalidate>
                        ${this.renderFields()}
                        <button type="submit" class="quote-btn quote-btn--medium quote-form-submit">
                            ${this.config.submitButtonText || 'Submit Quote'}
                        </button>
                    </form>
                </div>
            </div>
        `;

        modal.querySelector('.quote-modal-close')!.addEventListener('click', () => this.close());
        modal.querySelector('.quote-modal-overlay')?.addEventListener('click', (e) => {
            if (e.target === modal) this.close();
        });
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.close();
        });

        const form = modal.querySelector('.quote-form') as HTMLFormElement;
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!this.validate(form)) return;

            const submitBtn = form.querySelector('.quote-form-submit') as HTMLButtonElement;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';

            try {
                const formData: Record<string, string> = {};
                this.config.fields.forEach(field => {
                    const input = form.querySelector(`[name="${field.name}"]`) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
                    if (input) formData[field.name] = input.value;
                });

                const result = await this.api.submitQuote(items, formData);
                this.cart.clear();
                this.showSuccess(modal, result.quoteNumber);
            } catch (err: any) {
                submitBtn.disabled = false;
                submitBtn.textContent = this.config.submitButtonText || 'Submit Quote';
                const errorEl = form.querySelector('.quote-form-error') || document.createElement('div');
                errorEl.className = 'quote-form-error';
                errorEl.textContent = err.message || 'Failed to submit quote';
                form.prepend(errorEl);
            }
        });

        document.body.appendChild(modal);
        this.modalEl = modal;
        document.body.style.overflow = 'hidden';
    }

    private renderFields(): string {
        return this.config.fields.map(field => {
            const required = field.required ? 'required' : '';
            const requiredMark = field.required ? '<span class="quote-required">*</span>' : '';

            switch (field.type) {
                case 'textarea':
                    return `
                        <div class="quote-form-field">
                            <label>${field.label}${requiredMark}</label>
                            <textarea name="${field.name}" ${required} rows="3"></textarea>
                        </div>`;
                case 'select':
                    return `
                        <div class="quote-form-field">
                            <label>${field.label}${requiredMark}</label>
                            <select name="${field.name}" ${required}>
                                <option value="">Select...</option>
                                ${(field.options || []).map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                            </select>
                        </div>`;
                default:
                    return `
                        <div class="quote-form-field">
                            <label>${field.label}${requiredMark}</label>
                            <input type="${field.type}" name="${field.name}" ${required} />
                        </div>`;
            }
        }).join('');
    }

    private validate(form: HTMLFormElement): boolean {
        let valid = true;
        form.querySelectorAll('.quote-field-error').forEach(el => el.remove());

        this.config.fields.forEach(field => {
            if (!field.required) return;
            const input = form.querySelector(`[name="${field.name}"]`) as HTMLInputElement;
            if (!input || !input.value.trim()) {
                valid = false;
                const errorEl = document.createElement('span');
                errorEl.className = 'quote-field-error';
                errorEl.textContent = `${field.label} is required`;
                input?.parentNode?.appendChild(errorEl);
            } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
                valid = false;
                const errorEl = document.createElement('span');
                errorEl.className = 'quote-field-error';
                errorEl.textContent = 'Please enter a valid email';
                input.parentNode?.appendChild(errorEl);
            }
        });

        return valid;
    }

    private showSuccess(modal: HTMLElement, quoteNumber: string): void {
        const body = modal.querySelector('.quote-modal-body');
        if (body) {
            body.innerHTML = `
                <div class="quote-success">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    <h3>${this.config.successMessage || 'Quote submitted successfully!'}</h3>
                    <p>Your quote number: <strong>${quoteNumber}</strong></p>
                    <button class="quote-btn quote-btn--medium" onclick="this.closest('.quote-modal-overlay').remove(); document.body.style.overflow = '';">
                        Continue Shopping
                    </button>
                </div>
            `;
        }
    }

    close(): void {
        this.removeModal();
    }

    private removeModal(): void {
        if (this.modalEl) {
            this.modalEl.remove();
            this.modalEl = null;
        }
        document.body.style.overflow = '';
    }
}
