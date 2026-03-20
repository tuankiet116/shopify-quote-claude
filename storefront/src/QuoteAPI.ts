import { QuoteCartItem, FormConfig } from './types';

export class QuoteAPI {
    private proxyPath: string;

    constructor(proxyPath: string) {
        this.proxyPath = proxyPath;
    }

    async submitQuote(items: QuoteCartItem[], formData: Record<string, string>): Promise<{ success: boolean; quoteNumber: string }> {
        const response = await fetch(`${this.proxyPath}/submit-quote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items, formData }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Failed to submit quote');
        }

        return response.json();
    }

    async getFormConfig(): Promise<FormConfig | null> {
        try {
            const response = await fetch(`${this.proxyPath}/form-config`);
            if (!response.ok) return null;
            return response.json();
        } catch {
            return null;
        }
    }
}
