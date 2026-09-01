import { Router, Response } from 'express';
import { prisma } from '../db/prisma.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware.js';
import { sendNotification, emitToRole } from '../realtime/socket.js';

const router = Router();

// GET /api/pharmacy/prescriptions
router.get('/prescriptions', authMiddleware, async (_req: AuthRequest, res: Response) => {
  try {
    const prescriptions = await prisma.prescription.findMany({
      include: {
        doctor: { include: { user: true } },
        patient: { include: { user: true } },
        medications: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      prescriptions: prescriptions.map(p => ({
        id: p.id,
        doctor: `Dr. ${p.doctor.user.firstName} ${p.doctor.user.lastName}`,
        patient: `${p.patient.user.firstName} ${p.patient.user.lastName}`,
        patientUserId: p.patient.user.id,
        status: p.status,
        instructions: p.instructions,
        medications: p.medications,
        createdAt: p.createdAt,
        dispensedAt: p.dispensedAt
      }))
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/pharmacy/prescriptions/:id/dispense
router.post('/prescriptions/:id/dispense', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const prescription = await prisma.prescription.findUnique({
      where: { id: req.params.id },
      include: {
        medications: true,
        patient: { include: { user: true } }
      }
    });

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    const updated = await prisma.prescription.update({
      where: { id: req.params.id },
      data: {
        status: 'DISPENSED',
        dispensedAt: new Date()
      }
    });

    // Notify Patient
    await sendNotification({
      recipientId: prescription.patient.user.id,
      senderId: req.user!.id,
      type: 'MEDICATION_READY',
      title: 'Medication Ready for Pickup / Delivery',
      message: 'Your prescribed medicines have been prepared and dispensed by the pharmacy department.',
      entityType: 'prescription',
      entityId: updated.id
    });

    res.json({ success: true, prescription: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/pharmacy/inventory
router.get('/inventory', async (_req, res) => {
  try {
    const inventory = await prisma.inventory.findMany({
      orderBy: { stock: 'asc' }
    });
    res.json({ success: true, inventory });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
