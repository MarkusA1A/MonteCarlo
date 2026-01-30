import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ErrorBar,
} from 'recharts';
import { Statistics } from '../../types';
import { formatCurrency } from '../../lib/statistics';

interface MethodComparisonChartProps {
  mieteinnahmenStats: Statistics | null;
  vergleichswertStats: Statistics | null;
  dcfStats: Statistics | null;
  combinedStats: Statistics;
  exportMode?: boolean;
}

export function MethodComparisonChart({
  mieteinnahmenStats,
  vergleichswertStats,
  dcfStats,
  combinedStats,
  exportMode = false,
}: MethodComparisonChartProps) {
  const chartData = [
    mieteinnahmenStats && {
      name: 'Ertragswert',
      value: mieteinnahmenStats.mean,
      errorLow: mieteinnahmenStats.mean - mieteinnahmenStats.percentile10,
      errorHigh: mieteinnahmenStats.percentile90 - mieteinnahmenStats.mean,
      color: '#0066FF',
      p10: mieteinnahmenStats.percentile10,
      p90: mieteinnahmenStats.percentile90,
    },
    vergleichswertStats && {
      name: 'Vergleichswert',
      value: vergleichswertStats.mean,
      errorLow: vergleichswertStats.mean - vergleichswertStats.percentile10,
      errorHigh: vergleichswertStats.percentile90 - vergleichswertStats.mean,
      color: '#8B5CF6',
      p10: vergleichswertStats.percentile10,
      p90: vergleichswertStats.percentile90,
    },
    dcfStats && {
      name: 'DCF',
      value: dcfStats.mean,
      errorLow: dcfStats.mean - dcfStats.percentile10,
      errorHigh: dcfStats.percentile90 - dcfStats.mean,
      color: '#10B981',
      p10: dcfStats.percentile10,
      p90: dcfStats.percentile90,
    },
    {
      name: 'Kombiniert',
      value: combinedStats.mean,
      errorLow: combinedStats.mean - combinedStats.percentile10,
      errorHigh: combinedStats.percentile90 - combinedStats.mean,
      color: '#F59E0B',
      p10: combinedStats.percentile10,
      p90: combinedStats.percentile90,
    },
  ].filter(Boolean);

  const chartContent = (
    <BarChart
      data={chartData}
      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      width={exportMode ? 760 : undefined}
      height={exportMode ? 250 : undefined}
    >
      <XAxis
        dataKey="name"
        tick={{ fontSize: 12, fill: '#6B7280' }}
        tickLine={false}
        axisLine={{ stroke: '#E5E7EB' }}
      />
      <YAxis
        tick={{ fontSize: 11, fill: '#6B7280' }}
        tickLine={false}
        axisLine={{ stroke: '#E5E7EB' }}
        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
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
                    <span className="text-gray-500">Mittelwert:</span>
                    <span className="font-medium">{formatCurrency(data.value)}</span>
                  </div>
                  <div className="flex justify-between space-x-4">
                    <span className="text-gray-500">P10:</span>
                    <span className="font-medium">{formatCurrency(data.p10)}</span>
                  </div>
                  <div className="flex justify-between space-x-4">
                    <span className="text-gray-500">P90:</span>
                    <span className="font-medium">{formatCurrency(data.p90)}</span>
                  </div>
                </div>
              </div>
            );
          }
          return null;
        }}
      />
      <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="#0066FF">
        <ErrorBar
          dataKey="errorLow"
          direction="y"
          width={4}
          strokeWidth={2}
          stroke="#9CA3AF"
        />
        <ErrorBar
          dataKey="errorHigh"
          direction="y"
          width={4}
          strokeWidth={2}
          stroke="#9CA3AF"
        />
      </Bar>
    </BarChart>
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Methodenvergleich
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Mittelwerte mit 80% Konfidenzintervall (P10-P90)
      </p>

      <div className={exportMode ? '' : 'h-48 sm:h-64'}>
        {exportMode ? chartContent : (
          <ResponsiveContainer width="100%" height="100%">
            {chartContent}
          </ResponsiveContainer>
        )}
      </div>

      {/* Vergleichstabelle */}
      {!exportMode && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-gray-500 font-medium">Methode</th>
                <th className="text-right py-2 text-gray-500 font-medium">Mittelwert</th>
                <th className="text-right py-2 text-gray-500 font-medium">P10</th>
                <th className="text-right py-2 text-gray-500 font-medium">P90</th>
                <th className="text-right py-2 text-gray-500 font-medium">Spanne</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((item: any) => (
                <tr key={item.name} className="border-b border-gray-100">
                  <td className="py-2 font-medium text-gray-900">{item.name}</td>
                  <td className="py-2 text-right">{formatCurrency(item.value)}</td>
                  <td className="py-2 text-right text-orange-600">{formatCurrency(item.p10)}</td>
                  <td className="py-2 text-right text-green-600">{formatCurrency(item.p90)}</td>
                  <td className="py-2 text-right text-gray-500">
                    {formatCurrency(item.p90 - item.p10)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
