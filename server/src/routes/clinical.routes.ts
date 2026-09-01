import { Router, Response } from 'express';
import { prisma } from '../db/prisma.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware.js';
import { sendNotification, emitToRole, emitToUser } from '../realtime/socket.js';

const router = Router();

// GET /api/clinical/records
router.get('/records', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { role, patientId } = req.user!;
    let whereClause: any = {};
    if (role === 'PATIENT') {
      whereClause.patientId = patientId;
    }

    const records = await prisma.medicalRecord.findMany({
      where: whereClause,
      include: {
        doctor: { include: { user: true } },
        patient: { include: { user: true } }
      },
      orderBy: { date: 'desc' }
    });

    res.json({
      success: true,
      records: records.map(r => ({
        id: r.id,
        title: r.title,
        category: r.category,
        date: r.date,
        facility: r.facility,
        summary: r.summary,
        fileUrl: r.fileUrl,
        doctor: `Dr. ${r.doctor.user.firstName} ${r.doctor.user.lastName}`,
        patient: `${r.patient.user.firstName} ${r.patient.user.lastName}`
      }))
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/clinical/prescriptions
router.post('/prescriptions', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { patientId, instructions, medications } = req.body;
    const doctorId = req.user!.doctorId!;

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: { user: true }
    });
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: { user: true }
    });

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const prescription = await prisma.prescription.create({
      data: {
        patientId,
        doctorId,
        instructions: instructions || 'Take medications strictly as indicated.',
        status: 'PENDING',
        medications: {
          create: (medications || []).map((m: any) => ({
            medicineName: m.name,
            dosage: m.dosage || '1 unit',
            schedule: m.schedule || 'Daily',
            durationDays: m.duration || 30
          }))
        }
      },
      include: { medications: true }
    });

    // 1. Notify Patient
    await sendNotification({
      recipientId: patient.user.id,
      senderId: req.user!.id,
      type: 'PRESCRIPTION_CREATED',
      title: 'New Prescription Issued',
      message: `Dr. ${doctor?.user.firstName} ${doctor?.user.lastName} wrote a new prescription for you.`,
      entityType: 'prescription',
      entityId: prescription.id
    });

    // 2. Notify Pharmacy Role in real-time
    emitToRole('PHARMACIST', 'prescription_order_received', {
      prescriptionId: prescription.id,
      patientName: `${patient.user.firstName} ${patient.user.lastName}`,
      doctorName: `Dr. ${doctor?.user.firstName} ${doctor?.user.lastName}`
    });

    res.status(201).json({ success: true, prescription });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/clinical/treatment-plans (With Senior Doctor Review)
router.post('/treatment-plans', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { patientId, title, description, requestSeniorReview } = req.body;
    const doctorId = req.user!.doctorId!;

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: { user: true }
    });

    const seniorDoc = await prisma.seniorDoctor.findFirst({
      include: { doctor: { include: { user: true } } }
    });

    const status = requestSeniorReview ? 'PENDING_APPROVAL' : 'APPROVED';

    const plan = await prisma.treatmentPlan.create({
      data: {
        patientId,
        doctorId,
        seniorDoctorId: seniorDoc ? seniorDoc.id : null,
        title,
        description,
        status
      }
    });

    if (requestSeniorReview && seniorDoc) {
      await sendNotification({
        recipientId: seniorDoc.doctor.user.id,
        senderId: req.user!.id,
        type: 'SENIOR_REVIEW_REQUIRED',
        title: 'Treatment Plan Approval Requested',
        message: `Dr. ${doctor?.user.firstName} ${doctor?.user.lastName} submitted a clinical treatment plan for review.`,
        entityType: 'treatment_plan',
        entityId: plan.id
      });
    }

    res.status(201).json({ success: true, plan });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/clinical/treatment-plans/:id/review
router.patch('/treatment-plans/:id/review', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { decision, notes } = req.body; // APPROVED or CHANGES_REQUESTED
    const plan = await prisma.treatmentPlan.findUnique({
      where: { id: req.params.id },
      include: { doctor: { include: { user: true } } }
    });

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Treatment plan not found' });
    }

    const updated = await prisma.treatmentPlan.update({
      where: { id: req.params.id },
      data: {
        status: decision,
        reviewNotes: notes
      }
    });

    // Notify submitting doctor
    const notifType = decision === 'APPROVED' ? 'TREATMENT_APPROVED' : 'TREATMENT_CHANGES_REQUESTED';
    const notifTitle = decision === 'APPROVED' ? 'Treatment Plan Approved' : 'Treatment Plan Changes Requested';

    await sendNotification({
      recipientId: plan.doctor.user.id,
      senderId: req.user!.id,
      type: notifType,
      title: notifTitle,
      message: `Senior Reviewer: ${notes || decision}`,
      entityType: 'treatment_plan',
      entityId: updated.id
    });

    emitToUser(plan.doctor.user.id, 'treatment_plan_reviewed', updated);

    res.json({ success: true, plan: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
