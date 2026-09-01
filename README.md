# CarePlus Healthcare Management System

A full-stack, enterprise-grade healthcare management system built with **React (TypeScript)**, **Tailwind CSS**, **Node.js (Express)**, **Prisma ORM**, and **Socket.IO** for real-time clinical workflows.

---

## Key Capabilities

* **10 Role-Based Clinical Portals**:
  1. **Patient**: Dashboard, Doctors directory, Real-time appointment booking, Health Records, Medicines, Lab tests, Vitals telemetry tracking, Health articles, Emergency card, and Editable profile picture.
  2. **Doctor**: Real-time incoming visit requests, Accept/Reject/Reschedule actions, Availability toggle, Prescription creator, Diagnostic lab ordering, and Senior doctor review requests.
  3. **Senior Doctor**: Department oversight, Critical cases review, Treatment plan approvals, and change requests.
  4. **Nurse**: Inpatient ward roster, Bed locator, Vitals monitoring, and Medication schedule administration.
  5. **Lab Technician**: Incoming diagnostic orders queue, Specimen collection status, Result data entry, and Automated Doctor/Patient report notifications.
  6. **Pharmacist**: Prescription fulfillment queue, 1-click dispensing with real-time patient notification, and Inventory management with automated low-stock alerts.
  7. **Hospital Admin**: Hospital statistics, Real-time Bed Management grid, Staff directory, Emergency broadcast trigger, and Audit trail.
  8. **Super Admin**: Global multi-tenant configuration and system logging.
  9. **Receptionist**: Patient check-in, Walk-in appointment booking, and Bed occupancy lookup.
  10. **Accountant**: Invoicing, Billing summaries, and Insurance claim tracking.

* **Real-Time WebSocket Pipeline (Socket.IO)**:
  * Actions taken in one browser session instantly reflect across all other connected sessions without requiring page refresh (e.g. Patient books -> Doctor alerted; Doctor accepts -> Patient confirmed; Doctor orders lab -> Lab technician alerted; Lab uploads results -> Doctor and Patient alerted; Doctor prescribes -> Pharmacist alerted; Pharmacist dispenses -> Patient alerted).

* **Strict Double-Booking Prevention**:
  * Database-level compound unique constraints (`doctorId, date, timeSlot`) prevent overlapping appointments.

* **Zero-AI Human Design System**:
  * Clean clinical teal palette (`#0c756e`), typography-driven medical telemetry (no artificial icon badges), authentic physician portraits, and full profile photo upload/removal capabilities.

---

## Technology Stack

* **Frontend**: React 18, TypeScript, Tailwind CSS, Vite, Lucide Icons, Socket.IO Client
* **Backend**: Node.js, Express, TypeScript, Socket.IO Server, JWT Auth, Bcrypt, Multer
* **Database**: Prisma ORM, 33 Normalized Data Models, SQLite / PostgreSQL
* **Testing**: Jest, Supertest

---

## Getting Started

### 1. Installation
```bash
# Install root, backend, and frontend dependencies
npm install --prefix server
npm install --prefix client
npm install
```

### 2. Database Migration & Seed
```bash
cd server
npx prisma db push
npx tsx prisma/seed.ts
cd ..
```

### 3. Start Development Servers
```bash
# Starts backend (port 5000) and frontend (port 3000) concurrently
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## Demo Accounts (Password for all: `password123`)

Use the sticky **Role Switcher** at the top of the application to switch between roles in 1 click:
* **Patient**: `patient@careplus.com` (Vaseem Basha)
* **Doctor**: `doctor.arjun@careplus.com` (Dr. Arjun Rao - Cardiologist)
* **Senior Doctor**: `senior.verma@careplus.com` (Dr. K. S. Verma - Chief of Medicine)
* **Nurse**: `nurse.sarah@careplus.com` (Sarah Jenkins - Senior Nurse)
* **Lab Technician**: `lab.david@careplus.com` (David Chen)
* **Pharmacist**: `pharmacy.priya@careplus.com` (Priya Nair)
* **Hospital Admin**: `admin.marcus@careplus.com` (Marcus Vance)
* **Super Admin**: `superadmin@careplus.com` (Alex Mercer)
* **Receptionist**: `reception.elena@careplus.com` (Elena Rostova)
* **Accountant**: `accounts.robert@careplus.com` (Robert Sterling)
