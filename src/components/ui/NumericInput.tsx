import { useState, useEffect, InputHTMLAttributes } from 'react';

interface NumericInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label?: string;
  error?: string;
  hint?: string;
  suffix?: string;
  prefix?: string;
  value: number;
  onChange: (value: number) => void;
  defaultValue?: number;
}

export function NumericInput({
  className = '',
  label,
  error,
  hint,
  suffix,
  prefix,
  id,
  value,
  onChange,
  defaultValue = 0,
  ...props
}: NumericInputProps) {
  const [localValue, setLocalValue] = useState(String(value));
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  const errorId = error && inputId ? `${inputId}-error` : undefined;
  const hintId = hint && !error && inputId ? `${inputId}-hint` : undefined;
  const describedBy = errorId || hintId || undefined;

  // Sync local value when external value changes
  useEffect(() => {
    setLocalValue(String(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow empty string, minus sign, decimal point while typing
    if (val === '' || val === '-' || val === '.' || val === '-.' || /^-?\d*\.?\d*$/.test(val)) {
      setLocalValue(val);
    }
  };

  const handleBlur = () => {
    const parsed = parseFloat(localValue);
    if (isNaN(parsed) || localValue === '') {
      onChange(defaultValue);
      setLocalValue(String(defaultValue));
    } else {
      onChange(parsed);
      setLocalValue(String(parsed));
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
            {prefix}
          </span>
        )}
        <input
          id={inputId}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`
            w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900
            placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${prefix ? 'pl-8' : ''}
            ${suffix ? 'pr-12' : ''}
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
          `}
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
            {suffix}
          </span>
        )}
      </div>
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-xs text-gray-500">{hint}</p>
      )}
      {error && (
        <p id={errorId} className="mt-1.5 text-xs text-red-600" role="alert">{error}</p>
      )}
    </div>
  );
}
