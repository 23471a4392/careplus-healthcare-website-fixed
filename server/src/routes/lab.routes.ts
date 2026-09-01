import { Router, Response } from 'express';
import { prisma } from '../db/prisma.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware.js';
import { sendNotification, emitToRole, emitToUser } from '../realtime/socket.js';

const router = Router();

// GET /api/labs/catalog
router.get('/catalog', async (_req, res) => {
  try {
    const tests = await prisma.labTest.findMany();
    res.json({ success: true, tests });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/labs/orders
router.get('/orders', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { role, patientId, doctorId } = req.user!;
    let whereClause: any = {};

    if (role === 'PATIENT') whereClause.patientId = patientId;
    if (role === 'DOCTOR') whereClause.doctorId = doctorId;

    const orders = await prisma.labResult.findMany({
      where: whereClause,
      include: {
        test: true,
        patient: { include: { user: true } },
        doctor: { include: { user: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      orders: orders.map(o => ({
        id: o.id,
        testName: o.test.name,
        category: o.test.category,
        patientName: `${o.patient.user.firstName} ${o.patient.user.lastName}`,
        patientUserId: o.patient.user.id,
        doctorName: `Dr. ${o.doctor.user.firstName} ${o.doctor.user.lastName}`,
        doctorUserId: o.doctor.user.id,
        status: o.status,
        collectionDate: o.collectionDate,
        sampleMode: o.sampleMode,
        resultSummary: o.resultSummary,
        createdAt: o.createdAt
      }))
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/labs/orders
router.post('/orders', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { testId, patientId, sampleMode, collectionDate } = req.body;
    let effectiveDoctorId = req.user?.doctorId;

    if (!effectiveDoctorId) {
      // Patient self-booking -> assign to chief doctor
      const firstDoc = await prisma.doctor.findFirst();
      effectiveDoctorId = firstDoc?.id;
    }

    const test = await prisma.labTest.findUnique({ where: { id: testId } });
    const patient = await prisma.patient.findUnique({
      where: { id: patientId || req.user?.patientId },
      include: { user: true }
    });

    if (!test || !patient) {
      return res.status(400).json({ success: false, message: 'Invalid test or patient' });
    }

    const order = await prisma.labResult.create({
      data: {
        testId,
        patientId: patient.id,
        doctorId: effectiveDoctorId!,
        sampleMode: sampleMode || 'Home Collection',
        collectionDate: collectionDate || new Date().toISOString().split('T')[0],
        status: 'REQUESTED'
      }
    });

    // Real-time alert to LAB_TECHNICIAN role
    emitToRole('LAB_TECHNICIAN', 'new_lab_request', {
      orderId: order.id,
      testName: test.name,
      patientName: `${patient.user.firstName} ${patient.user.lastName}`
    });

    res.status(201).json({ success: true, order });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/labs/orders/:id/status
router.patch('/orders/:id/status', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { status, resultSummary } = req.body;
    const order = await prisma.labResult.findUnique({
      where: { id: req.params.id },
      include: {
        test: true,
        patient: { include: { user: true } },
        doctor: { include: { user: true } }
      }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Lab order not found' });
    }

    const updated = await prisma.labResult.update({
      where: { id: req.params.id },
      data: {
        status,
        resultSummary: resultSummary || order.resultSummary,
        completedAt: status === 'COMPLETED' ? new Date() : undefined
      }
    });

    // When completed, dispatch to Doctor AND Patient
    if (status === 'COMPLETED') {
      const msg = `Lab results for ${order.test.name} have been processed and uploaded.`;
      await sendNotification({
        recipientId: order.patient.user.id,
        senderId: req.user!.id,
        type: 'LAB_REPORT_READY',
        title: 'Diagnostic Lab Report Ready',
        message: msg,
        entityType: 'lab_result',
        entityId: updated.id
      });

      await sendNotification({
        recipientId: order.doctor.user.id,
        senderId: req.user!.id,
        type: 'LAB_REPORT_READY',
        title: 'Patient Lab Report Completed',
        message: `Results for patient ${order.patient.user.firstName} ${order.patient.user.lastName} are ready.`,
        entityType: 'lab_result',
        entityId: updated.id
      });
    }

    res.json({ success: true, order: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
