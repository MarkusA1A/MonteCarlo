import { useSimulationStore } from '../../store/simulationStore';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

export function PropertyForm() {
  const { params, setPropertyData } = useSimulationStore();
  const { property } = params;

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
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Objektbezeichnung"
            value={property.name}
            onChange={(e) => setPropertyData({ name: e.target.value })}
            placeholder="z.B. Wohnung Maxvorstadt"
            className="col-span-2"
          />

          <Input
            label="Adresse"
            value={property.address}
            onChange={(e) => setPropertyData({ address: e.target.value })}
            placeholder="Straße, PLZ Ort"
            className="col-span-2"
          />

          <Select
            label="Objektart"
            options={propertyTypes}
            value={property.propertyType}
            onChange={(e) => setPropertyData({ propertyType: e.target.value as typeof property.propertyType })}
          />

          <Input
            label="Baujahr"
            type="number"
            value={property.yearBuilt}
            onChange={(e) => setPropertyData({ yearBuilt: parseInt(e.target.value) || 2000 })}
            min={1800}
            max={new Date().getFullYear()}
          />

          <Input
            label="Wohnfläche"
            type="number"
            value={property.area}
            onChange={(e) => setPropertyData({ area: parseFloat(e.target.value) || 0 })}
            suffix="m²"
            min={1}
          />

          <Input
            label="Anzahl Einheiten"
            type="number"
            value={property.numberOfUnits}
            onChange={(e) => setPropertyData({ numberOfUnits: parseInt(e.target.value) || 1 })}
            min={1}
            hint="Bei Mehrfamilienhäusern"
          />
        </div>

        {/* Zusammenfassung */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Zusammenfassung</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
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
