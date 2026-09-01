import { Router, Response } from 'express';
import { prisma } from '../db/prisma.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware.js';
import { sendNotification, emitToRole } from '../realtime/socket.js';

const router = Router();

// GET /api/nurse/patients
router.get('/patients', authMiddleware, async (_req: AuthRequest, res: Response) => {
  try {
    const admissions = await prisma.admission.findMany({
      where: { status: 'ACTIVE' },
      include: {
        patient: { include: { user: true } },
        bed: { include: { room: { include: { department: true } } } }
      }
    });

    res.json({
      success: true,
      inpatients: admissions.map(a => ({
        admissionId: a.id,
        patientName: `${a.patient.user.firstName} ${a.patient.user.lastName}`,
        patientId: a.patientId,
        gender: a.patient.gender,
        bloodGroup: a.patient.bloodGroup,
        diagnosis: a.diagnosis,
        bedNumber: a.bed.bedNumber,
        roomNumber: a.bed.room.roomNumber,
        department: a.bed.room.department.name,
        admissionDate: a.admissionDate
      }))
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/nurse/vitals
router.post('/vitals', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { patientId, pulse, bp, spo2, temp, glucose, notes } = req.body;
    let targetPatientId = patientId;

    if (!targetPatientId) {
      const p = await prisma.patient.findFirst();
      targetPatientId = p?.id;
    }

    const patient = await prisma.patient.findUnique({
      where: { id: targetPatientId },
      include: { user: true }
    });

    const summary = `Pulse: ${pulse || 72} BPM, BP: ${bp || '120/80'} mmHg, SpO2: ${spo2 || 98}%${temp ? ', Temp: ' + temp + '°F' : ''}${glucose ? ', Glucose: ' + glucose + ' mg/dL' : ''}.${notes ? ' Note: ' + notes : ''}`;

    const firstDoctor = await prisma.doctor.findFirst({ include: { user: true } });

    const record = await prisma.medicalRecord.create({
      data: {
        patientId: targetPatientId!,
        doctorId: firstDoctor!.id,
        title: 'Nursing Telemetry & Vitals Observation',
        category: 'Nursing Observation',
        date: new Date().toISOString().split('T')[0],
        facility: 'CarePlus Inpatient Ward',
        summary
      }
    });

    emitToRole('DOCTOR', 'patient_vitals_updated', {
      patientName: `${patient?.user.firstName} ${patient?.user.lastName}`,
      vitals: { pulse, bp, spo2, summary }
    });

    res.status(201).json({ success: true, vitals: record });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
