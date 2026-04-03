import { formData, closeDrawer, resetStore } from '../store';

export function SuccessView() {
  const email = formData.value.email;

  return (
    <div class="quote-drawer-items">
      <div class="quote-success">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M9 12l2 2 4-4" />
        </svg>
        <h3>Quote Submitted!</h3>
        <p>We'll get back to you at {email}.</p>
        <button class="quote-btn quote-btn--medium quote-btn--success"
                onClick={() => { closeDrawer(); resetStore(); }}>
          Close
        </button>
      </div>
    </div>
  );
}
