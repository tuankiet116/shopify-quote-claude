import { signal, computed } from '@preact/signals';
import type { QuoteProduct } from '../../shared/services/storefront-api';

// === Types ===

export interface QuoteItem {
  product: QuoteProduct;
  quantity: number;
}

export interface QuoteFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
}

export type DrawerView = 'items' | 'form' | 'success';

// === Session persistence ===

const STORAGE_KEY = 'quote-items';

function persistItems(items: QuoteItem[]): void {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* noop */ }
}

function restoreItems(): QuoteItem[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// === Signals ===

export const quoteItems = signal<QuoteItem[]>(restoreItems());
export const isDrawerOpen = signal(false);
export const drawerView = signal<DrawerView>('items');
export const formData = signal<QuoteFormData>({ name: '', email: '', phone: '', company: '', message: '' });
export const isSubmitting = signal(false);

// === Computed ===

export const itemCount = computed(() => quoteItems.value.length);

// === Actions ===

export function addItem(product: QuoteProduct, quantity = 1): void {
  const items = [...quoteItems.value];
  const existing = items.find(
    (i) => i.product.productId === product.productId && i.product.variantId === product.variantId,
  );

  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({ product, quantity });
  }

  quoteItems.value = items;
  persistItems(items);
}

export function removeItem(index: number): void {
  const items = [...quoteItems.value];
  items.splice(index, 1);
  quoteItems.value = items;
  persistItems(items);
}

export function updateQuantity(index: number, qty: number): void {
  if (qty < 1 || index < 0 || index >= quoteItems.value.length) return;
  const items = [...quoteItems.value];
  items[index] = { ...items[index], quantity: qty };
  quoteItems.value = items;
  persistItems(items);
}

export function openDrawer(): void {
  isDrawerOpen.value = true;
  drawerView.value = 'items';
}

export function closeDrawer(): void {
  isDrawerOpen.value = false;
}

export function setFormField(field: keyof QuoteFormData, value: string): void {
  formData.value = { ...formData.value, [field]: value };
}

export function setView(view: DrawerView): void {
  drawerView.value = view;
}

export function setSubmitting(value: boolean): void {
  isSubmitting.value = value;
}

export function resetStore(): void {
  quoteItems.value = [];
  formData.value = { name: '', email: '', phone: '', company: '', message: '' };
  drawerView.value = 'items';
  isSubmitting.value = false;
  persistItems([]);
}
