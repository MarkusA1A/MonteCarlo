import { useState, useRef, useCallback } from 'react';
import { FileText, Download, Printer, FileSpreadsheet, Info, Eye } from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../lib/statistics';
import { PrintableReport } from './PrintableReport';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Build-Information
const BUILD_INFO = {
  version: '1.0.0',
  buildDate: new Date().toISOString().split('T')[0],
  commit: '02bbb37',
};

export function ExportPanel() {
  const { results } = useSimulationStore();
  const [isExporting, setIsExporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  if (!results) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Keine Daten zum Exportieren
          </h3>
          <p className="text-sm text-gray-500">
            Führen Sie zuerst eine Simulation durch.
          </p>
        </div>
      </div>
    );
  }

  const { params, combinedStats } = results;

  const exportToPDF = useCallback(async () => {
    if (!printRef.current) return;

    setIsExporting(true);

    try {
      const element = printRef.current;

      // Element temporär sichtbar machen für html2canvas
      const originalStyle = element.getAttribute('style');
      element.style.position = 'fixed';
      element.style.top = '0';
      element.style.left = '0';
      element.style.width = '800px';
      element.style.zIndex = '9999';
      element.style.background = 'white';
      element.style.opacity = '1';

      // Warten bis das Element gerendert ist
      await new Promise(resolve => setTimeout(resolve, 300));

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: true,
        width: 800,
        windowWidth: 800,
      });

      // Element wieder verstecken
      if (originalStyle) {
        element.setAttribute('style', originalStyle);
      } else {
        element.removeAttribute('style');
      }

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth - 20; // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10; // Start 10mm from top
      let page = 1;

      // First page
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= (pageHeight - 20);

      // Add more pages if needed
      while (heightLeft > 0) {
        pdf.addPage();
        page++;
        position = -(pageHeight - 20) * (page - 1) + 10;
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= (pageHeight - 20);
      }

      // Footer on last page
      const lastPage = pdf.getNumberOfPages();
      pdf.setPage(lastPage);
      pdf.setFontSize(8);
      pdf.setTextColor(156, 163, 175);
      pdf.text(
        `Erstellt mit Monte-Carlo Immobilienbewertung v${BUILD_INFO.version}`,
        pageWidth / 2,
        pageHeight - 5,
        { align: 'center' }
      );

      pdf.save(`Immobilienbewertung_${params.property.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF Export Fehler:', error);
    } finally {
      setIsExporting(false);
    }
  }, [params.property.name]);

  const exportToCSV = () => {
    const rows = [
      ['Simulation Nr.', 'Ertragswert', 'Vergleichswert', 'DCF', 'Kombiniert'],
      ...results.rawResults.map((r, i) => [
        i + 1,
        r.mieteinnahmenValue ?? '',
        r.vergleichswertValue ?? '',
        r.dcfValue ?? '',
        r.combinedValue,
      ]),
    ];

    const csvContent = rows.map((row) => row.join(';')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Simulation_${params.property.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handlePrint = () => {
    // Öffne neues Fenster mit druckbarem Bericht
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Bitte erlauben Sie Pop-ups für diese Seite um zu drucken.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Immobilienbewertung - ${params.property.name}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #1a1a1a;
            background: white;
            padding: 20px;
          }
          .report {
            max-width: 1100px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #0066FF;
          }
          .header h1 {
            color: #0066FF;
            font-size: 28px;
            margin-bottom: 5px;
          }
          .header p {
            color: #6b7280;
            font-size: 16px;
          }
          section {
            margin-bottom: 25px;
            page-break-inside: avoid;
          }
          h2 {
            font-size: 18px;
            color: #1a1a1a;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 1px solid #e5e7eb;
          }
          .grid {
            display: grid;
            gap: 10px;
          }
          .grid-2 { grid-template-columns: repeat(2, 1fr); }
          .grid-4 { grid-template-columns: repeat(4, 1fr); }
          .grid-5 { grid-template-columns: repeat(5, 1fr); }
          .info-row {
            font-size: 14px;
          }
          .info-row .label {
            color: #6b7280;
          }
          .info-row .value {
            font-weight: 500;
            margin-left: 8px;
          }
          .highlight-box {
            background: #eff6ff;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin-bottom: 15px;
          }
          .highlight-box .label {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 5px;
          }
          .highlight-box .value {
            font-size: 32px;
            font-weight: bold;
            color: #0066FF;
          }
          .highlight-box .subtitle {
            font-size: 13px;
            color: #6b7280;
            margin-top: 8px;
          }
          .stat-box {
            background: #f9fafb;
            border-radius: 6px;
            padding: 12px;
            text-align: center;
          }
          .stat-box .label {
            font-size: 11px;
            color: #6b7280;
            margin-bottom: 4px;
          }
          .stat-box .value {
            font-size: 13px;
            font-weight: 600;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
          }
          th, td {
            padding: 8px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
          }
          th {
            color: #6b7280;
            font-weight: 500;
          }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .color-dot {
            display: inline-block;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            margin-right: 8px;
          }
          .bar-container {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 8px;
          }
          .bar-label {
            width: 120px;
            font-size: 12px;
            color: #374151;
          }
          .bar-track {
            flex: 1;
            height: 20px;
            background: #f3f4f6;
            border-radius: 4px;
            position: relative;
          }
          .bar-fill {
            height: 100%;
            border-radius: 4px;
          }
          .bar-value {
            width: 80px;
            font-size: 12px;
            text-align: right;
            font-weight: 500;
          }
          .percentile-bar {
            height: 40px;
            background: #f3f4f6;
            border-radius: 8px;
            position: relative;
            margin-bottom: 20px;
          }
          .p10-p90 {
            position: absolute;
            height: 100%;
            background: #bfdbfe;
          }
          .p25-p75 {
            position: absolute;
            height: 100%;
            background: #60a5fa;
          }
          .median-line {
            position: absolute;
            width: 3px;
            height: 100%;
            background: #0066FF;
          }
          .percentile-labels {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
          }
          .percentile-labels .item {
            text-align: center;
          }
          .percentile-labels .item .label {
            color: #6b7280;
          }
          .percentile-labels .item .value {
            font-weight: 500;
          }
          footer {
            margin-top: 40px;
            padding-top: 15px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 11px;
            color: #9ca3af;
          }
          /* Two-column layout for charts */
          .charts-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            page-break-inside: avoid;
          }
          .charts-row section {
            margin-bottom: 0;
          }
          .charts-row h2 {
            font-size: 16px;
          }
          .charts-row .bar-container {
            margin-bottom: 4px;
          }
          .charts-row .bar-label {
            width: 70px;
            font-size: 10px;
          }
          .charts-row .bar-value {
            width: 50px;
            font-size: 10px;
          }
          /* Force print colors */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          @page {
            size: A4 landscape;
            margin: 15mm;
          }
          @media print {
            body { padding: 0; }
            section { page-break-inside: avoid; }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="report">
          <div class="header">
            <h1>Immobilienbewertung</h1>
            <p>Monte-Carlo-Simulation</p>
          </div>

          <section>
            <h2>Objektdaten</h2>
            <div class="grid grid-2">
              <div class="info-row"><span class="label">Bezeichnung:</span><span class="value">${params.property.name}</span></div>
              <div class="info-row"><span class="label">Adresse:</span><span class="value">${params.property.address}</span></div>
              <div class="info-row"><span class="label">Fläche:</span><span class="value">${params.property.area} m²</span></div>
              <div class="info-row"><span class="label">Baujahr:</span><span class="value">${params.property.yearBuilt}</span></div>
              <div class="info-row"><span class="label">Simulationen:</span><span class="value">${params.numberOfSimulations.toLocaleString('de-DE')}</span></div>
              <div class="info-row"><span class="label">Datum:</span><span class="value">${new Date(results.runDate).toLocaleDateString('de-DE')}</span></div>
            </div>
          </section>

          <section>
            <h2>Bewertungsergebnis</h2>
            <div class="highlight-box">
              <div class="label">Geschätzter Immobilienwert (Mittelwert)</div>
              <div class="value">${formatCurrency(combinedStats.mean)}</div>
              <div class="subtitle">80% Wahrscheinlichkeit: ${formatCurrency(combinedStats.percentile10)} bis ${formatCurrency(combinedStats.percentile90)}</div>
            </div>
            <div class="grid grid-4">
              <div class="stat-box"><div class="label">Median</div><div class="value">${formatCurrency(combinedStats.median)}</div></div>
              <div class="stat-box"><div class="label">Standardabweichung</div><div class="value">${formatCurrency(combinedStats.stdDev)}</div></div>
              <div class="stat-box"><div class="label">Minimum</div><div class="value">${formatCurrency(combinedStats.min)}</div></div>
              <div class="stat-box"><div class="label">Maximum</div><div class="value">${formatCurrency(combinedStats.max)}</div></div>
            </div>
          </section>

          <section>
            <h2>Werteverteilung (Perzentile)</h2>
            ${generatePercentileHTML(combinedStats)}
          </section>

          ${results.mieteinnahmenStats || results.vergleichswertStats || results.dcfStats ? `
          <section>
            <h2>Methodenvergleich</h2>
            <table>
              <thead>
                <tr>
                  <th>Methode</th>
                  <th class="text-right">Mittelwert</th>
                  <th class="text-right">P10</th>
                  <th class="text-right">P90</th>
                  <th class="text-right">Spanne</th>
                </tr>
              </thead>
              <tbody>
                ${results.mieteinnahmenStats ? `
                <tr>
                  <td><span class="color-dot" style="background:#0066FF"></span>Ertragswertverfahren</td>
                  <td class="text-right">${formatCurrency(results.mieteinnahmenStats.mean)}</td>
                  <td class="text-right">${formatCurrency(results.mieteinnahmenStats.percentile10)}</td>
                  <td class="text-right">${formatCurrency(results.mieteinnahmenStats.percentile90)}</td>
                  <td class="text-right">${formatCurrency(results.mieteinnahmenStats.percentile90 - results.mieteinnahmenStats.percentile10)}</td>
                </tr>` : ''}
                ${results.vergleichswertStats ? `
                <tr>
                  <td><span class="color-dot" style="background:#8B5CF6"></span>Vergleichswertverfahren</td>
                  <td class="text-right">${formatCurrency(results.vergleichswertStats.mean)}</td>
                  <td class="text-right">${formatCurrency(results.vergleichswertStats.percentile10)}</td>
                  <td class="text-right">${formatCurrency(results.vergleichswertStats.percentile90)}</td>
                  <td class="text-right">${formatCurrency(results.vergleichswertStats.percentile90 - results.vergleichswertStats.percentile10)}</td>
                </tr>` : ''}
                ${results.dcfStats ? `
                <tr>
                  <td><span class="color-dot" style="background:#10B981"></span>DCF-Modell</td>
                  <td class="text-right">${formatCurrency(results.dcfStats.mean)}</td>
                  <td class="text-right">${formatCurrency(results.dcfStats.percentile10)}</td>
                  <td class="text-right">${formatCurrency(results.dcfStats.percentile90)}</td>
                  <td class="text-right">${formatCurrency(results.dcfStats.percentile90 - results.dcfStats.percentile10)}</td>
                </tr>` : ''}
                <tr style="font-weight:600">
                  <td><span class="color-dot" style="background:#F59E0B"></span>Kombiniert</td>
                  <td class="text-right">${formatCurrency(combinedStats.mean)}</td>
                  <td class="text-right">${formatCurrency(combinedStats.percentile10)}</td>
                  <td class="text-right">${formatCurrency(combinedStats.percentile90)}</td>
                  <td class="text-right">${formatCurrency(combinedStats.percentile90 - combinedStats.percentile10)}</td>
                </tr>
              </tbody>
            </table>
          </section>` : ''}

          <div class="charts-row">
            <section>
              <h2>Verteilung der Immobilienwerte</h2>
              ${generateHistogramHTML(results.histogram, combinedStats)}
            </section>

            ${results.sensitivityAnalysis.length > 0 ? `
            <section>
              <h2>Sensitivitätsanalyse (Top 8)</h2>
              <p style="font-size:10px;color:#6b7280;margin-bottom:10px;">Einfluss der Parameter bei ±20% Variation</p>
              ${generateSensitivityHTML(results.sensitivityAnalysis.slice(0, 8))}
            </section>` : ''}
          </div>

          <footer>
            <p>Erstellt mit Monte-Carlo Immobilienbewertung v${BUILD_INFO.version}</p>
            <p style="margin-top:5px;">© ${new Date().getFullYear()} Markus Thalhamer, MSc MRICS</p>
          </footer>
        </div>
        <script>
          // Warten bis alles gerendert ist, dann drucken
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 no-print">
      <Card>
        <CardHeader>
          <CardTitle>Export & Druck</CardTitle>
          <CardDescription>
            Exportieren Sie Ihre Simulationsergebnisse in verschiedenen Formaten
          </CardDescription>
        </CardHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ExportOption
            icon={FileText}
            title="PDF-Bericht"
            description="Vollständiger Bericht mit Grafiken"
            buttonText="PDF erstellen"
            onClick={exportToPDF}
            isLoading={isExporting}
          />

          <ExportOption
            icon={Printer}
            title="Drucken"
            description="Professionellen Bericht drucken"
            buttonText="Drucken"
            onClick={handlePrint}
          />

          <ExportOption
            icon={FileSpreadsheet}
            title="CSV-Export"
            description="Rohdaten für Excel"
            buttonText="CSV herunterladen"
            onClick={exportToCSV}
          />

          <ExportOption
            icon={Eye}
            title="Vorschau"
            description="Druckvorschau anzeigen"
            buttonText={showPreview ? 'Ausblenden' : 'Anzeigen'}
            onClick={() => setShowPreview(!showPreview)}
          />
        </div>
      </Card>

      {/* Vorschau der Zusammenfassung */}
      <Card>
        <CardHeader>
          <CardTitle>Zusammenfassung</CardTitle>
        </CardHeader>

        <div className="prose prose-sm max-w-none">
          <p className="text-gray-600">
            Die Monte-Carlo-Simulation für <strong>{params.property.name}</strong> ({params.property.address})
            wurde mit <strong>{params.numberOfSimulations.toLocaleString('de-DE')}</strong> Durchläufen durchgeführt.
          </p>

          <div className="bg-[#0066FF]/5 rounded-lg p-4 my-4">
            <p className="text-lg font-semibold text-gray-900 mb-1">
              Geschätzter Immobilienwert
            </p>
            <p className="text-3xl font-bold text-[#0066FF]">
              {formatCurrency(combinedStats.mean)}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              80% Wahrscheinlichkeit: {formatCurrency(combinedStats.percentile10)} bis {formatCurrency(combinedStats.percentile90)}
            </p>
          </div>

          <p className="text-gray-600">
            Die Bewertung basiert auf {[params.mieteinnahmen.enabled, params.vergleichswert.enabled, params.dcf.enabled].filter(Boolean).length} aktiven Bewertungsmethoden
            {params.mieteinnahmen.enabled && ', dem Ertragswertverfahren'}
            {params.vergleichswert.enabled && ', dem Vergleichswertverfahren'}
            {params.dcf.enabled && ', dem DCF-Modell'}.
          </p>
        </div>
      </Card>

      {/* Build-Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-gray-400" />
            <CardTitle className="text-sm">Build-Information</CardTitle>
          </div>
        </CardHeader>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Version</p>
            <p className="font-medium text-gray-900">{BUILD_INFO.version}</p>
          </div>
          <div>
            <p className="text-gray-500">Build-Datum</p>
            <p className="font-medium text-gray-900">{BUILD_INFO.buildDate}</p>
          </div>
          <div>
            <p className="text-gray-500">Commit</p>
            <p className="font-medium text-gray-900 font-mono">{BUILD_INFO.commit}</p>
          </div>
        </div>
      </Card>

      {/* Druckbare Version für PDF-Export */}
      <div
        ref={printRef}
        className={showPreview ? 'border border-gray-300 rounded-lg overflow-hidden' : 'w-[800px] bg-white'}
        style={showPreview ? {} : { position: 'absolute', left: '-9999px', top: 0, visibility: 'hidden' }}
      >
        <PrintableReport results={results} />
      </div>
    </div>
  );
}

// Helper-Funktionen für Print HTML
function generatePercentileHTML(stats: any) {
  const range = stats.max - stats.min;
  const getPos = (val: number) => ((val - stats.min) / range) * 100;

  return `
    <div class="percentile-bar">
      <div class="p10-p90" style="left:${getPos(stats.percentile10)}%;width:${getPos(stats.percentile90) - getPos(stats.percentile10)}%"></div>
      <div class="p25-p75" style="left:${getPos(stats.percentile25)}%;width:${getPos(stats.percentile75) - getPos(stats.percentile25)}%"></div>
      <div class="median-line" style="left:${getPos(stats.median)}%"></div>
    </div>
    <div class="percentile-labels">
      <div class="item"><div class="label">P10</div><div class="value">${formatCurrency(stats.percentile10)}</div></div>
      <div class="item"><div class="label">P25</div><div class="value">${formatCurrency(stats.percentile25)}</div></div>
      <div class="item" style="color:#0066FF"><div class="label" style="font-weight:500">Median</div><div class="value">${formatCurrency(stats.median)}</div></div>
      <div class="item"><div class="label">P75</div><div class="value">${formatCurrency(stats.percentile75)}</div></div>
      <div class="item"><div class="label">P90</div><div class="value">${formatCurrency(stats.percentile90)}</div></div>
    </div>
  `;
}

function generateHistogramHTML(histogram: any[], stats: any) {
  const maxCount = Math.max(...histogram.map((h: any) => h.count));

  return `
    <div style="display:flex;flex-direction:column;gap:3px;">
      ${histogram.map((bin: any) => {
        const isInRange = bin.rangeStart >= stats.percentile10 && bin.rangeEnd <= stats.percentile90;
        const barWidth = (bin.count / maxCount) * 100;
        const color = isInRange ? '#60a5fa' : '#d1d5db';

        return `
          <div class="bar-container">
            <div class="bar-label">${(bin.rangeStart / 1000).toFixed(0)}k €</div>
            <div class="bar-track">
              <div class="bar-fill" style="width:${barWidth}%;background:${color}"></div>
            </div>
            <div class="bar-value">${bin.percentage.toFixed(1)}%</div>
          </div>
        `;
      }).join('')}
    </div>
    <div style="display:flex;justify-content:center;gap:20px;margin-top:15px;font-size:11px;">
      <div><span style="display:inline-block;width:12px;height:12px;background:#60a5fa;border-radius:2px;margin-right:5px;vertical-align:middle"></span>P10-P90 Bereich</div>
      <div><span style="display:inline-block;width:12px;height:12px;background:#d1d5db;border-radius:2px;margin-right:5px;vertical-align:middle"></span>Außerhalb</div>
    </div>
  `;
}

function generateSensitivityHTML(data: any[]) {
  const maxImpact = Math.max(...data.map((d: any) => d.impact));

  return `
    <div style="display:flex;flex-direction:column;gap:6px;">
      ${data.map((item: any) => {
        const barWidth = (item.impact / maxImpact) * 100;
        const lowDiff = item.lowValue - item.baseValue;
        const highDiff = item.highValue - item.baseValue;
        const total = Math.abs(lowDiff) + Math.abs(highDiff);
        const lowWidth = (Math.abs(lowDiff) / total) * barWidth / 2;
        const highWidth = (Math.abs(highDiff) / total) * barWidth / 2;

        return `
          <div class="bar-container">
            <div class="bar-label" style="width:100px">${item.label}</div>
            <div class="bar-track" style="display:flex">
              <div style="width:50%;display:flex;justify-content:flex-end">
                <div style="width:${lowWidth}%;height:100%;background:#ef4444;opacity:0.7;border-radius:4px 0 0 4px"></div>
              </div>
              <div style="width:1px;background:#9ca3af"></div>
              <div style="width:50%">
                <div style="width:${highWidth}%;height:100%;background:#10b981;opacity:0.7;border-radius:0 4px 4px 0"></div>
              </div>
            </div>
            <div class="bar-value" style="width:70px">${formatCurrency(item.impact)}</div>
          </div>
        `;
      }).join('')}
    </div>
    <div style="display:flex;justify-content:center;gap:20px;margin-top:15px;font-size:11px;">
      <div><span style="display:inline-block;width:12px;height:12px;background:#ef4444;opacity:0.7;border-radius:2px;margin-right:5px;vertical-align:middle"></span>-20% Variation</div>
      <div><span style="display:inline-block;width:12px;height:12px;background:#10b981;opacity:0.7;border-radius:2px;margin-right:5px;vertical-align:middle"></span>+20% Variation</div>
    </div>
  `;
}

function ExportOption({
  icon: Icon,
  title,
  description,
  buttonText,
  onClick,
  isLoading = false,
}: {
  icon: typeof FileText;
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
  isLoading?: boolean;
}) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-[#0066FF] transition-colors">
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-gray-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{title}</h4>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={onClick}
            isLoading={isLoading}
          >
            <Download className="w-4 h-4 mr-2" />
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
}
