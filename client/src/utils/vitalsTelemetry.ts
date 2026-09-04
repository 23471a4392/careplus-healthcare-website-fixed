export interface BloodPressureResult {
  systolic: number;
  diastolic: number;
  category: 'Normal' | 'Elevated' | 'Hypertension Stage 1' | 'Hypertension Stage 2' | 'Hypertensive Crisis';
  color: string;
  badgeClass: string;
}

export interface VitalStatus {
  value: number;
  unit: string;
  status: 'Low' | 'Optimal' | 'High' | 'Critical';
  color: string;
}

/**
 * Classifies blood pressure according to standard clinical guidelines (AHA/ACC)
 */
export function classifyBloodPressure(bpString: string): BloodPressureResult {
  const parts = bpString.split('/').map((s) => parseInt(s.trim(), 10));
  const systolic = parts[0] || 120;
  const diastolic = parts[1] || 80;

  if (systolic > 180 || diastolic > 120) {
    return {
      systolic,
      diastolic,
      category: 'Hypertensive Crisis',
      color: '#dc2626',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-200'
    };
  }

  if (systolic >= 140 || diastolic >= 90) {
    return {
      systolic,
      diastolic,
      category: 'Hypertension Stage 2',
      color: '#ea580c',
      badgeClass: 'bg-orange-100 text-orange-800 border-orange-200'
    };
  }

  if (systolic >= 130 || diastolic >= 80) {
    return {
      systolic,
      diastolic,
      category: 'Hypertension Stage 1',
      color: '#d97706',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-200'
    };
  }

  if (systolic >= 120 && diastolic < 80) {
    return {
      systolic,
      diastolic,
      category: 'Elevated',
      color: '#2563eb',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-200'
    };
  }

  return {
    systolic,
    diastolic,
    category: 'Normal',
    color: '#059669',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  };
}

/**
 * Evaluates pulse heart rate (bpm)
 */
export function evaluateHeartRate(bpm: number): VitalStatus {
  if (bpm < 60) return { value: bpm, unit: 'bpm', status: 'Low', color: '#3b82f6' };
  if (bpm <= 100) return { value: bpm, unit: 'bpm', status: 'Optimal', color: '#10b981' };
  if (bpm <= 120) return { value: bpm, unit: 'bpm', status: 'High', color: '#f59e0b' };
  return { value: bpm, unit: 'bpm', status: 'Critical', color: '#ef4444' };
}

/**
 * Evaluates blood oxygen saturation (% SpO2)
 */
export function evaluateOxygenSaturation(spo2: number): VitalStatus {
  if (spo2 >= 95) return { value: spo2, unit: '%', status: 'Optimal', color: '#10b981' };
  if (spo2 >= 90) return { value: spo2, unit: '%', status: 'Low', color: '#f59e0b' };
  return { value: spo2, unit: '%', status: 'Critical', color: '#ef4444' };
}
