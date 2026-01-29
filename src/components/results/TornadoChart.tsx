import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { SensitivityResult } from '../../types';
import { formatCurrency } from '../../lib/statistics';

interface TornadoChartProps {
  data: SensitivityResult[];
  title?: string;
}

export function TornadoChart({ data, title = 'Sensitivitätsanalyse' }: TornadoChartProps) {
  // Daten für Tornado-Darstellung aufbereiten
  const chartData = data.slice(0, 8).map((item) => ({
    name: item.label,
    parameter: item.parameter,
    low: item.lowValue - item.baseValue,
    high: item.highValue - item.baseValue,
    lowAbsolute: item.lowValue,
    highAbsolute: item.highValue,
    base: item.baseValue,
    impact: item.impact,
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">
        Einfluss der Parameter bei ±20% Variation
      </p>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
          >
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: '#6B7280' }}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k €`}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11, fill: '#6B7280' }}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
              width={90}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white shadow-lg rounded-lg border border-gray-200 p-3">
                      <p className="text-sm font-medium text-gray-900 mb-2">{data.name}</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between space-x-4">
                          <span className="text-red-600">-20%:</span>
                          <span className="font-medium">{formatCurrency(data.lowAbsolute)}</span>
                        </div>
                        <div className="flex justify-between space-x-4">
                          <span className="text-gray-500">Basis:</span>
                          <span className="font-medium">{formatCurrency(data.base)}</span>
                        </div>
                        <div className="flex justify-between space-x-4">
                          <span className="text-green-600">+20%:</span>
                          <span className="font-medium">{formatCurrency(data.highAbsolute)}</span>
                        </div>
                        <div className="pt-2 mt-2 border-t border-gray-100 flex justify-between space-x-4">
                          <span className="text-gray-500">Gesamteinfluss:</span>
                          <span className="font-medium text-[#0066FF]">{formatCurrency(data.impact)}</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <ReferenceLine x={0} stroke="#9CA3AF" strokeWidth={1} />

            <Bar dataKey="low" stackId="stack" radius={[4, 0, 0, 4]}>
              {chartData.map((entry, index) => (
                <Cell key={`low-${index}`} fill="#EF4444" fillOpacity={0.7} />
              ))}
            </Bar>
            <Bar dataKey="high" stackId="stack" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`high-${index}`} fill="#10B981" fillOpacity={0.7} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legende */}
      <div className="flex items-center justify-center space-x-6 mt-4 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded opacity-70" />
          <span className="text-gray-600">Negative Auswirkung (-20%)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded opacity-70" />
          <span className="text-gray-600">Positive Auswirkung (+20%)</span>
        </div>
      </div>
    </div>
  );
}
