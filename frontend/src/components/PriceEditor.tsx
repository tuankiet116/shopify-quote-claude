import { TextField } from '@shopify/polaris';
import { useState, useCallback } from 'react';

interface PriceEditorProps {
    value: number;
    onChange: (value: number) => void;
    label?: string;
    currency?: string;
}

export default function PriceEditor({ value, onChange, label = 'Price', currency = '$' }: PriceEditorProps) {
    const [inputValue, setInputValue] = useState(value.toFixed(2));

    const handleChange = useCallback((newValue: string) => {
        setInputValue(newValue);
        const parsed = parseFloat(newValue);
        if (!isNaN(parsed) && parsed >= 0) {
            onChange(parsed);
        }
    }, [onChange]);

    return (
        <TextField
            label={label}
            labelHidden
            type="number"
            value={inputValue}
            onChange={handleChange}
            prefix={currency}
            step={0.01}
            min={0}
            autoComplete="off"
        />
    );
}
