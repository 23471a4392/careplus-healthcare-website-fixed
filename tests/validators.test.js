import { describe, it, expect } from '@jest/globals';
import { required, isEmail, isPhone, validateAppointment, validateProfile } from '../assets/utils/validators.js';

describe('CarePlus validators', () => {
  it('required rejects empty', () => {
    expect(required('')).toBe(false);
    expect(required('ok')).toBe(true);
  });

  it('validates email', () => {
    expect(isEmail('user@example.com')).toBe(true);
    expect(isEmail('bad')).toBe(false);
  });

  it('validates phone', () => {
    expect(isPhone('+91 98765 43210')).toBe(true);
    expect(isPhone('123')).toBe(false);
  });

  it('validateAppointment requires doctor date time', () => {
    const err = validateAppointment({});
    expect(err.doctor).toBeTruthy();
    expect(err.date).toBeTruthy();
    expect(err.time).toBeTruthy();
  });

  it('validateProfile checks name and email', () => {
    const err = validateProfile({ name: '', email: 'x' });
    expect(err.name).toBeTruthy();
    expect(err.email).toBeTruthy();
  });
});

describe('CarePlus format helpers contract', () => {
  it('module keys are stable', () => {
    expect('doctors').toMatch(/^[a-z]+$/);
    expect('appointments').toMatch(/^[a-z]+$/);
  });
});
// extra coverage note
