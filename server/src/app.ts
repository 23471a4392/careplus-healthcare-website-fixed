import express from 'express';
import cors from 'cors';
import { CONFIG } from './config.js';
import authRoutes from './routes/auth.routes.js';
import appointmentRoutes from './routes/appointment.routes.js';
import doctorRoutes from './routes/doctor.routes.js';
import clinicalRoutes from './routes/clinical.routes.js';
import labRoutes from './routes/lab.routes.js';
import pharmacyRoutes from './routes/pharmacy.routes.js';
import nurseRoutes from './routes/nurse.routes.js';
import hospitalRoutes from './routes/hospital.routes.js';
import notificationRoutes from './routes/notification.routes.js';

export const app = express();

app.use(cors({
  origin: (origin, callback) => {
    // Allow local development ports and requests with no origin
    callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

// API Route Mounts
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/clinical', clinicalRoutes);
app.use('/api/labs', labRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/nurse', nurseRoutes);
app.use('/api/hospital', hospitalRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString(), platform: 'CarePlus Real-Time Healthcare' });
});
