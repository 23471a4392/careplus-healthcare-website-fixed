export interface VitalsTrendPoint {
  date: string;
  systolic: number;
  diastolic: number;
  heartRate: number;
}

export function calculateVitalsAverage(points: VitalsTrendPoint[]) {
  if (!points.length) return null;
  const avgSys = Math.round(points.reduce((acc, p) => acc + p.systolic, 0) / points.length);
  const avgDia = Math.round(points.reduce((acc, p) => acc + p.diastolic, 0) / points.length);
  const avgHr = Math.round(points.reduce((acc, p) => acc + p.heartRate, 0) / points.length);
  return { avgSys, avgDia, avgHr, totalRecordings: points.length };
}
