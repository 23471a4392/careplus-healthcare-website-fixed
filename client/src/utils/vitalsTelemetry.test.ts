import { classifyBloodPressure, evaluateHeartRate, evaluateOxygenSaturation } from './vitalsTelemetry';

describe('vitalsTelemetry', () => {
  test('classifyBloodPressure normal range', () => {
    const res = classifyBloodPressure('118/76');
    expect(res.category).toBe('Normal');
    expect(res.systolic).toBe(118);
  });

  test('classifyBloodPressure stage 1 hypertension', () => {
    const res = classifyBloodPressure('134/84');
    expect(res.category).toBe('Hypertension Stage 1');
  });

  test('evaluateHeartRate normal', () => {
    const res = evaluateHeartRate(72);
    expect(res.status).toBe('Optimal');
  });

  test('evaluateOxygenSaturation normal', () => {
    const res = evaluateOxygenSaturation(98);
    expect(res.status).toBe('Optimal');
  });
});
