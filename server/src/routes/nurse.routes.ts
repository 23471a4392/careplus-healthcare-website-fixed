import { Router, Response } from 'express';
import { prisma } from '../db/prisma.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware.js';

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

export default router;
