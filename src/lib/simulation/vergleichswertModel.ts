import { VergleichswertParams, PropertyData } from '../../types';
import { sampleDistribution } from '../distributions';

/**
 * Vergleichswertverfahren (ImmoWertV-konform)
 *
 * Berechnet den Immobilienwert basierend auf vergleichbaren Transaktionen.
 * Formel gemäß ImmoWertV: Wert = Basispreis × Fläche × (1 + Σ Anpassungen)
 *
 * Die Anpassungen werden als Prozent-Zu-/Abschläge addiert (nicht multipliziert).
 * Beispiel: Lage +5%, Zustand -10%, Ausstattung +3%, Markt 0% = Gesamtanpassung -2%
 */
export function calculateVergleichswertValue(
  property: PropertyData,
  params: VergleichswertParams
): number {
  // Parameter samplen
  const basePricePerSqm = sampleDistribution(params.basePricePerSqm);
  const locationAdj = sampleDistribution(params.locationAdjustment) / 100; // In Dezimal
  const conditionAdj = sampleDistribution(params.conditionAdjustment) / 100;
  const equipmentAdj = sampleDistribution(params.equipmentAdjustment) / 100;
  const marketAdj = sampleDistribution(params.marketAdjustment) / 100;

  // Basiswert
  const baseValue = basePricePerSqm * property.area;

  // Gesamtanpassung additiv (ImmoWertV-konform)
  const totalAdjustment = locationAdj + conditionAdj + equipmentAdj + marketAdj;

  // Angepasster Wert: Basiswert × (1 + Summe der Anpassungen)
  const adjustedValue = baseValue * (1 + totalAdjustment);

  return Math.max(0, adjustedValue);
}

/**
 * Detaillierte Berechnung mit allen Zwischenwerten (für Analyse)
 */
export function calculateVergleichswertDetailed(
  property: PropertyData,
  samples: {
    basePricePerSqm: number;
    locationAdjustment: number; // in %
    conditionAdjustment: number; // in %
    equipmentAdjustment: number; // in %
    marketAdjustment: number; // in %
  }
): {
  baseValue: number;
  totalAdjustmentPercent: number;
  adjustedPricePerSqm: number;
  finalValue: number;
  breakdown: {
    location: number;
    condition: number;
    equipment: number;
    market: number;
  };
} {
  const { basePricePerSqm, locationAdjustment, conditionAdjustment, equipmentAdjustment, marketAdjustment } = samples;

  // Basiswert
  const baseValue = basePricePerSqm * property.area;

  // Gesamtanpassung in Prozent (addiert)
  const totalAdjustmentPercent = locationAdjustment + conditionAdjustment + equipmentAdjustment + marketAdjustment;

  // Angepasster Quadratmeterpreis
  const adjustedPricePerSqm = basePricePerSqm * (1 + totalAdjustmentPercent / 100);

  // Endwert
  const finalValue = adjustedPricePerSqm * property.area;

  return {
    baseValue,
    totalAdjustmentPercent,
    adjustedPricePerSqm,
    finalValue: Math.max(0, finalValue),
    breakdown: {
      location: locationAdjustment,
      condition: conditionAdjustment,
      equipment: equipmentAdjustment,
      market: marketAdjustment,
    },
  };
}

/**
 * Berechnet typische Anpassungen basierend auf Objekteigenschaften
 * Gibt Prozent-Werte zurück (z.B. -10 für -10%)
 */
export function suggestAdjustments(property: PropertyData): {
  suggestedConditionAdjustment: { min: number; mode: number; max: number };
  suggestedEquipmentAdjustment: { min: number; mode: number; max: number };
} {
  const currentYear = new Date().getFullYear();
  const age = currentYear - property.yearBuilt;

  // Zustandsanpassung basierend auf Alter (in %)
  let conditionMode = 0;
  if (age < 5) conditionMode = 10; // +10% Zuschlag
  else if (age < 10) conditionMode = 5;
  else if (age < 20) conditionMode = 0;
  else if (age < 40) conditionMode = -5;
  else conditionMode = -15; // -15% Abschlag

  // Ausstattungsanpassung basierend auf Objekttyp (in %)
  let equipmentMode = 0;
  if (property.propertyType === 'gewerbe') equipmentMode = 5;
  else if (property.propertyType === 'mehrfamilienhaus') equipmentMode = -5;

  return {
    suggestedConditionAdjustment: {
      min: conditionMode - 10,
      mode: conditionMode,
      max: conditionMode + 10,
    },
    suggestedEquipmentAdjustment: {
      min: equipmentMode - 10,
      mode: equipmentMode,
      max: equipmentMode + 10,
    },
  };
}
