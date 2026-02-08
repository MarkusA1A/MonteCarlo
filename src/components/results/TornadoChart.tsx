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
import { Info } from 'lucide-react';

interface TornadoChartProps {
  data: SensitivityResult[];
  title?: string;
  exportMode?: boolean;
}

export function TornadoChart({ data, title = 'Sensitivitätsanalyse', exportMode = false }: TornadoChartProps) {
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

  const ariaDescription = `Sensitivitätsanalyse: ${chartData.slice(0, 3).map(d => `${d.name} (Einfluss ${formatCurrency(d.impact)})`).join(', ')}`;

  const chartContent = (
    <BarChart
      data={chartData}
      layout="vertical"
      margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
      width={exportMode ? 760 : undefined}
      height={exportMode ? 300 : undefined}
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
                    <span className="font-medium text-primary-500">{formatCurrency(data.impact)}</span>
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
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">
        Einfluss der Parameter bei ±20% Variation
      </p>

      <div
        className={exportMode ? '' : 'h-64 sm:h-80'}
        role="img"
        aria-label={ariaDescription}
      >
        {exportMode ? chartContent : (
          <ResponsiveContainer width="100%" height="100%">
            {chartContent}
          </ResponsiveContainer>
        )}
      </div>

      {/* Screen-reader accessible data table */}
      <table className="sr-only">
        <caption>Sensitivitätsanalyse – Einfluss bei ±20% Variation</caption>
        <thead>
          <tr>
            <th scope="col">Parameter</th>
            <th scope="col">Bei -20%</th>
            <th scope="col">Basis</th>
            <th scope="col">Bei +20%</th>
            <th scope="col">Gesamteinfluss</th>
          </tr>
        </thead>
        <tbody>
          {chartData.map((d) => (
            <tr key={d.parameter}>
              <td>{d.name}</td>
              <td>{formatCurrency(d.lowAbsolute)}</td>
              <td>{formatCurrency(d.base)}</td>
              <td>{formatCurrency(d.highAbsolute)}</td>
              <td>{formatCurrency(d.impact)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legende */}
      {!exportMode && (
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded opacity-70" style={{ background: 'repeating-linear-gradient(45deg, #EF4444, #EF4444 2px, #FCA5A5 2px, #FCA5A5 4px)' }} />
            <span className="text-gray-600">-20% (Wertminderung)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded opacity-70" />
            <span className="text-gray-600">+20% (Wertsteigerung)</span>
          </div>
        </div>
      )}

      {/* Erläuterung für Nicht-Fachkundige */}
      {!exportMode && (
        <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-start space-x-2">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900 mb-2">So lesen Sie diese Grafik</h4>
              <div className="space-y-2 text-xs text-blue-800">
                <p>
                  <strong>Was zeigt die Sensitivitätsanalyse?</strong> Sie zeigt, welche Eingabeparameter
                  den größten Einfluss auf den berechneten Immobilienwert haben.
                </p>
                <p>
                  <strong>Je länger der Balken, desto wichtiger der Parameter.</strong> Parameter ganz
                  oben haben den größten Einfluss auf das Ergebnis – hier lohnt es sich, besonders
                  sorgfältig zu schätzen.
                </p>
                <p>
                  <strong>Rot vs. Grün:</strong> Der rote Bereich zeigt, wie der Immobilienwert sinkt,
                  wenn der Parameter um 20% fällt. Der grüne Bereich zeigt den Anstieg bei +20%.
                </p>
                <p>
                  <strong>Praktischer Nutzen:</strong> Konzentrieren Sie Ihre Recherche auf die Parameter
                  mit den längsten Balken. Kleine Fehler bei diesen Werten haben große Auswirkungen
                  auf die Bewertung.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
