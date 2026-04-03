import { useRef, useCallback } from 'preact/hooks';
import type { QuoteButtonConfig } from '../../../shared/types/config';
import { formData, quoteItems, isSubmitting, setFormField, setView, setSubmitting } from '../store';
import { submitQuote } from '../services/api';
import { FormField } from './form-field';

interface FormViewProps {
  config: QuoteButtonConfig;
}

export function FormView({ config }: FormViewProps) {
  const errorRef = useRef<HTMLDivElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const fd = formData.value;

  const showError = useCallback((msg: string) => {
    if (errorRef.current) {
      errorRef.current.textContent = msg;
      errorRef.current.style.display = 'block';
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    const fd = formData.value;

    if (!fd.name.trim() || !fd.email.trim()) {
      showError('Please fill in your name and email.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fd.email)) {
      showError('Please enter a valid email address.');
      return;
    }

    if (errorRef.current) errorRef.current.style.display = 'none';
    setSubmitting(true);

    try {
      const result = await submitQuote(
        config.apiUrl, config.shopDomain, config.language,
        fd, quoteItems.value, honeypotRef.current?.value || '',
      );

      if (result.success) {
        setView('success');
      } else {
        showError(result.error?.message || 'Failed to submit. Please try again.');
        setSubmitting(false);
      }
    } catch {
      showError('Network error. Please try again.');
      setSubmitting(false);
    }
  }, [config, showError]);

  return (
    <>
      <div class="quote-drawer-items">
        <div class="quote-form">
          <div ref={errorRef} class="quote-form-error" style={{ display: 'none' }} />
          <FormField label="Name" type="text" value={fd.name} required onChange={(v) => setFormField('name', v)} />
          <FormField label="Email" type="email" value={fd.email} required onChange={(v) => setFormField('email', v)} />
          <FormField label="Phone" type="tel" value={fd.phone} onChange={(v) => setFormField('phone', v)} />
          <FormField label="Company" type="text" value={fd.company} onChange={(v) => setFormField('company', v)} />
          <div class="quote-form-field">
            <label>Message</label>
            <textarea rows={3} value={fd.message} onInput={(e) => setFormField('message', (e.target as HTMLTextAreaElement).value)} />
          </div>
          <div class="quote-honeypot">
            <input ref={honeypotRef} type="text" name="website" tabIndex={-1} autocomplete="off" />
          </div>
        </div>
      </div>
      <div class="quote-drawer-footer">
        <button class="quote-btn quote-btn--medium quote-form-submit" disabled={isSubmitting.value} onClick={handleSubmit}>
          {isSubmitting.value ? 'Submitting...' : 'Submit Quote Request'}
        </button>
        <button class="quote-drawer-continue" onClick={() => setView('items')}>&larr; Back to items</button>
      </div>
    </>
  );
}
