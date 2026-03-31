import { useRef, useEffect, useCallback } from 'react';
import { TextField } from '@shopify/polaris';
import { useIsEmbedded } from '@/hooks/useIsEmbedded';

export interface QTextFieldProps {
  readonly label: string;
  readonly value?: string;
  readonly onChange?: (value: string) => void;
  readonly onBlur?: () => void;
  readonly placeholder?: string;
  readonly error?: string;
  readonly helpText?: string;
  readonly disabled?: boolean;
  readonly readOnly?: boolean;
  readonly required?: boolean;
  readonly name?: string;
  readonly autoComplete?: string;
  readonly prefix?: string;
  readonly suffix?: string;
  readonly type?: 'text' | 'email' | 'number' | 'password' | 'url';
  readonly min?: number;
  readonly max?: number;
  readonly minLength?: number;
  readonly maxLength?: number;
}

export function QTextField({
  label, value, onChange, onBlur, placeholder, error, helpText,
  disabled, readOnly, required, name, autoComplete,
  prefix, suffix, type = 'text', minLength, maxLength,
}: Readonly<QTextFieldProps>) {
  const isEmbedded = useIsEmbedded();
  const ref = useRef<HTMLElement>(null);

  const handleInput = useCallback((e: Event) => {
    const target = e.target as HTMLInputElement;
    onChange?.(target.value);
  }, [onChange]);

  const handleBlur = useCallback(() => {
    onBlur?.();
  }, [onBlur]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !isEmbedded) return;

    el.addEventListener('input', handleInput);
    el.addEventListener('blur', handleBlur);
    return () => {
      el.removeEventListener('input', handleInput);
      el.removeEventListener('blur', handleBlur);
    };
  }, [isEmbedded, handleInput, handleBlur]);

  if (isEmbedded) {
    return (
      <s-text-field
        ref={ref}
        label={label}
        value={value}
        placeholder={placeholder}
        error={error}
        details={helpText}
        disabled={disabled || undefined}
        readOnly={readOnly || undefined}
        required={required || undefined}
        name={name}
        autocomplete={autoComplete}
        prefix={prefix}
        suffix={suffix}
        minLength={minLength}
        maxLength={maxLength}
      />
    );
  }

  return (
    <TextField
      label={label}
      value={value ?? ''}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      error={error}
      helpText={helpText}
      disabled={disabled}
      readOnly={readOnly}
      requiredIndicator={required}
      name={name}
      autoComplete={autoComplete ?? 'off'}
      prefix={prefix}
      suffix={suffix}
      type={type}
      minLength={minLength}
      maxLength={maxLength}
    />
  );
}
