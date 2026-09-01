import { Router, Response } from 'express';
import { prisma } from '../db/prisma.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware.js';

const router = Router();

// GET /api/doctors
router.get('/', async (_req, res) => {
  try {
    const doctors = await prisma.doctor.findMany({
      include: {
        user: { select: { firstName: true, lastName: true, avatarUrl: true, email: true, phone: true } },
        department: { select: { name: true, hospital: { select: { name: true } } } },
        availabilities: true
      }
    });

    res.json({
      success: true,
      doctors: doctors.map(d => ({
        id: d.id,
        name: `Dr. ${d.user.firstName} ${d.user.lastName}`,
        specialty: d.specialty,
        department: d.department.name,
        hospital: d.department.hospital.name,
        fee: d.consultationFee,
        rating: d.rating,
        experience: `${d.experienceYears} years`,
        bio: d.bio,
        isAvailable: d.isAvailable,
        isSenior: d.isSenior,
        photo: d.user.avatarUrl,
        availabilities: d.availabilities
      }))
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/doctors/:id
router.get('/:id', async (req, res) => {
  try {
    const d = await prisma.doctor.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { firstName: true, lastName: true, avatarUrl: true, email: true, phone: true } },
        department: { select: { name: true, hospital: { select: { name: true } } } },
        availabilities: true
      }
    });

    if (!d) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.json({
      success: true,
      doctor: {
        id: d.id,
        name: `Dr. ${d.user.firstName} ${d.user.lastName}`,
        specialty: d.specialty,
        department: d.department.name,
        hospital: d.department.hospital.name,
        fee: d.consultationFee,
        rating: d.rating,
        experience: `${d.experienceYears} years`,
        bio: d.bio,
        isAvailable: d.isAvailable,
        isSenior: d.isSenior,
        photo: d.user.avatarUrl,
        availabilities: d.availabilities
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/doctors/:id/patients
router.get('/:id/patients', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const appointments = await prisma.appointment.findMany({
      where: { doctorId: req.params.id },
      include: {
        patient: {
          include: {
            user: true,
            medicalRecords: true
          }
        }
      },
      distinct: ['patientId']
    });

    res.json({
      success: true,
      patients: appointments.map(a => ({
        id: a.patient.id,
        name: `${a.patient.user.firstName} ${a.patient.user.lastName}`,
        email: a.patient.user.email,
        phone: a.patient.user.phone,
        gender: a.patient.gender,
        bloodGroup: a.patient.bloodGroup,
        dob: a.patient.dob,
        recordsCount: a.patient.medicalRecords.length
      }))
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/doctors/:id/slots?date=YYYY-MM-DD
router.get('/:id/slots', async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date || typeof date !== 'string') {
      return res.status(400).json({ success: false, message: 'Date parameter (YYYY-MM-DD) is required.' });
    }

    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: { availabilities: true, leaves: true }
    });

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const targetDate = new Date(date);
    const isLeave = doctor.leaves.some(l => l.status === 'APPROVED' && targetDate >= l.startDate && targetDate <= l.endDate);
    if (isLeave) {
      return res.json({ success: true, isAvailable: false, message: 'Doctor is on leave on this date.', slots: [] });
    }

    const standardSlots = [
      '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
      '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
      '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
    ];

    const booked = await prisma.appointment.findMany({
      where: {
        doctorId: id,
        date: date,
        status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] }
      },
      select: { timeSlot: true }
    });

    const bookedTimes = new Set(booked.map(b => b.timeSlot));

    const slots = standardSlots.map(time => ({
      time,
      isBooked: bookedTimes.has(time)
    }));

    res.json({
      success: true,
      doctorId: id,
      date,
      isAvailable: doctor.isAvailable,
      slots
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/doctors/:id/availability
router.patch('/:id/availability', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { isAvailable } = req.body;
    const doctor = await prisma.doctor.update({
      where: { id: req.params.id },
      data: { isAvailable: !!isAvailable }
    });

    res.json({ success: true, isAvailable: doctor.isAvailable });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
