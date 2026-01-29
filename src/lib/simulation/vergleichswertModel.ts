import { VergleichswertParams, PropertyData } from '../../types';
import { sampleDistribution } from '../distributions';

/**
 * Vergleichswertverfahren
 *
 * Berechnet den Immobilienwert basierend auf vergleichbaren Transaktionen.
 * Formel: Wert = Basispreis × Fläche × Lagefaktor × Zustandsfaktor × Ausstattungsfaktor × Marktanpassung
 */
export function calculateVergleichswertValue(
  property: PropertyData,
  params: VergleichswertParams
): number {
  // Parameter samplen
  const basePricePerSqm = sampleDistribution(params.basePricePerSqm);
  const locationFactor = sampleDistribution(params.locationFactor);
  const conditionFactor = sampleDistribution(params.conditionFactor);
  const equipmentFactor = sampleDistribution(params.equipmentFactor);
  const marketAdjustmentFactor = sampleDistribution(params.marketAdjustmentFactor);

  // Basiswert
  const baseValue = basePricePerSqm * property.area;

  // Angepasster Wert
  const adjustedValue = baseValue
    * locationFactor
    * conditionFactor
    * equipmentFactor
    * marketAdjustmentFactor;

  return Math.max(0, adjustedValue);
}

/**
 * Detaillierte Berechnung mit allen Zwischenwerten (für Analyse)
 */
export function calculateVergleichswertDetailed(
  property: PropertyData,
  samples: {
    basePricePerSqm: number;
    locationFactor: number;
    conditionFactor: number;
    equipmentFactor: number;
    marketAdjustmentFactor: number;
  }
): {
  baseValue: number;
  afterLocation: number;
  afterCondition: number;
  afterEquipment: number;
  finalValue: number;
  totalAdjustment: number;
} {
  const { basePricePerSqm, locationFactor, conditionFactor, equipmentFactor, marketAdjustmentFactor } = samples;

  const baseValue = basePricePerSqm * property.area;
  const afterLocation = baseValue * locationFactor;
  const afterCondition = afterLocation * conditionFactor;
  const afterEquipment = afterCondition * equipmentFactor;
  const finalValue = afterEquipment * marketAdjustmentFactor;

  const totalAdjustment = locationFactor * conditionFactor * equipmentFactor * marketAdjustmentFactor;

  return {
    baseValue,
    afterLocation,
    afterCondition,
    afterEquipment,
    finalValue: Math.max(0, finalValue),
    totalAdjustment,
  };
}

/**
 * Berechnet typische Anpassungsfaktoren basierend auf Objekteigenschaften
 */
export function suggestAdjustmentFactors(property: PropertyData): {
  suggestedConditionFactor: { min: number; mode: number; max: number };
  suggestedEquipmentFactor: { min: number; mode: number; max: number };
} {
  const currentYear = new Date().getFullYear();
  const age = currentYear - property.yearBuilt;

  // Zustandsfaktor basierend auf Alter
  let conditionMode = 1.0;
  if (age < 5) conditionMode = 1.1;
  else if (age < 10) conditionMode = 1.05;
  else if (age < 20) conditionMode = 1.0;
  else if (age < 40) conditionMode = 0.95;
  else conditionMode = 0.85;

  // Ausstattungsfaktor basierend auf Objekttyp
  let equipmentMode = 1.0;
  if (property.propertyType === 'gewerbe') equipmentMode = 1.05;
  else if (property.propertyType === 'mehrfamilienhaus') equipmentMode = 0.95;

  return {
    suggestedConditionFactor: {
      min: conditionMode - 0.1,
      mode: conditionMode,
      max: conditionMode + 0.1,
    },
    suggestedEquipmentFactor: {
      min: equipmentMode - 0.1,
      mode: equipmentMode,
      max: equipmentMode + 0.1,
    },
  };
}
