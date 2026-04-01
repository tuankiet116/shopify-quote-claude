/** Insert a new element after a reference element */
export function insertAfter(newEl: Element, refEl: Element): void {
  refEl.parentNode?.insertBefore(newEl, refEl.nextSibling);
}

/** Create an element with optional classes and attributes */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  opts?: { className?: string; attrs?: Record<string, string>; text?: string },
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (opts?.className) el.className = opts.className;
  if (opts?.text) el.textContent = opts.text;
  if (opts?.attrs) {
    for (const [key, val] of Object.entries(opts.attrs)) {
      el.setAttribute(key, val);
    }
  }
  return el;
}

/** Debounce a function call */
export function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: unknown[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}
