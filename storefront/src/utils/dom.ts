export function createElement<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    attrs?: Record<string, string>,
    children?: (HTMLElement | string)[]
): HTMLElementTagNameMap[K] {
    const el = document.createElement(tag);
    if (attrs) {
        Object.entries(attrs).forEach(([key, value]) => {
            if (key === 'className') {
                el.className = value;
            } else if (key.startsWith('data-')) {
                el.setAttribute(key, value);
            } else {
                (el as any)[key] = value;
            }
        });
    }
    if (children) {
        children.forEach(child => {
            if (typeof child === 'string') {
                el.appendChild(document.createTextNode(child));
            } else {
                el.appendChild(child);
            }
        });
    }
    return el;
}

export function findProductForm(): HTMLFormElement | null {
    return document.querySelector('form[action*="/cart/add"]');
}

export function formatMoney(cents: number): string {
    return '$' + (cents / 100).toFixed(2);
}
