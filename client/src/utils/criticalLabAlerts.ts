export interface CriticalLabAlert {
  testCode: string;
  parameter: string;
  observedValue: number;
  criticalLow?: number;
  criticalHigh?: number;
}

export function isPanicValue(alert: CriticalLabAlert): boolean {
  if (alert.criticalLow !== undefined && alert.observedValue < alert.criticalLow) return true;
  if (alert.criticalHigh !== undefined && alert.observedValue > alert.criticalHigh) return true;
  return false;
}
