import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Starting database population...');

  // 1. Roles
  const roleNames = [
    'SUPER_ADMIN', 'HOSPITAL_ADMIN', 'SENIOR_DOCTOR', 'DOCTOR',
    'NURSE', 'PATIENT', 'RECEPTIONIST', 'LAB_TECHNICIAN', 'PHARMACIST', 'ACCOUNTANT'
  ];

  const rolesMap: Record<string, string> = {};
  for (const name of roleNames) {
    const r = await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name, description: `CarePlus ${name.replace('_', ' ')} Role` }
    });
    rolesMap[name] = r.id;
  }

  // 2. Hospital
  const hospital = await prisma.hospital.upsert({
    where: { code: 'CP-BLR-01' },
    update: {},
    create: {
      name: 'CarePlus Multi-Specialty Hospital & Trauma Center',
      code: 'CP-BLR-01',
      address: '100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038',
      phone: '+91 80 2500 1100',
      email: 'emergency@careplus.com'
    }
  });

  // 3. Departments
  const deptDefs = [
    { code: 'CARD', name: 'Cardiology & Heart Center' },
    { code: 'DERM', name: 'Dermatology & Skin Center' },
    { code: 'NEUR', name: 'Neurology & Brain Sciences' },
    { code: 'PEDI', name: 'Pediatrics & Child Wellness' },
    { code: 'ORTH', name: 'Orthopedics & Spine Clinic' },
    { code: 'GENM', name: 'General & Preventive Medicine' }
  ];

  const deptsMap: Record<string, string> = {};
  for (const d of deptDefs) {
    const dept = await prisma.department.upsert({
      where: { hospitalId_code: { hospitalId: hospital.id, code: d.code } },
      update: {},
      create: {
        hospitalId: hospital.id,
        code: d.code,
        name: d.name
      }
    });
    deptsMap[d.code] = dept.id;
  }

  // Default hashed password for all demo accounts: "password123"
  const passwordHash = await bcrypt.hash('password123', 10);

  // 4. Create Demo Patient (Vaseem Basha)
  const patientUser = await prisma.user.upsert({
    where: { email: 'patient@careplus.com' },
    update: {},
    create: {
      email: 'patient@careplus.com',
      passwordHash,
      firstName: 'Vaseem',
      lastName: 'Basha',
      phone: '+91 98765 43210',
      roleId: rolesMap['PATIENT'],
      roleName: 'PATIENT',
      avatarUrl: '', // clean monogram initials
      patientProfile: {
        create: {
          patientCode: 'CP-2026-1048',
          dob: new Date('1994-10-14'),
          gender: 'Male',
          bloodGroup: 'O Positive (O+)',
          address: 'Indiranagar 100ft Rd, Bengaluru, Karnataka 560038',
          emergencyContact: 'Farhana Basha (+91 98765 11223)',
          allergies: 'No known drug allergies (NKDA)'
        }
      }
    }
  });

  const patient = await prisma.patient.findUnique({ where: { userId: patientUser.id } });

  // 5. Create Senior Doctor (Dr. K. S. Verma)
  const seniorDocUser = await prisma.user.upsert({
    where: { email: 'senior.verma@careplus.com' },
    update: {},
    create: {
      email: 'senior.verma@careplus.com',
      passwordHash,
      firstName: 'K. S.',
      lastName: 'Verma',
      phone: '+91 98765 11001',
      roleId: rolesMap['SENIOR_DOCTOR'],
      roleName: 'SENIOR_DOCTOR',
      avatarUrl: 'assets/images/doctors/dr_arjun_rao.jpg',
      doctorProfile: {
        create: {
          departmentId: deptsMap['GENM'],
          specialty: 'Chief of Internal Medicine & Critical Care',
          licenseNumber: 'MCI-SR-44210',
          experienceYears: 24,
          consultationFee: 1200,
          rating: 5.0,
          bio: 'Senior Clinical Director supervising hospital care pathways, ICU protocols, and residency training.',
          isSenior: true,
          seniorProfile: {
            create: {
              supervisionNotes: 'Directs Department of Medicine and chairs clinical ethics & treatment review board.'
            }
          }
        }
      }
    }
  });

  // 6. Create Doctor (Dr. Arjun Rao)
  const docArjunUser = await prisma.user.upsert({
    where: { email: 'doctor.arjun@careplus.com' },
    update: {},
    create: {
      email: 'doctor.arjun@careplus.com',
      passwordHash,
      firstName: 'Arjun',
      lastName: 'Rao',
      phone: '+91 98765 11002',
      roleId: rolesMap['DOCTOR'],
      roleName: 'DOCTOR',
      avatarUrl: 'assets/images/doctors/dr_arjun_rao.jpg',
      doctorProfile: {
        create: {
          departmentId: deptsMap['CARD'],
          specialty: 'Cardiologist',
          licenseNumber: 'MCI-KA-18492',
          experienceYears: 14,
          consultationFee: 800,
          rating: 4.9,
          bio: 'Senior Consultant Cardiologist specializing in preventive cardiology, echocardiography, and lipid disorders.'
        }
      }
    }
  });

  const docArjun = await prisma.doctor.findUnique({ where: { userId: docArjunUser.id } });

  // Doctor availability schedule for Dr. Arjun Rao
  if (docArjun) {
    for (let day = 1; day <= 6; day++) {
      await prisma.doctorAvailability.upsert({
        where: { doctorId_dayOfWeek: { doctorId: docArjun.id, dayOfWeek: day } },
        update: {},
        create: {
          doctorId: docArjun.id,
          dayOfWeek: day,
          startTime: '09:00 AM',
          endTime: '05:00 PM',
          slotDurationMinutes: 30,
          isAvailable: true
        }
      });
    }
  }

  // 7. Additional Doctors
  const otherDoctors = [
    { email: 'dr.priya@careplus.com', first: 'Priya', last: 'Sharma', dept: 'DERM', spec: 'Dermatologist', fee: 650, exp: 10, photo: 'assets/images/doctors/dr_priya_sharma.jpg' },
    { email: 'dr.kiran@careplus.com', first: 'Kiran', last: 'Kumar', dept: 'NEUR', spec: 'Neurologist', fee: 1000, exp: 16, photo: 'assets/images/doctors/dr_kiran_kumar.jpg' },
    { email: 'dr.ananya@careplus.com', first: 'Ananya', last: 'Singh', dept: 'PEDI', spec: 'Pediatrician', fee: 600, exp: 9, photo: 'assets/images/doctors/dr_ananya_singh.jpg' },
    { email: 'dr.rahul@careplus.com', first: 'Rahul', last: 'Mehta', dept: 'ORTH', spec: 'Orthopedic Surgeon', fee: 750, exp: 12, photo: 'assets/images/doctors/dr_rahul_mehta.jpg' },
    { email: 'dr.sneha@careplus.com', first: 'Sneha', last: 'Reddy', dept: 'GENM', spec: 'General Physician', fee: 500, exp: 11, photo: 'assets/images/doctors/dr_sneha_reddy.jpg' }
  ];

  for (const d of otherDoctors) {
    const u = await prisma.user.upsert({
      where: { email: d.email },
      update: {},
      create: {
        email: d.email,
        passwordHash,
        firstName: d.first,
        lastName: d.last,
        roleId: rolesMap['DOCTOR'],
        roleName: 'DOCTOR',
        avatarUrl: d.photo,
        doctorProfile: {
          create: {
            departmentId: deptsMap[d.dept],
            specialty: d.spec,
            licenseNumber: `MCI-DOC-${Math.floor(10000 + Math.random() * 90000)}`,
            experienceYears: d.exp,
            consultationFee: d.fee,
            rating: 4.8
          }
        }
      }
    });

    const doc = await prisma.doctor.findUnique({ where: { userId: u.id } });
    if (doc) {
      for (let day = 1; day <= 6; day++) {
        await prisma.doctorAvailability.upsert({
          where: { doctorId_dayOfWeek: { doctorId: doc.id, dayOfWeek: day } },
          update: {},
          create: {
            doctorId: doc.id,
            dayOfWeek: day,
            startTime: '09:00 AM',
            endTime: '05:00 PM',
            slotDurationMinutes: 30,
            isAvailable: true
          }
        });
      }
    }
  }

  // 8. Staff Demo Accounts
  const staffAccounts = [
    { email: 'nurse.sarah@careplus.com', first: 'Sarah', last: 'Jenkins', role: 'NURSE', job: 'Head Triage & Inpatient Nurse' },
    { email: 'lab.david@careplus.com', first: 'David', last: 'Chen', role: 'LAB_TECHNICIAN', job: 'Chief Pathology & Diagnostics Technician' },
    { email: 'pharmacy.priya@careplus.com', first: 'Priya', last: 'Nair', role: 'PHARMACIST', job: 'Registered Hospital Pharmacist' },
    { email: 'admin.marcus@careplus.com', first: 'Marcus', last: 'Vance', role: 'HOSPITAL_ADMIN', job: 'Hospital Operations Director' },
    { email: 'superadmin@careplus.com', first: 'Alex', last: 'Mercer', role: 'SUPER_ADMIN', job: 'Chief System Administrator' },
    { email: 'reception.elena@careplus.com', first: 'Elena', last: 'Rostova', role: 'RECEPTIONIST', job: 'Patient Intake & Admissions Lead' },
    { email: 'accounts.robert@careplus.com', first: 'Robert', last: 'Sterling', role: 'ACCOUNTANT', job: 'Hospital Financial Comptroller' }
  ];

  for (const s of staffAccounts) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        email: s.email,
        passwordHash,
        firstName: s.first,
        lastName: s.last,
        roleId: rolesMap[s.role],
        roleName: s.role,
        avatarUrl: '',
        staffProfile: {
          create: {
            hospitalId: hospital.id,
            jobTitle: s.job
          }
        }
      }
    });

    if (s.role === 'NURSE') {
      await prisma.nurse.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          departmentId: deptsMap['GENM'],
          shift: 'Morning'
        }
      });
    }
  }

  // 9. Rooms & Beds
  const room101 = await prisma.room.upsert({
    where: { hospitalId_roomNumber: { hospitalId: hospital.id, roomNumber: '101' } },
    update: {},
    create: {
      hospitalId: hospital.id,
      departmentId: deptsMap['CARD'],
      roomNumber: '101',
      roomType: 'General Ward'
    }
  });

  const bed1 = await prisma.bed.upsert({
    where: { roomId_bedNumber: { roomId: room101.id, bedNumber: 'Bed 101-A' } },
    update: {},
    create: { roomId: room101.id, bedNumber: 'Bed 101-A', status: 'AVAILABLE' }
  });

  const bed2 = await prisma.bed.upsert({
    where: { roomId_bedNumber: { roomId: room101.id, bedNumber: 'Bed 101-B' } },
    update: {},
    create: { roomId: room101.id, bedNumber: 'Bed 101-B', status: 'OCCUPIED' }
  });

  // 10. Lab Test Catalog
  const labCatalog = [
    { code: 'CBC-01', name: 'Complete Blood Count (CBC)', category: 'Blood', price: 450, prep: 'No fasting required', desc: 'Evaluates overall health and detects anemia, infection, and leukemia.' },
    { code: 'LIPID-01', name: 'Lipid Profile & Cardiovascular Risk', category: 'Blood', price: 650, prep: '10-12 hours fasting required', desc: 'Measures HDL, LDL, VLDL, and total cholesterol ratios for arterial wellness.' },
    { code: 'THY-01', name: 'Comprehensive Thyroid Profile (T3, T4, TSH)', category: 'Organ Profile', price: 700, prep: 'Morning sample recommended', desc: 'Screening for hypothyroidism and hyperthyroidism metabolic balance.' },
    { code: 'HBA1C-01', name: 'HbA1c Glycated Hemoglobin', category: 'Diabetes', price: 550, prep: 'Non-fasting test', desc: 'Gold standard measure of average blood sugar control over 3 months.' },
    { code: 'VIT-01', name: 'Vitamin D3 & B12 Combo Package', category: 'Vitamins & Minerals', price: 1200, prep: 'Fasting not required', desc: 'Assesses bone density support, immune health, and neurological nerve health.' },
    { code: 'LFT-01', name: 'Liver Function Test (LFT) with Enzymes', category: 'Organ Profile', price: 600, prep: '8 hours fasting recommended', desc: 'Checks SGOT, SGPT, Bilirubin, and Albumin for hepatic health.' }
  ];

  for (const t of labCatalog) {
    await prisma.labTest.upsert({
      where: { code: t.code },
      update: {},
      create: {
        code: t.code,
        name: t.name,
        category: t.category,
        price: t.price,
        preparation: t.prep,
        description: t.desc
      }
    });
  }

  // 11. Pharmacy Inventory
  const medicines = [
    { name: 'Atorvastatin 20mg', category: 'Tablet', stock: 120, unitPrice: 12.5 },
    { name: 'Metformin 500mg', category: 'Tablet', stock: 15, unitPrice: 8.0 }, // LOW STOCK
    { name: 'Amoxicillin 500mg', category: 'Capsule', stock: 80, unitPrice: 15.0 },
    { name: 'Vitamin D3 60,000 IU', category: 'Capsule', stock: 65, unitPrice: 28.0 },
    { name: 'Omega-3 Fish Oil 1000mg', category: 'Softgel', stock: 12, unitPrice: 22.0 }, // LOW STOCK
    { name: 'Paracetamol 650mg', category: 'Tablet', stock: 240, unitPrice: 3.5 }
  ];

  for (const m of medicines) {
    await prisma.inventory.upsert({
      where: { medicineName: m.name },
      update: {},
      create: {
        medicineName: m.name,
        category: m.category,
        stock: m.stock,
        minThreshold: 20,
        unitPrice: m.unitPrice,
        expiryDate: new Date('2027-12-31')
      }
    });
  }

  // 12. Sample Initial Appointments & Medical Records
  if (patient && docArjun) {
    const todayStr = new Date().toISOString().split('T')[0];

    await prisma.appointment.upsert({
      where: { appointmentCode: 'APT-100001' },
      update: {},
      create: {
        appointmentCode: 'APT-100001',
        patientId: patient.id,
        doctorId: docArjun.id,
        hospitalId: hospital.id,
        departmentId: docArjun.departmentId,
        date: todayStr,
        timeSlot: '10:30 AM',
        consultationType: 'In-person',
        status: 'CONFIRMED',
        reason: 'Routine 6-month blood pressure review and ECG.'
      }
    });

    await prisma.medicalRecord.create({
      data: {
        patientId: patient.id,
        doctorId: docArjun.id,
        title: 'Complete Blood Count & Metabolic Panel',
        category: 'Lab Report',
        date: '2026-08-14',
        facility: 'CarePlus Diagnostics, Bengaluru',
        summary: 'All hematology parameters within normal limits. Fasting blood glucose: 92 mg/dL.'
      }
    });

    // Initial notification
    await prisma.notification.create({
      data: {
        recipientId: patientUser.id,
        type: 'APPOINTMENT_CONFIRMED',
        title: 'Upcoming Appointment Confirmed',
        message: 'Your appointment with Dr. Arjun Rao is confirmed for today at 10:30 AM.',
        isRead: false
      }
    });
  }

  console.log('[Seed] Database populated successfully with 10 roles and realistic sample data!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
