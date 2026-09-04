export type TriageLevel = 1 | 2 | 3 | 4 | 5;

export interface TriageResult {
  level: TriageLevel;
  acuity: 'Resuscitation' | 'Emergent' | 'Urgent' | 'Less Urgent' | 'Non-urgent';
  targetResponseTimeMinutes: number;
  color: string;
  badgeClass: string;
  recommendedBedType: 'Resuscitation Bay / ICU' | 'High Dependency Unit (HDU)' | 'Emergency Ward' | 'Observation Unit' | 'Outpatient Clinic';
}

/**
 * Evaluates patient symptoms and vitals to determine Emergency Severity Index (ESI)
 */
export function classifyEmergencyTriage(chiefComplaint: string, vitals?: { hr?: number; bpSystolic?: number; spo2?: number }): TriageResult {
  const lower = chiefComplaint.toLowerCase();

  // Level 1: Immediate life threat
  if (
    lower.includes('cardiac arrest') ||
    lower.includes('unresponsive') ||
    lower.includes('severe respiratory distress') ||
    lower.includes('anaphylaxis') ||
    (vitals?.spo2 && vitals.spo2 < 85)
  ) {
    return {
      level: 1,
      acuity: 'Resuscitation',
      targetResponseTimeMinutes: 0,
      color: '#dc2626',
      badgeClass: 'bg-red-600 text-white font-black animate-pulse',
      recommendedBedType: 'Resuscitation Bay / ICU'
    };
  }

  // Level 2: High risk situation
  if (
    lower.includes('chest pain') ||
    lower.includes('stroke') ||
    lower.includes('altered mental') ||
    lower.includes('severe burn') ||
    (vitals?.spo2 && vitals.spo2 < 90) ||
    (vitals?.hr && (vitals.hr > 130 || vitals.hr < 45))
  ) {
    return {
      level: 2,
      acuity: 'Emergent',
      targetResponseTimeMinutes: 15,
      color: '#ea580c',
      badgeClass: 'bg-orange-500 text-white font-bold',
      recommendedBedType: 'High Dependency Unit (HDU)'
    };
  }

  // Level 3: Urgent
  if (
    lower.includes('fracture') ||
    lower.includes('abdominal pain') ||
    lower.includes('high fever') ||
    lower.includes('laceration')
  ) {
    return {
      level: 3,
      acuity: 'Urgent',
      targetResponseTimeMinutes: 30,
      color: '#d97706',
      badgeClass: 'bg-amber-100 text-amber-900 border border-amber-300 font-bold',
      recommendedBedType: 'Emergency Ward'
    };
  }

  // Level 4: Less Urgent
  if (lower.includes('sprain') || lower.includes('mild headache') || lower.includes('sore throat')) {
    return {
      level: 4,
      acuity: 'Less Urgent',
      targetResponseTimeMinutes: 60,
      color: '#2563eb',
      badgeClass: 'bg-blue-100 text-blue-800 border border-blue-200 font-medium',
      recommendedBedType: 'Observation Unit'
    };
  }

  // Level 5: Non-urgent
  return {
    level: 5,
    acuity: 'Non-urgent',
    targetResponseTimeMinutes: 120,
    color: '#059669',
    badgeClass: 'bg-emerald-100 text-emerald-800 border border-emerald-200 font-medium',
    recommendedBedType: 'Outpatient Clinic'
  };
}
