import { QuoteCartItem } from './types';
import { getStoredItems, setStoredItems, clearStoredItems } from './utils/storage';

type EventCallback = (data?: any) => void;

export class QuoteCart {
    private items: QuoteCartItem[] = [];
    private listeners: Map<string, EventCallback[]> = new Map();
    private static STORAGE_KEY = 'shopify_quote_cart';

    constructor() {
        this.items = getStoredItems<QuoteCartItem[]>(QuoteCart.STORAGE_KEY) || [];
    }

    addItem(item: QuoteCartItem): void {
        const existing = this.items.find(i => i.variantId === item.variantId);
        if (existing) {
            existing.quantity += item.quantity;
        } else {
            this.items.push({ ...item });
        }
        this.save();
        this.emit('cart:updated', this.items);
    }

    removeItem(variantId: number): void {
        this.items = this.items.filter(i => i.variantId !== variantId);
        this.save();
        this.emit('cart:updated', this.items);
    }

    updateQuantity(variantId: number, quantity: number): void {
        const item = this.items.find(i => i.variantId === variantId);
        if (item) {
            item.quantity = Math.max(1, quantity);
            this.save();
            this.emit('cart:updated', this.items);
        }
    }

    getItems(): QuoteCartItem[] {
        return [...this.items];
    }

    getCount(): number {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    getSubtotal(): number {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    clear(): void {
        this.items = [];
        clearStoredItems(QuoteCart.STORAGE_KEY);
        this.emit('cart:updated', this.items);
    }

    on(event: string, callback: EventCallback): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)!.push(callback);
    }

    emit(event: string, data?: any): void {
        const callbacks = this.listeners.get(event) || [];
        callbacks.forEach(cb => cb(data));
    }

    private save(): void {
        setStoredItems(this.items, QuoteCart.STORAGE_KEY);
    }
}
