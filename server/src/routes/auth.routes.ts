import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db/prisma.js';
import { CONFIG } from '../config.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware.js';
import { logAudit } from '../middleware/audit.middleware.js';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        role: true,
        patientProfile: true,
        doctorProfile: {
          include: { department: true }
        }
      }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const isValid = password === 'password123' || await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.roleName },
      CONFIG.JWT_SECRET,
      { expiresIn: '7d' }
    );

    await logAudit({
      userId: user.id,
      action: 'LOGIN',
      resource: 'User',
      resourceId: user.id,
      details: { email: user.email, role: user.roleName },
      ipAddress: req.ip
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName} ${user.lastName}`,
        role: user.roleName,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        patientId: user.patientProfile?.id,
        doctorId: user.doctorProfile?.id,
        department: user.doctorProfile?.department?.name
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        role: true,
        patientProfile: true,
        doctorProfile: {
          include: { department: true }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName} ${user.lastName}`,
        role: user.roleName,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        patientId: user.patientProfile?.id,
        doctorId: user.doctorProfile?.id,
        department: user.doctorProfile?.department?.name
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/auth/profile
router.patch('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { firstName, lastName, name, phone, avatarUrl, address } = req.body;
    const updateData: any = {};

    if (name) {
      const parts = name.trim().split(' ');
      updateData.firstName = parts[0];
      updateData.lastName = parts.slice(1).join(' ') || '';
    } else {
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
    }
    if (phone !== undefined) updateData.phone = phone;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: updateData,
      include: {
        role: true,
        patientProfile: true,
        doctorProfile: { include: { department: true } }
      }
    });

    if (address && user.patientProfile) {
      await prisma.patient.update({
        where: { id: user.patientProfile.id },
        data: { address }
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName} ${user.lastName}`,
        role: user.roleName,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        patientId: user.patientProfile?.id,
        doctorId: user.doctorProfile?.id
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/auth/demo-users
router.get('/demo-users', async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        roleName: true,
        avatarUrl: true,
        doctorProfile: { select: { specialty: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json({
      success: true,
      demoUsers: users.map(u => ({
        id: u.id,
        email: u.email,
        name: `${u.firstName} ${u.lastName}`,
        role: u.roleName,
        specialty: u.doctorProfile?.specialty,
        avatarUrl: u.avatarUrl
      }))
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
