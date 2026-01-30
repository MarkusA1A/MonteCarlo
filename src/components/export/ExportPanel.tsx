import { useState } from 'react';
import { FileText, Download, Printer, FileSpreadsheet } from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../lib/statistics';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export function ExportPanel() {
  const { results } = useSimulationStore();
  const [isExporting, setIsExporting] = useState(false);

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

  const { params, combinedStats, mieteinnahmenStats, vergleichswertStats, dcfStats } = results;

  const exportToPDF = async () => {
    setIsExporting(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 20;

      // Header
      doc.setFontSize(20);
      doc.setTextColor(0, 102, 255);
      doc.text('Immobilienbewertung', pageWidth / 2, y, { align: 'center' });
      y += 8;
      doc.setFontSize(12);
      doc.setTextColor(107, 114, 128);
      doc.text('Monte-Carlo-Simulation', pageWidth / 2, y, { align: 'center' });
      y += 15;

      // Objektdaten
      doc.setFontSize(14);
      doc.setTextColor(26, 26, 26);
      doc.text('Objektdaten', 20, y);
      y += 8;

      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      const propertyInfo = [
        [`Bezeichnung: ${params.property.name}`],
        [`Adresse: ${params.property.address}`],
        [`Fläche: ${params.property.area} m²`],
        [`Baujahr: ${params.property.yearBuilt}`],
        [`Simulationen: ${params.numberOfSimulations.toLocaleString('de-DE')}`],
        [`Datum: ${new Date(results.runDate).toLocaleDateString('de-DE')}`],
      ];

      propertyInfo.forEach((line) => {
        doc.text(line[0], 20, y);
        y += 5;
      });
      y += 10;

      // Hauptergebnisse
      doc.setFontSize(14);
      doc.setTextColor(26, 26, 26);
      doc.text('Bewertungsergebnis (Kombiniert)', 20, y);
      y += 8;

      doc.setFontSize(10);
      const mainResults = [
        ['Mittelwert:', formatCurrency(combinedStats.mean)],
        ['Median:', formatCurrency(combinedStats.median)],
        ['Standardabweichung:', formatCurrency(combinedStats.stdDev)],
        ['10. Perzentil (pessimistisch):', formatCurrency(combinedStats.percentile10)],
        ['90. Perzentil (optimistisch):', formatCurrency(combinedStats.percentile90)],
        ['Minimum:', formatCurrency(combinedStats.min)],
        ['Maximum:', formatCurrency(combinedStats.max)],
      ];

      mainResults.forEach((row) => {
        doc.setTextColor(107, 114, 128);
        doc.text(row[0], 20, y);
        doc.setTextColor(26, 26, 26);
        doc.text(row[1], 100, y);
        y += 5;
      });
      y += 10;

      // Einzelne Methoden
      if (mieteinnahmenStats || vergleichswertStats || dcfStats) {
        doc.setFontSize(14);
        doc.setTextColor(26, 26, 26);
        doc.text('Ergebnisse nach Methode', 20, y);
        y += 8;

        doc.setFontSize(10);

        if (mieteinnahmenStats) {
          doc.setTextColor(0, 102, 255);
          doc.text('Ertragswertverfahren:', 20, y);
          y += 5;
          doc.setTextColor(107, 114, 128);
          doc.text(`  Mittelwert: ${formatCurrency(mieteinnahmenStats.mean)}`, 20, y);
          y += 4;
          doc.text(`  P10-P90: ${formatCurrency(mieteinnahmenStats.percentile10)} - ${formatCurrency(mieteinnahmenStats.percentile90)}`, 20, y);
          y += 6;
        }

        if (vergleichswertStats) {
          doc.setTextColor(139, 92, 246);
          doc.text('Vergleichswertverfahren:', 20, y);
          y += 5;
          doc.setTextColor(107, 114, 128);
          doc.text(`  Mittelwert: ${formatCurrency(vergleichswertStats.mean)}`, 20, y);
          y += 4;
          doc.text(`  P10-P90: ${formatCurrency(vergleichswertStats.percentile10)} - ${formatCurrency(vergleichswertStats.percentile90)}`, 20, y);
          y += 6;
        }

        if (dcfStats) {
          doc.setTextColor(16, 185, 129);
          doc.text('DCF-Modell:', 20, y);
          y += 5;
          doc.setTextColor(107, 114, 128);
          doc.text(`  Mittelwert: ${formatCurrency(dcfStats.mean)}`, 20, y);
          y += 4;
          doc.text(`  P10-P90: ${formatCurrency(dcfStats.percentile10)} - ${formatCurrency(dcfStats.percentile90)}`, 20, y);
          y += 10;
        }
      }

      // Sensitivitätsanalyse
      if (results.sensitivityAnalysis.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(26, 26, 26);
        doc.text('Sensitivitätsanalyse (Top 5 Parameter)', 20, y);
        y += 8;

        doc.setFontSize(10);
        results.sensitivityAnalysis.slice(0, 5).forEach((item, index) => {
          doc.setTextColor(107, 114, 128);
          doc.text(`${index + 1}. ${item.label}`, 20, y);
          doc.setTextColor(26, 26, 26);
          doc.text(`Einfluss: ${formatCurrency(item.impact)}`, 100, y);
          y += 5;
        });
      }

      // Grafiken auf neuer Seite
      const addChartToPage = async (elementId: string, title: string) => {
        const element = document.getElementById(elementId);
        if (!element) return;

        doc.addPage();
        const pageHeight = doc.internal.pageSize.getHeight();

        // Titel
        doc.setFontSize(14);
        doc.setTextColor(26, 26, 26);
        doc.text(title, 20, 20);

        try {
          const canvas = await html2canvas(element, {
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false,
          });

          const imgData = canvas.toDataURL('image/png');
          const imgWidth = pageWidth - 40;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          const maxHeight = pageHeight - 50;
          const finalHeight = Math.min(imgHeight, maxHeight);

          doc.addImage(imgData, 'PNG', 20, 30, imgWidth, finalHeight);
        } catch (err) {
          console.error(`Fehler beim Erfassen von ${elementId}:`, err);
        }
      };

      // Charts hinzufügen
      await addChartToPage('chart-histogram', 'Verteilung der Immobilienwerte');
      await addChartToPage('chart-method-comparison', 'Methodenvergleich');
      await addChartToPage('chart-tornado', 'Sensitivitätsanalyse');

      // Footer auf letzter Seite
      const lastPageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text('Erstellt mit ImmoValue - Monte-Carlo Immobilienbewertung', pageWidth / 2, lastPageHeight - 10, { align: 'center' });

      // Speichern
      doc.save(`Immobilienbewertung_${params.property.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF Export Fehler:', error);
    } finally {
      setIsExporting(false);
    }
  };

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
    window.print();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Export & Druck</CardTitle>
          <CardDescription>
            Exportieren Sie Ihre Simulationsergebnisse in verschiedenen Formaten
          </CardDescription>
        </CardHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ExportOption
            icon={FileText}
            title="PDF-Bericht"
            description="Professioneller Bericht mit allen Ergebnissen"
            buttonText="PDF erstellen"
            onClick={exportToPDF}
            isLoading={isExporting}
          />

          <ExportOption
            icon={FileSpreadsheet}
            title="CSV-Export"
            description="Rohdaten für Excel oder weitere Analyse"
            buttonText="CSV herunterladen"
            onClick={exportToCSV}
          />

          <ExportOption
            icon={Printer}
            title="Drucken"
            description="Aktuelle Ansicht drucken"
            buttonText="Drucken"
            onClick={handlePrint}
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
    </div>
  );
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
