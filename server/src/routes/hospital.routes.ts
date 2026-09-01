import { Router, Response } from 'express';
import { prisma } from '../db/prisma.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware.js';
import { emitGlobal } from '../realtime/socket.js';

const router = Router();

// GET /api/hospital/overview
router.get('/overview', async (_req, res) => {
  try {
    const [patientCount, doctorCount, appointmentCount, bedCount, occupiedBeds] = await Promise.all([
      prisma.patient.count(),
      prisma.doctor.count(),
      prisma.appointment.count(),
      prisma.bed.count(),
      prisma.bed.count({ where: { status: 'OCCUPIED' } })
    ]);

    res.json({
      success: true,
      stats: {
        totalPatients: patientCount,
        totalDoctors: doctorCount,
        totalAppointments: appointmentCount,
        totalBeds: bedCount,
        occupiedBeds,
        availableBeds: bedCount - occupiedBeds
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/hospital/beds
router.get('/beds', async (_req, res) => {
  try {
    const beds = await prisma.bed.findMany({
      include: {
        room: { include: { department: true } },
        admissions: {
          where: { status: 'ACTIVE' },
          include: { patient: { include: { user: true } } }
        }
      }
    });

    res.json({
      success: true,
      beds: beds.map(b => ({
        id: b.id,
        bedNumber: b.bedNumber,
        roomNumber: b.room.roomNumber,
        roomType: b.room.roomType,
        department: b.room.department.name,
        status: b.status,
        currentPatient: b.admissions[0] ? `${b.admissions[0].patient.user.firstName} ${b.admissions[0].patient.user.lastName}` : null
      }))
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/hospital/emergency
router.post('/emergency', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { title, details, severity } = req.body;
    emitGlobal('emergency_alert', {
      title: title || 'EMERGENCY MEDICAL CODE',
      details: details || 'Immediate trauma assistance required.',
      severity: severity || 'CRITICAL',
      timestamp: new Date().toISOString()
    });

    res.json({ success: true, message: 'Emergency broadcast dispatched.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/hospital/audit-logs
router.get('/audit-logs', authMiddleware, async (_req: AuthRequest, res: Response) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: { user: { select: { firstName: true, lastName: true, roleName: true } } },
      orderBy: { timestamp: 'desc' },
      take: 50
    });

    res.json({
      success: true,
      logs: logs.map(l => ({
        id: l.id,
        user: l.user ? `${l.user.firstName} ${l.user.lastName} (${l.user.roleName})` : 'System',
        action: l.action,
        resource: l.resource,
        details: l.details,
        timestamp: l.timestamp
      }))
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
