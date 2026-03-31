import { useRef, useEffect, useCallback } from 'react';
import { Select } from '@shopify/polaris';
import { useIsEmbedded } from '@/hooks/useIsEmbedded';

export interface QSelectOption {
  readonly label: string;
  readonly value: string;
}

export interface QSelectProps {
  readonly label: string;
  readonly options: readonly QSelectOption[];
  readonly value?: string;
  readonly onChange?: (value: string) => void;
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly error?: string;
  readonly name?: string;
}

export function QSelect({ label, options, value, onChange, placeholder, disabled, error, name }: Readonly<QSelectProps>) {
  const isEmbedded = useIsEmbedded();
  const ref = useRef<HTMLElement>(null);

  const handleChange = useCallback((e: Event) => {
    const target = e.target as HTMLSelectElement;
    onChange?.(target.value);
  }, [onChange]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !isEmbedded) return;

    el.addEventListener('change', handleChange);
    return () => el.removeEventListener('change', handleChange);
  }, [isEmbedded, handleChange]);

  if (isEmbedded) {
    return (
      <s-select ref={ref} label={label} value={value} name={name} disabled={disabled || undefined}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </s-select>
    );
  }

  return (
    <Select
      label={label}
      options={placeholder ? [{ label: placeholder, value: '' }, ...options] : [...options]}
      value={value ?? ''}
      onChange={onChange}
      disabled={disabled}
      error={error}
      name={name}
    />
  );
}
