import { DCFParams, PropertyData } from '../../types';
import { sampleDistribution } from '../distributions';

/**
 * DCF-Modell (Discounted Cash Flow)
 *
 * Berechnet den Immobilienwert durch Diskontierung zukünftiger Cashflows.
 * Berücksichtigt:
 * - Jährliche Mieteinnahmen über die Haltedauer
 * - Mietsteigerungen
 * - Betriebskosten
 * - Exit-Wert am Ende der Haltedauer
 */
export function calculateDCFValue(
  property: PropertyData,
  params: DCFParams
): number {
  // Parameter samplen
  const initialMonthlyRent = sampleDistribution(params.initialMonthlyRent);
  const annualRentGrowth = sampleDistribution(params.annualRentGrowth) / 100;
  const discountRate = sampleDistribution(params.discountRate) / 100;
  const exitCapRate = sampleDistribution(params.exitCapRate) / 100;
  const operatingExpenseRatio = sampleDistribution(params.operatingExpenseRatio) / 100;
  const holdingPeriod = params.holdingPeriod;

  let totalPV = 0;
  let currentAnnualRent = initialMonthlyRent * 12;

  // Diskontierte Cashflows während der Haltedauer
  for (let year = 1; year <= holdingPeriod; year++) {
    // Mietsteigerung ab Jahr 2
    if (year > 1) {
      currentAnnualRent *= (1 + annualRentGrowth);
    }

    // Net Operating Income (nach Betriebskosten)
    const noi = currentAnnualRent * (1 - operatingExpenseRatio);

    // Diskontierung
    const discountFactor = Math.pow(1 + discountRate, year);
    const presentValue = noi / discountFactor;

    totalPV += presentValue;
  }

  // Terminal Value (Exit-Wert) am Ende der Haltedauer
  // Basierend auf dem NOI des letzten Jahres
  const terminalYearNOI = currentAnnualRent * (1 + annualRentGrowth) * (1 - operatingExpenseRatio);
  const terminalValue = terminalYearNOI / exitCapRate;

  // Diskontierter Terminal Value
  const discountedTerminalValue = terminalValue / Math.pow(1 + discountRate, holdingPeriod);

  const totalValue = totalPV + discountedTerminalValue;

  return Math.max(0, totalValue);
}

/**
 * Detaillierte DCF-Berechnung mit Cashflow-Projektion
 */
export function calculateDCFDetailed(
  property: PropertyData,
  params: DCFParams,
  samples: {
    initialMonthlyRent: number;
    annualRentGrowth: number;
    discountRate: number;
    exitCapRate: number;
    operatingExpenseRatio: number;
  }
): {
  annualCashflows: Array<{
    year: number;
    grossRent: number;
    operatingExpenses: number;
    noi: number;
    discountFactor: number;
    presentValue: number;
  }>;
  terminalValue: number;
  discountedTerminalValue: number;
  totalPresentValue: number;
  propertyValue: number;
} {
  const { initialMonthlyRent, annualRentGrowth, discountRate, exitCapRate, operatingExpenseRatio } = samples;
  const holdingPeriod = params.holdingPeriod;

  const annualCashflows: Array<{
    year: number;
    grossRent: number;
    operatingExpenses: number;
    noi: number;
    discountFactor: number;
    presentValue: number;
  }> = [];

  let totalPV = 0;
  let currentAnnualRent = initialMonthlyRent * 12;

  for (let year = 1; year <= holdingPeriod; year++) {
    if (year > 1) {
      currentAnnualRent *= (1 + annualRentGrowth / 100);
    }

    const operatingExpenses = currentAnnualRent * (operatingExpenseRatio / 100);
    const noi = currentAnnualRent - operatingExpenses;
    const discountFactor = Math.pow(1 + discountRate / 100, year);
    const presentValue = noi / discountFactor;

    annualCashflows.push({
      year,
      grossRent: currentAnnualRent,
      operatingExpenses,
      noi,
      discountFactor,
      presentValue,
    });

    totalPV += presentValue;
  }

  // Terminal Value
  const nextYearRent = currentAnnualRent * (1 + annualRentGrowth / 100);
  const terminalNOI = nextYearRent * (1 - operatingExpenseRatio / 100);
  const terminalValue = terminalNOI / (exitCapRate / 100);
  const discountedTerminalValue = terminalValue / Math.pow(1 + discountRate / 100, holdingPeriod);

  return {
    annualCashflows,
    terminalValue,
    discountedTerminalValue,
    totalPresentValue: totalPV,
    propertyValue: totalPV + discountedTerminalValue,
  };
}

/**
 * Berechnet die implizite Rendite (IRR) für einen gegebenen Kaufpreis
 * Verwendet Newton-Raphson-Verfahren
 */
export function calculateIRR(
  purchasePrice: number,
  annualNOIs: number[],
  terminalValue: number,
  maxIterations: number = 100,
  tolerance: number = 0.0001
): number {
  let irr = 0.1; // Startwert 10%

  for (let i = 0; i < maxIterations; i++) {
    let npv = -purchasePrice;
    let derivative = 0;

    for (let t = 0; t < annualNOIs.length; t++) {
      const year = t + 1;
      const discountFactor = Math.pow(1 + irr, year);
      npv += annualNOIs[t] / discountFactor;
      derivative -= year * annualNOIs[t] / Math.pow(1 + irr, year + 1);
    }

    // Terminal Value im letzten Jahr
    const lastYear = annualNOIs.length;
    npv += terminalValue / Math.pow(1 + irr, lastYear);
    derivative -= lastYear * terminalValue / Math.pow(1 + irr, lastYear + 1);

    if (Math.abs(npv) < tolerance) {
      return irr;
    }

    if (derivative === 0) {
      break;
    }

    irr = irr - npv / derivative;
  }

  return irr;
}
