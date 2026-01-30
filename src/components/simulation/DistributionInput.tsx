import { Distribution, DistributionType } from '../../types';
import { NumericInput } from '../ui/NumericInput';
import { Select } from '../ui/Select';
import { getDistributionStats } from '../../lib/distributions';

interface DistributionInputProps {
  label: string;
  value: Distribution;
  onChange: (dist: Distribution) => void;
  unit?: string;
  hint?: string;
}

export function DistributionInput({
  label,
  value,
  onChange,
  unit = '',
  hint,
}: DistributionInputProps) {
  const stats = getDistributionStats(value);

  const distributionOptions = [
    { value: 'normal', label: 'Normalverteilung' },
    { value: 'triangular', label: 'Dreiecksverteilung' },
    { value: 'uniform', label: 'Gleichverteilung' },
    { value: 'lognormal', label: 'Log-Normalverteilung' },
  ];

  const handleTypeChange = (type: DistributionType) => {
    let newParams: Distribution['params'];

    switch (type) {
      case 'normal':
      case 'lognormal':
        newParams = {
          mean: value.params.mean ?? value.params.mode ?? 0,
          stdDev: value.params.stdDev ?? ((value.params.max ?? 0) - (value.params.min ?? 0)) / 4,
        };
        break;
      case 'uniform':
        newParams = {
          min: value.params.min ?? (value.params.mean ?? 0) - (value.params.stdDev ?? 1) * 2,
          max: value.params.max ?? (value.params.mean ?? 0) + (value.params.stdDev ?? 1) * 2,
        };
        break;
      case 'triangular':
        newParams = {
          min: value.params.min ?? (value.params.mean ?? 0) - (value.params.stdDev ?? 1) * 2,
          mode: value.params.mode ?? value.params.mean ?? 0,
          max: value.params.max ?? (value.params.mean ?? 0) + (value.params.stdDev ?? 1) * 2,
        };
        break;
      default:
        newParams = value.params;
    }

    onChange({ type, params: newParams });
  };

  const handleParamChange = (key: keyof Distribution['params'], val: number) => {
    onChange({
      ...value,
      params: { ...value.params, [key]: val },
    });
  };

  return (
    <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <Select
          options={distributionOptions}
          value={value.type}
          onChange={(e) => handleTypeChange(e.target.value as DistributionType)}
          className="w-full sm:w-44"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(value.type === 'normal' || value.type === 'lognormal') && (
          <>
            <NumericInput
              label="Mittelwert"
              value={value.params.mean ?? 0}
              onChange={(val) => handleParamChange('mean', val)}
              suffix={unit}
            />
            <NumericInput
              label="Std.-Abw."
              value={value.params.stdDev ?? 0}
              onChange={(val) => handleParamChange('stdDev', val)}
              suffix={unit}
              defaultValue={1}
            />
          </>
        )}

        {value.type === 'uniform' && (
          <>
            <NumericInput
              label="Minimum"
              value={value.params.min ?? 0}
              onChange={(val) => handleParamChange('min', val)}
              suffix={unit}
            />
            <NumericInput
              label="Maximum"
              value={value.params.max ?? 0}
              onChange={(val) => handleParamChange('max', val)}
              suffix={unit}
            />
          </>
        )}

        {value.type === 'triangular' && (
          <>
            <NumericInput
              label="Minimum"
              value={value.params.min ?? 0}
              onChange={(val) => handleParamChange('min', val)}
              suffix={unit}
            />
            <NumericInput
              label="Modus"
              value={value.params.mode ?? 0}
              onChange={(val) => handleParamChange('mode', val)}
              suffix={unit}
            />
            <NumericInput
              label="Maximum"
              value={value.params.max ?? 0}
              onChange={(val) => handleParamChange('max', val)}
              suffix={unit}
              className="sm:col-span-2"
            />
          </>
        )}
      </div>

      {/* Vorschau der erwarteten Werte */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-200">
        <span>Erw. Bereich (90%):</span>
        <span className="font-medium text-gray-700">
          {stats.p5.toFixed(1)} - {stats.p95.toFixed(1)} {unit}
        </span>
      </div>

      {hint && (
        <p className="text-xs text-gray-500">{hint}</p>
      )}
    </div>
  );
}
