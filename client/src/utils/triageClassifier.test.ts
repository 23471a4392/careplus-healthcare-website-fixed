import { classifyEmergencyTriage } from './triageClassifier';

describe('triageClassifier', () => {
  test('Level 1 Resuscitation on cardiac arrest', () => {
    const res = classifyEmergencyTriage('Suspected cardiac arrest, unresponsive');
    expect(res.level).toBe(1);
    expect(res.acuity).toBe('Resuscitation');
    expect(res.targetResponseTimeMinutes).toBe(0);
  });

  test('Level 2 Emergent on acute chest pain', () => {
    const res = classifyEmergencyTriage('Radiating chest pain and shortness of breath');
    expect(res.level).toBe(2);
    expect(res.acuity).toBe('Emergent');
  });

  test('Level 3 Urgent on acute abdominal pain', () => {
    const res = classifyEmergencyTriage('Severe abdominal pain and fever');
    expect(res.level).toBe(3);
    expect(res.acuity).toBe('Urgent');
  });

  test('Level 5 Non-urgent on routine check', () => {
    const res = classifyEmergencyTriage('General follow-up consultation');
    expect(res.level).toBe(5);
    expect(res.acuity).toBe('Non-urgent');
  });
});
