import { useRef, useEffect, useCallback } from 'react';
import { Checkbox } from '@shopify/polaris';
import { useIsEmbedded } from '@/hooks/useIsEmbedded';

export interface QCheckboxProps {
  readonly label: string;
  readonly checked?: boolean;
  readonly onChange?: (checked: boolean) => void;
  readonly disabled?: boolean;
  readonly helpText?: string;
}

export function QCheckbox({ label, checked = false, onChange, disabled, helpText }: Readonly<QCheckboxProps>) {
  const isEmbedded = useIsEmbedded();
  const ref = useRef<HTMLElement>(null);

  const handleChange = useCallback((e: Event) => {
    const target = e.target as HTMLInputElement;
    onChange?.(target.checked);
  }, [onChange]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !isEmbedded) return;

    el.addEventListener('change', handleChange);
    return () => el.removeEventListener('change', handleChange);
  }, [isEmbedded, handleChange]);

  if (isEmbedded) {
    return (
      <s-checkbox
        ref={ref}
        label={label}
        checked={checked || undefined}
        disabled={disabled || undefined}
      />
    );
  }

  return (
    <Checkbox
      label={label}
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      helpText={helpText}
    />
  );
}
