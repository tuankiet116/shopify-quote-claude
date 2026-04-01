import { debounce } from './dom';

/**
 * Reusable MutationObserver manager that watches for new DOM elements
 * and processes them exactly once (via WeakSet tracking).
 */
export class DomObserver {
  private observer: MutationObserver | null = null;
  private processed = new WeakSet<Element>();
  private callback: () => void;

  constructor(onMutation: () => void, debounceMs = 100) {
    this.callback = debounce(onMutation, debounceMs);
  }

  /** Start observing document.body for new child nodes */
  start(): void {
    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          this.callback();
          return;
        }
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  /** Stop observing */
  stop(): void {
    this.observer?.disconnect();
    this.observer = null;
  }

  /** Check if an element has already been processed */
  isProcessed(el: Element): boolean {
    return this.processed.has(el);
  }

  /** Mark an element as processed */
  markProcessed(el: Element): void {
    this.processed.add(el);
  }
}
