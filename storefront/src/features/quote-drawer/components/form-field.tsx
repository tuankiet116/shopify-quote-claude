interface FormFieldProps {
  label: string;
  type: string;
  value: string;
  required?: boolean;
  onChange: (value: string) => void;
}

export function FormField({ label, type, value, required, onChange }: FormFieldProps) {
  return (
    <div class="quote-form-field">
      <label>
        {label}
        {required && <span class="quote-required"> *</span>}
      </label>
      <input
        type={type}
        value={value}
        required={required}
        onInput={(e) => onChange((e.target as HTMLInputElement).value)}
      />
    </div>
  );
}
