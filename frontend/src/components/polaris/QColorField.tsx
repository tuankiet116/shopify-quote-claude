import { useRef, useEffect, useCallback } from 'react';
import { useIsEmbedded } from '@/hooks/useIsEmbedded';

export interface QColorFieldProps {
  readonly label: string;
  readonly value?: string;
  readonly onChange?: (value: string) => void;
  readonly disabled?: boolean;
}

export function QColorField({ label, value = '#000000', onChange, disabled }: Readonly<QColorFieldProps>) {
  const isEmbedded = useIsEmbedded();
  const ref = useRef<HTMLElement>(null);

  const handleChange = useCallback((e: Event) => {
    const target = e.target as HTMLInputElement;
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
      <s-color-field
        ref={ref}
        label={label}
        value={value}
        disabled={disabled || undefined}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: '#303030' }}>
        {label}
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          style={{
            width: 36,
            height: 36,
            padding: 2,
            border: '1px solid #c9cccf',
            borderRadius: 8,
            cursor: disabled ? 'not-allowed' : 'pointer',
            backgroundColor: 'transparent',
          }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          maxLength={7}
          style={{
            width: 90,
            padding: '6px 10px',
            border: '1px solid #c9cccf',
            borderRadius: 8,
            fontSize: 13,
            fontFamily: 'monospace',
            color: '#303030',
            textTransform: 'uppercase',
          }}
        />
      </div>
    </div>
  );
}
