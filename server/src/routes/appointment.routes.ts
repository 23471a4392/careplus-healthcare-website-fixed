import { Router, Response } from 'express';
import { prisma } from '../db/prisma.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware.js';
import { sendNotification, emitToUser } from '../realtime/socket.js';
import { logAudit } from '../middleware/audit.middleware.js';

const router = Router();

// GET /api/appointments
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { role, patientId, doctorId } = req.user!;
    let whereClause: any = {};

    if (role === 'PATIENT') {
      whereClause.patientId = patientId;
    } else if (role === 'DOCTOR' || role === 'SENIOR_DOCTOR') {
      whereClause.doctorId = doctorId;
    }
    // Admins, receptionists, etc. can see all appointments

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        doctor: {
          include: {
            user: { select: { firstName: true, lastName: true, avatarUrl: true } },
            department: { select: { name: true } }
          }
        },
        patient: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true, phone: true } }
          }
        },
        hospital: { select: { name: true } }
      },
      orderBy: { date: 'desc' }
    });

    res.json({
      success: true,
      appointments: appointments.map(a => ({
        id: a.id,
        appointmentCode: a.appointmentCode,
        doctor: `Dr. ${a.doctor.user.firstName} ${a.doctor.user.lastName}`,
        doctorId: a.doctorId,
        doctorUserId: a.doctor.userId,
        specialty: a.doctor.specialty,
        department: a.doctor.department.name,
        patient: `${a.patient.user.firstName} ${a.patient.user.lastName}`,
        patientId: a.patientId,
        patientUserId: a.patient.userId,
        patientEmail: a.patient.user.email,
        patientPhone: a.patient.user.phone,
        date: a.date,
        time: a.timeSlot,
        type: a.consultationType,
        status: a.status,
        reason: a.reason,
        notes: a.clinicalNotes,
        hospital: a.hospital.name
      }))
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/appointments (With STRICT DOUBLE-BOOKING PREVENTION)
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { doctorId, date, timeSlot, consultationType, reason } = req.body;
    let patientId = req.user?.patientId;

    if (!patientId) {
      // If admin/receptionist is booking for a patient, allow patientId from body
      patientId = req.body.patientId;
    }

    if (!doctorId || !date || !timeSlot) {
      return res.status(400).json({ success: false, message: 'Doctor, date, and time slot are required.' });
    }

    // 1. Verify Doctor exists and is active
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        department: { select: { id: true, hospitalId: true } }
      }
    });

    if (!doctor || !doctor.isAvailable) {
      return res.status(400).json({ success: false, message: 'The selected doctor is currently not available for bookings.' });
    }

    // 2. Check Doctor Leave
    const leaveCheck = await prisma.doctorLeave.findFirst({
      where: {
        doctorId: doctorId,
        startDate: { lte: new Date(date) },
        endDate: { gte: new Date(date) },
        status: 'APPROVED'
      }
    });

    if (leaveCheck) {
      return res.status(409).json({ success: false, message: 'Doctor is scheduled on leave on this date.' });
    }

    // 3. STRICT DOUBLE-BOOKING CHECK
    const existingBooking = await prisma.appointment.findUnique({
      where: {
        doctorId_date_timeSlot: {
          doctorId: doctorId,
          date: date,
          timeSlot: timeSlot
        }
      }
    });

    if (existingBooking && existingBooking.status !== 'CANCELLED' && existingBooking.status !== 'REJECTED') {
      return res.status(409).json({
        success: false,
        message: `Doctor is already booked at ${timeSlot} on ${date}. Please select another time slot.`
      });
    }

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: { user: true }
    });

    const appointmentCode = 'APT-' + Math.floor(100000 + Math.random() * 900000);

    // 4. Create appointment
    const newAppointment = await prisma.appointment.create({
      data: {
        appointmentCode,
        patientId: patientId!,
        doctorId,
        hospitalId: doctor.department.hospitalId,
        departmentId: doctor.departmentId,
        date,
        timeSlot,
        consultationType: consultationType || 'In-person',
        reason: reason || 'Routine Consultation',
        status: 'PENDING'
      }
    });

    // 5. REAL-TIME EVENT DISPATCH TO DOCTOR
    const patientName = patient ? `${patient.user.firstName} ${patient.user.lastName}` : 'Patient';
    await sendNotification({
      recipientId: doctor.user.id,
      senderId: req.user!.id,
      type: 'NEW_APPOINTMENT',
      title: 'New Appointment Request',
      message: `${patientName} requested an appointment for ${date} at ${timeSlot}.`,
      entityType: 'appointment',
      entityId: newAppointment.id
    });

    emitToUser(doctor.user.id, 'appointment_created', {
      appointmentId: newAppointment.id,
      patientName,
      date,
      timeSlot
    });

    await logAudit({
      userId: req.user!.id,
      action: 'BOOK_APPOINTMENT',
      resource: 'Appointment',
      resourceId: newAppointment.id,
      details: { doctorId, date, timeSlot, patientId },
      ipAddress: req.ip
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully!',
      appointment: newAppointment
    });
  } catch (err: any) {
    if (err.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'Time slot already booked for this doctor.' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/appointments/:id/status
router.patch('/:id/status', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { status, clinicalNotes, reschedDate, reschedTime } = req.body;
    const appointment = await prisma.appointment.findUnique({
      where: { id: req.params.id },
      include: {
        doctor: { include: { user: true } },
        patient: { include: { user: true } }
      }
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const updateData: any = { status };
    if (clinicalNotes) updateData.clinicalNotes = clinicalNotes;
    if (reschedDate) updateData.date = reschedDate;
    if (reschedTime) updateData.timeSlot = reschedTime;

    const updated = await prisma.appointment.update({
      where: { id: req.params.id },
      data: updateData
    });

    // Notify patient
    let notifType = 'APPOINTMENT_' + status;
    let notifTitle = `Appointment ${status}`;
    let notifMsg = `Dr. ${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName} has marked your appointment as ${status}.`;

    if (status === 'CONFIRMED') {
      notifMsg = `Your appointment with Dr. ${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName} on ${updated.date} at ${updated.timeSlot} is CONFIRMED.`;
    } else if (status === 'RESCHEDULED') {
      notifMsg = `Your appointment has been rescheduled to ${updated.date} at ${updated.timeSlot}.`;
    }

    await sendNotification({
      recipientId: appointment.patient.user.id,
      senderId: req.user!.id,
      type: notifType,
      title: notifTitle,
      message: notifMsg,
      entityType: 'appointment',
      entityId: updated.id
    });

    emitToUser(appointment.patient.user.id, 'appointment_status_changed', {
      appointmentId: updated.id,
      status: updated.status,
      date: updated.date,
      timeSlot: updated.timeSlot
    });

    await logAudit({
      userId: req.user!.id,
      action: `APPOINTMENT_${status}`,
      resource: 'Appointment',
      resourceId: updated.id,
      details: { previousStatus: appointment.status, newStatus: status },
      ipAddress: req.ip
    });

    res.json({ success: true, appointment: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
