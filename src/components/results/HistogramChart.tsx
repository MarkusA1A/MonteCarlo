import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import { HistogramBin, Statistics } from '../../types';
import { formatCurrency } from '../../lib/statistics';

interface HistogramChartProps {
  data: HistogramBin[];
  stats: Statistics;
  title?: string;
  exportMode?: boolean;
}

export function HistogramChart({ data, stats, title = 'Verteilung der Immobilienwerte', exportMode = false }: HistogramChartProps) {
  const chartData = data.map((bin) => ({
    range: `${(bin.rangeStart / 1000).toFixed(0)}k`,
    rangeStart: bin.rangeStart,
    rangeEnd: bin.rangeEnd,
    count: bin.count,
    percentage: bin.percentage,
  }));

  const getBarColor = (rangeStart: number, rangeEnd: number) => {
    const midpoint = (rangeStart + rangeEnd) / 2;
    if (midpoint < stats.percentile10) return '#FED7AA'; // orange-200
    if (midpoint < stats.percentile25) return '#FDE68A'; // yellow-200
    if (midpoint <= stats.percentile75) return '#93C5FD'; // blue-300
    if (midpoint <= stats.percentile90) return '#86EFAC'; // green-300
    return '#A7F3D0'; // emerald-200
  };

  const chartContent = (
    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }} width={exportMode ? 760 : undefined} height={exportMode ? 300 : undefined}>
            <XAxis
              dataKey="range"
              tick={{ fontSize: 11, fill: '#6B7280' }}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#6B7280' }}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white shadow-lg rounded-lg border border-gray-200 p-3">
                      <p className="text-xs text-gray-500 mb-1">Wertebereich</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(data.rangeStart)} - {formatCurrency(data.rangeEnd)}
                      </p>
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-500">Häufigkeit</p>
                        <p className="text-sm font-medium text-[#0066FF]">
                          {data.count} ({data.percentage.toFixed(1)}%)
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Referenzlinien für Perzentile */}
            <ReferenceLine
              x={chartData.find(d => d.rangeStart <= stats.percentile10 && d.rangeEnd >= stats.percentile10)?.range}
              stroke="#F97316"
              strokeDasharray="3 3"
              label={{ value: 'P10', position: 'top', fontSize: 10, fill: '#F97316' }}
            />
            <ReferenceLine
              x={chartData.find(d => d.rangeStart <= stats.median && d.rangeEnd >= stats.median)?.range}
              stroke="#0066FF"
              strokeDasharray="3 3"
              label={{ value: 'Median', position: 'top', fontSize: 10, fill: '#0066FF' }}
            />
            <ReferenceLine
              x={chartData.find(d => d.rangeStart <= stats.percentile90 && d.rangeEnd >= stats.percentile90)?.range}
              stroke="#10B981"
              strokeDasharray="3 3"
              label={{ value: 'P90', position: 'top', fontSize: 10, fill: '#10B981' }}
            />

            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
        {chartData.map((entry, index) => (
          <Cell
            key={`cell-${index}`}
            fill={getBarColor(entry.rangeStart, entry.rangeEnd)}
          />
        ))}
      </Bar>
    </BarChart>
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>

      <div className={exportMode ? '' : 'h-64 sm:h-80'}>
        {exportMode ? chartContent : (
          <ResponsiveContainer width="100%" height="100%">
            {chartContent}
          </ResponsiveContainer>
        )}
      </div>

      {/* Legende */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-4 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-orange-200 rounded" />
          <span className="text-gray-600">Unter P10</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-300 rounded" />
          <span className="text-gray-600">P25 - P75</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-300 rounded" />
          <span className="text-gray-600">Über P90</span>
        </div>
      </div>
    </div>
  );
}
