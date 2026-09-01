export type UserRole =
  | 'SUPER_ADMIN'
  | 'HOSPITAL_ADMIN'
  | 'SENIOR_DOCTOR'
  | 'DOCTOR'
  | 'NURSE'
  | 'PATIENT'
  | 'RECEPTIONIST'
  | 'LAB_TECHNICIAN'
  | 'PHARMACIST'
  | 'ACCOUNTANT';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  patientId?: string;
  doctorId?: string;
  department?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  department: string;
  hospital: string;
  fee: number;
  rating: number;
  experience: string;
  bio?: string;
  isAvailable: boolean;
  isSenior: boolean;
  photo?: string;
}

export interface Appointment {
  id: string;
  appointmentCode: string;
  doctor: string;
  doctorId: string;
  doctorUserId: string;
  specialty: string;
  department: string;
  patient: string;
  patientId: string;
  patientUserId: string;
  patientEmail?: string;
  patientPhone?: string;
  date: string;
  time: string;
  type: string;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'RESCHEDULED' | 'COMPLETED' | 'CANCELLED';
  reason?: string;
  notes?: string;
  hospital: string;
}

export interface NotificationItem {
  id: string;
  recipientId: string;
  senderId?: string;
  type: string;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface MedicalRecordItem {
  id: string;
  title: string;
  category: string;
  date: string;
  facility: string;
  summary: string;
  fileUrl?: string;
  doctor: string;
  patient: string;
}

export interface LabOrder {
  id: string;
  testName: string;
  category: string;
  patientName: string;
  patientUserId: string;
  doctorName: string;
  doctorUserId: string;
  status: 'REQUESTED' | 'SAMPLE_COLLECTED' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  collectionDate: string;
  sampleMode: string;
  resultSummary?: string;
  createdAt: string;
}

export interface PrescriptionItem {
  id: string;
  doctor: string;
  patient: string;
  patientUserId: string;
  status: 'PENDING' | 'DISPENSED' | 'CANCELLED';
  instructions?: string;
  medications: {
    id: string;
    medicineName: string;
    dosage: string;
    schedule: string;
    durationDays: number;
    takenToday?: boolean;
  }[];
  createdAt: string;
  dispensedAt?: string;
}

export interface BedItem {
  id: string;
  bedNumber: string;
  roomNumber: string;
  roomType: string;
  department: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE';
  currentPatient?: string;
}
