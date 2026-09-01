import request from 'supertest';
import { app } from '../app.js';
import { prisma } from '../db/prisma.js';

describe('CarePlus Full-Stack Server Integration Tests', () => {
  let patientToken = '';
  let doctorToken = '';
  let testDoctorId = '';
  let testPatientId = '';

  beforeAll(async () => {
    // Authenticate Patient
    const resPatient = await request(app)
      .post('/api/auth/login')
      .send({ email: 'patient@careplus.com', password: 'password123' });
    patientToken = resPatient.body.token;
    testPatientId = resPatient.body.user.patientId;

    // Authenticate Doctor
    const resDoc = await request(app)
      .post('/api/auth/login')
      .send({ email: 'doctor.arjun@careplus.com', password: 'password123' });
    doctorToken = resDoc.body.token;
    testDoctorId = resDoc.body.user.doctorId;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('1. System Health Check', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  test('2. Authentication: Reject invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'patient@careplus.com', password: 'wrongpassword' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('3. Authentication: Validate Bearer token on /api/auth/me', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${patientToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('patient@careplus.com');
    expect(res.body.user.role).toBe('PATIENT');
  });

  test('4. Security: Block unauthenticated access to appointments', async () => {
    const res = await request(app).get('/api/appointments');
    expect(res.status).toBe(401);
  });

  test('5. Doctors Catalog: List active physicians', async () => {
    const res = await request(app).get('/api/doctors');
    expect(res.status).toBe(200);
    expect(res.body.doctors.length).toBeGreaterThan(0);
    const arjun = res.body.doctors.find((d: any) => d.name.includes('Arjun Rao'));
    expect(arjun).toBeDefined();
  });

  test('6. Dynamic Availability Slots', async () => {
    const res = await request(app).get(`/api/doctors/${testDoctorId}/slots?date=2026-10-15`);
    expect(res.status).toBe(200);
    expect(res.body.slots.length).toBeGreaterThan(0);
  });

  test('7. Double-Booking Prevention Engine', async () => {
    const date = '2026-11-20';
    const timeSlot = '11:30 AM';

    // First booking
    const res1 = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        doctorId: testDoctorId,
        date,
        timeSlot,
        consultationType: 'In-person',
        reason: 'Initial consultation'
      });
    expect([201, 409]).toContain(res1.status);

    // Second booking on exact same slot MUST return 409 Conflict
    const res2 = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        doctorId: testDoctorId,
        date,
        timeSlot,
        consultationType: 'In-person',
        reason: 'Duplicate slot booking attempt'
      });
    expect(res2.status).toBe(409);
    expect(res2.body.success).toBe(false);
  });
});
