export interface BedTelemetry {
  bedNumber: string;
  ward: 'ICU' | 'CCU' | 'General Ward' | 'Observation';
  isOccupied: boolean;
  patientId?: string;
  telemetryActive: boolean;
}

export function getAvailableBeds(beds: BedTelemetry[], ward?: string): BedTelemetry[] {
  return beds.filter(b => !b.isOccupied && (!ward || b.ward === ward));
}
