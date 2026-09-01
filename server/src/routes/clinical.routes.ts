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

// POST /api/clinical/records
router.post('/records', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { title, category, date, facility, summary } = req.body;
    let patientId = req.user?.patientId;
    let doctorId = req.user?.doctorId;

    if (!patientId) {
      const firstPatient = await prisma.patient.findFirst();
      patientId = firstPatient?.id;
    }
    if (!doctorId) {
      const firstDoctor = await prisma.doctor.findFirst();
      doctorId = firstDoctor?.id;
    }

    const record = await prisma.medicalRecord.create({
      data: {
        patientId: patientId!,
        doctorId: doctorId!,
        title: title || 'Clinical Investigation Document',
        category: category || 'General Report',
        date: date || new Date().toISOString().split('T')[0],
        facility: facility || 'CarePlus Multi-Specialty Hospital',
        summary: summary || 'Routine clinical investigation.'
      },
      include: {
        doctor: { include: { user: true } },
        patient: { include: { user: true } }
      }
    });

    res.status(201).json({
      success: true,
      record: {
        id: record.id,
        title: record.title,
        category: record.category,
        date: record.date,
        facility: record.facility,
        summary: record.summary,
        doctor: `Dr. ${record.doctor.user.firstName} ${record.doctor.user.lastName}`,
        patient: `${record.patient.user.firstName} ${record.patient.user.lastName}`
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/clinical/records/:id
router.delete('/records/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.medicalRecord.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Record deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/clinical/prescriptions
router.get('/prescriptions', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { role, patientId, doctorId } = req.user!;
    let whereClause: any = {};
    if (role === 'PATIENT') whereClause.patientId = patientId;
    if (role === 'DOCTOR') whereClause.doctorId = doctorId;

    const prescriptions = await prisma.prescription.findMany({
      where: whereClause,
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
        patientName: `${p.patient.user.firstName} ${p.patient.user.lastName}`,
        doctorName: `Dr. ${p.doctor.user.firstName} ${p.doctor.user.lastName}`,
        instructions: p.instructions,
        status: p.status,
        createdAt: p.createdAt,
        medications: p.medications.map(m => ({
          name: m.medicineName,
          dosage: m.dosage,
          schedule: m.schedule,
          durationDays: m.durationDays
        }))
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
    let doctorId = req.user!.doctorId;

    if (!doctorId) {
      const doc = await prisma.doctor.findFirst();
      doctorId = doc?.id;
    }

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: { user: true }
    });
    const patient = await prisma.patient.findUnique({
      where: { id: patientId || req.user?.patientId },
      include: { user: true }
    });

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const prescription = await prisma.prescription.create({
      data: {
        patientId: patient.id,
        doctorId: doctorId!,
        instructions: instructions || 'Take medications strictly as indicated.',
        status: 'PENDING',
        medications: {
          create: (medications || []).map((m: any) => ({
            medicineName: m.name,
            dosage: m.dosage || '1 unit',
            schedule: m.schedule || 'Daily',
            durationDays: m.durationDays || 30
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

// GET /api/clinical/treatment-plans
router.get('/treatment-plans', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const plans = await prisma.treatmentPlan.findMany({
      include: {
        doctor: { include: { user: true } },
        patient: { include: { user: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      plans: plans.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        status: p.status,
        doctorName: `Dr. ${p.doctor.user.firstName} ${p.doctor.user.lastName}`,
        doctorId: p.doctorId,
        patientName: `${p.patient.user.firstName} ${p.patient.user.lastName}`,
        patientId: p.patientId,
        reviewNotes: p.reviewNotes,
        createdAt: p.createdAt
      }))
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/clinical/treatment-plans
router.post('/treatment-plans', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { patientId, title, description, requestSeniorReview } = req.body;
    let doctorId = req.user!.doctorId;

    if (!doctorId) {
      const doc = await prisma.doctor.findFirst();
      doctorId = doc?.id;
    }

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
        doctorId: doctorId!,
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
      emitToRole('SENIOR_DOCTOR', 'senior_review_requested', {
        planId: plan.id,
        title: plan.title,
        doctorName: `Dr. ${doctor?.user.firstName} ${doctor?.user.lastName}`
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
    await sendNotification({
      recipientId: plan.doctor.user.id,
      senderId: req.user!.id,
      type: decision === 'APPROVED' ? 'TREATMENT_PLAN_APPROVED' : 'TREATMENT_PLAN_CHANGES_REQUESTED',
      title: `Treatment Plan ${decision === 'APPROVED' ? 'Approved' : 'Changes Requested'}`,
      message: `Senior Review Decision for "${plan.title}": ${decision}.${notes ? ' Notes: ' + notes : ''}`,
      entityType: 'treatment_plan',
      entityId: updated.id
    });

    emitToUser(plan.doctor.user.id, 'treatment_plan_reviewed', {
      planId: updated.id,
      status: updated.status,
      reviewNotes: notes
    });

    res.json({ success: true, plan: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
