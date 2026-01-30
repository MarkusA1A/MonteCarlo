import { useMemo } from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Input } from '../ui/Input';
import { NumericInput } from '../ui/NumericInput';
import { Select } from '../ui/Select';
import { PropertyData } from '../../types';

// Validierungsfunktion für Objektdaten
function validateProperty(property: PropertyData): Record<string, string> {
  const errors: Record<string, string> = {};
  const currentYear = new Date().getFullYear();

  if (!property.name.trim()) {
    errors.name = 'Bezeichnung erforderlich';
  }
  if (property.area <= 0) {
    errors.area = 'Muss > 0 sein';
  }
  if (property.yearBuilt < 1800 || property.yearBuilt > currentYear) {
    errors.yearBuilt = `Muss zwischen 1800 und ${currentYear} liegen`;
  }
  if (property.numberOfUnits < 1) {
    errors.numberOfUnits = 'Muss ≥ 1 sein';
  }

  return errors;
}

export function PropertyForm() {
  const { params, setPropertyData } = useSimulationStore();
  const { property } = params;
  const errors = useMemo(() => validateProperty(property), [property]);

  const propertyTypes = [
    { value: 'wohnung', label: 'Eigentumswohnung' },
    { value: 'haus', label: 'Einfamilienhaus' },
    { value: 'mehrfamilienhaus', label: 'Mehrfamilienhaus' },
    { value: 'gewerbe', label: 'Gewerbeimmobilie' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Objektdaten</CardTitle>
        <CardDescription>
          Grundlegende Informationen zur Immobilie
        </CardDescription>
      </CardHeader>

      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Objektbezeichnung"
            value={property.name}
            onChange={(e) => setPropertyData({ name: e.target.value })}
            placeholder="z.B. Wohnung Maxvorstadt"
            className="sm:col-span-2"
            error={errors.name}
          />

          <Input
            label="Adresse"
            value={property.address}
            onChange={(e) => setPropertyData({ address: e.target.value })}
            placeholder="Straße, PLZ Ort"
            className="sm:col-span-2"
          />

          <Select
            label="Objektart"
            options={propertyTypes}
            value={property.propertyType}
            onChange={(e) => setPropertyData({ propertyType: e.target.value as typeof property.propertyType })}
          />

          <NumericInput
            label="Baujahr"
            value={property.yearBuilt}
            onChange={(val) => setPropertyData({ yearBuilt: Math.round(val) })}
            defaultValue={2000}
            min={1800}
            max={new Date().getFullYear()}
            error={errors.yearBuilt}
          />

          <NumericInput
            label="Nutzfläche"
            value={property.area}
            onChange={(val) => setPropertyData({ area: val })}
            suffix="m²"
            defaultValue={1}
            min={1}
            error={errors.area}
          />

          <NumericInput
            label="Anzahl Einheiten"
            value={property.numberOfUnits}
            onChange={(val) => setPropertyData({ numberOfUnits: Math.round(val) })}
            defaultValue={1}
            min={1}
            hint="Bei Mehrfamilienhäusern"
            error={errors.numberOfUnits}
          />
        </div>

        {/* Zusammenfassung */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Zusammenfassung</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className="text-gray-500">Alter:</div>
            <div className="text-gray-900 font-medium">
              {new Date().getFullYear() - property.yearBuilt} Jahre
            </div>
            <div className="text-gray-500">Preis/m² (Marktdurchschnitt):</div>
            <div className="text-gray-900 font-medium">
              {params.vergleichswert.basePricePerSqm.params.mean?.toLocaleString('de-DE')} €
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
