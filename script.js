/**
 * CarePlus Healthcare Portal - Core Application Script
 * Frontend-only application with authentic real stock photography,
 * complete local state and localStorage persistence.
 */

// --- Default Initial Data (Using authentic stock photography from verified human photographers) ---
const DEFAULT_DOCTORS = [
  {
    id: 'doc-1',
    name: 'Dr. Arjun Rao',
    spec: 'Cardiologist',
    rating: '4.9',
    exp: '14 years',
    fee: 800,
    hospital: 'CarePlus Heart Center, Indiranagar',
    initials: 'AR',
    photo: 'assets/images/doctors/dr_arjun_rao.jpg',
    fallbackPhoto: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80',
    bio: 'Senior Consultant Cardiologist specializing in preventive cardiology, echocardiography, and lipid disorders.'
  },
  {
    id: 'doc-2',
    name: 'Dr. Priya Sharma',
    spec: 'Dermatologist',
    rating: '4.8',
    exp: '10 years',
    fee: 650,
    hospital: 'Skin & Aesthetics Clinic, Koramangala',
    initials: 'PS',
    photo: 'assets/images/doctors/dr_priya_sharma.jpg',
    fallbackPhoto: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=300&q=80',
    bio: 'Clinical dermatologist with expertise in allergic skin conditions, acne therapies, and trichology.'
  },
  {
    id: 'doc-3',
    name: 'Dr. Kiran Kumar',
    spec: 'Neurologist',
    rating: '4.9',
    exp: '16 years',
    fee: 1000,
    hospital: 'Apollo Neurosciences, Bannerghatta',
    initials: 'KK',
    photo: 'assets/images/doctors/dr_kiran_kumar.jpg',
    fallbackPhoto: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=300&q=80',
    bio: 'Neurologist focused on migraine management, stroke rehabilitation, and neuro-muscular health.'
  },
  {
    id: 'doc-4',
    name: 'Dr. Ananya Singh',
    spec: 'Pediatrician',
    rating: '4.8',
    exp: '9 years',
    fee: 600,
    hospital: 'Rainbow Childrens Center, Whitefield',
    initials: 'AS',
    photo: 'assets/images/doctors/dr_ananya_singh.jpg',
    fallbackPhoto: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80',
    bio: 'Child health specialist dedicated to neonatal care, developmental milestones, and pediatric vaccinations.'
  },
  {
    id: 'doc-5',
    name: 'Dr. Rahul Mehta',
    spec: 'Orthopedic Surgeon',
    rating: '4.7',
    exp: '12 years',
    fee: 750,
    hospital: 'CarePlus Joint & Spine Clinic, MG Road',
    initials: 'RM',
    photo: 'assets/images/doctors/dr_rahul_mehta.jpg',
    fallbackPhoto: 'https://images.unsplash.com/photo-1622902046580-2b47f47f5471?auto=format&fit=crop&w=300&q=80',
    bio: 'Orthopedic surgeon specializing in sports injuries, arthroscopy, and joint replacement rehabilitation.'
  },
  {
    id: 'doc-6',
    name: 'Dr. Sneha Reddy',
    spec: 'General Physician',
    rating: '4.9',
    exp: '11 years',
    fee: 500,
    hospital: 'City Care Clinic, HSR Layout',
    initials: 'SR',
    photo: 'assets/images/doctors/dr_sneha_reddy.jpg',
    fallbackPhoto: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&w=300&q=80',
    bio: 'Family physician with deep expertise in metabolic health, hypertension, and holistic primary care.'
  },
  {
    id: 'doc-7',
    name: 'Dr. Rajesh Nambiar',
    spec: 'Gastroenterologist',
    rating: '4.8',
    exp: '15 years',
    fee: 900,
    hospital: 'Manipal Digestive Center, Old Airport Rd',
    initials: 'RN',
    photo: 'assets/images/doctors/dr_rajesh_nambiar.jpg',
    fallbackPhoto: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=300&q=80',
    bio: 'Consultant gastroenterologist specializing in liver wellness, endoscopy, and inflammatory bowel disease.'
  },
  {
    id: 'doc-8',
    name: 'Dr. Meera Iyer',
    spec: 'Ophthalmologist',
    rating: '4.9',
    exp: '13 years',
    fee: 700,
    hospital: 'Narayana Eye Hospital, Rajajinagar',
    initials: 'MI',
    photo: 'assets/images/doctors/dr_meera_iyer.jpg',
    fallbackPhoto: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=300&q=80',
    bio: 'Ophthalmic surgeon specializing in refractive laser procedures, glaucoma monitoring, and diabetic retinopathy.'
  }
];

const DEFAULT_APPOINTMENTS = [
  { id: 'apt-1', doctor: 'Dr. Arjun Rao', spec: 'Cardiologist', hospital: 'CarePlus Heart Center', date: '2026-09-02', time: '10:30', type: 'In-person', status: 'Confirmed', notes: 'Routine 6-month blood pressure review and ECG.' },
  { id: 'apt-2', doctor: 'Dr. Priya Sharma', spec: 'Dermatologist', hospital: 'Skin & Aesthetics Clinic', date: '2026-09-08', time: '14:00', type: 'Video consultation', status: 'Confirmed', notes: 'Allergy patch follow-up and skincare regimen.' },
  { id: 'apt-3', doctor: 'Dr. Kiran Kumar', spec: 'Neurologist', hospital: 'Apollo Neurosciences', date: '2026-08-15', time: '11:00', type: 'In-person', status: 'Completed', notes: 'Headache diary review; normal brain MRI.' },
  { id: 'apt-4', doctor: 'Dr. Sneha Reddy', spec: 'General Physician', hospital: 'City Care Clinic', date: '2026-08-01', time: '09:30', type: 'In-person', status: 'Completed', notes: 'Annual biometric screening and metabolic panel.' },
  { id: 'apt-5', doctor: 'Dr. Rahul Mehta', spec: 'Orthopedic Surgeon', hospital: 'CarePlus Joint Clinic', date: '2026-07-10', time: '16:00', type: 'In-person', status: 'Cancelled', notes: 'Patient rescheduled due to travel.' }
];

const DEFAULT_MEDICINES = [
  { id: 'med-1', name: 'Vitamin D3', dose: '60,000 IU (1 capsule)', schedule: 'Weekly · After breakfast', start: '2026-08-01', instructions: 'Take with whole milk or meal', duration: '8 weeks', takenToday: true },
  { id: 'med-2', name: 'Omega 3 Fish Oil', dose: '1000 mg (1 softgel)', schedule: 'Daily · After dinner', start: '2026-08-01', instructions: 'Take with warm water', duration: 'Ongoing', takenToday: false },
  { id: 'med-3', name: 'Magnesium Glycinate', dose: '200 mg (1 tablet)', schedule: 'Daily · 30m before bed', start: '2026-08-10', instructions: 'Aids muscle recovery and sleep', duration: 'Ongoing', takenToday: false },
  { id: 'med-4', name: 'CoQ10 Ubiquinol', dose: '100 mg (1 capsule)', schedule: 'Daily · Morning', start: '2026-08-15', instructions: 'Cardiovascular energy support', duration: '90 days', takenToday: true }
];

const DEFAULT_RECORDS = [
  { id: 'rec-1', title: 'Complete Blood Count & Metabolic Panel', category: 'Lab Report', doctor: 'Dr. Arjun Rao', facility: 'City Diagnostics, Bengaluru', date: '2026-08-14', size: '1.2 MB', summary: 'All hematology parameters within normal range. Hemoglobin 14.8 g/dL, Fasting Blood Sugar 92 mg/dL.' },
  { id: 'rec-2', title: 'Chest Radiography (PA View)', category: 'Radiology & Imaging', doctor: 'Dr. K. S. Verma', facility: 'CarePlus Radiology Wing', date: '2026-07-28', size: '4.8 MB', summary: 'Clear lung fields bilaterally. Cardiac silhouette normal size. No pleural effusion or consolidation.' },
  { id: 'rec-3', title: 'Cardiovascular Preventive Prescription', category: 'Prescription', doctor: 'Dr. Arjun Rao', facility: 'CarePlus Heart Center', date: '2026-06-20', size: '420 KB', summary: 'Prescription for dietary supplements, lifestyle counseling, and annual preventive lipid profile.' },
  { id: 'rec-4', title: 'Comprehensive Lipid Profile', category: 'Lab Report', doctor: 'Dr. Sneha Reddy', facility: 'Medall Health Labs', date: '2026-05-18', size: '980 KB', summary: 'Total Cholesterol 178 mg/dL, HDL 54 mg/dL, LDL 102 mg/dL, Triglycerides 110 mg/dL.' }
];

const DEFAULT_LAB_TESTS = [
  { id: 'lab-1', name: 'Complete Blood Count (CBC)', category: 'Blood', price: 450, turnaround: '24 hours', prep: 'No special fasting required', description: 'Evaluates overall health and detects wide range of disorders including anemia and infection.' },
  { id: 'lab-2', name: 'Comprehensive Thyroid Profile (T3, T4, TSH)', category: 'Organ Profile', price: 700, turnaround: '24 hours', prep: 'Morning sample recommended', description: 'Screening for hyperthyroidism and hypothyroidism metabolism balance.' },
  { id: 'lab-3', name: 'Lipid Profile & Cardiovascular Risk Score', category: 'Blood', price: 650, turnaround: '24 hours', prep: '10-12 hours overnight fasting required', description: 'Measures HDL, LDL, VLDL, and total cholesterol ratios for heart wellness.' },
  { id: 'lab-4', name: 'HbA1c (Glycated Hemoglobin)', category: 'Diabetes', price: 550, turnaround: '12 hours', prep: 'Non-fasting test', description: 'Gold standard measure of average blood sugar control over the past 3 months.' },
  { id: 'lab-5', name: 'Vitamin D3 (25-OH) & Vitamin B12 Combo', category: 'Vitamins & Minerals', price: 1200, turnaround: '36 hours', prep: 'Fasting not required', description: 'Assesses bone density support, immune health, and neurological nerve function.' },
  { id: 'lab-6', name: 'Liver Function Test (LFT) with Enzymes', category: 'Organ Profile', price: 600, turnaround: '24 hours', prep: '8 hours fasting recommended', description: 'Checks SGOT, SGPT, Bilirubin, and Albumin for hepatic health.' }
];

const DEFAULT_METRICS = [
  { id: 'm-1', type: 'Heart Rate', value: '72 BPM', raw: 72, unit: 'BPM', status: 'Normal Resting', date: '2026-08-31 08:30' },
  { id: 'm-2', type: 'Blood Pressure', value: '118/76 mmHg', raw: 118, unit: 'mmHg', status: 'Optimal', date: '2026-08-31 08:35' },
  { id: 'm-3', type: 'Body Weight', value: '68.4 kg', raw: 68.4, unit: 'kg', status: 'Target Range', date: '2026-08-30 07:00' },
  { id: 'm-4', type: 'Steps Walked', value: '7,842 steps', raw: 7842, unit: 'steps', status: 'Active Goal', date: '2026-08-30 21:00' },
  { id: 'm-5', type: 'Fasting Blood Glucose', value: '92 mg/dL', raw: 92, unit: 'mg/dL', status: 'Normal', date: '2026-08-28 07:15' },
  { id: 'm-6', type: 'Blood Oxygen (SpO2)', value: '99%', raw: 99, unit: '%', status: 'Excellent', date: '2026-08-28 07:20' }
];

const DEFAULT_ARTICLES = [
  {
    id: 'art-1',
    title: 'Building a Balanced Nutrition Plate: Whole Foods, Fiber & Healthy Fats',
    category: 'Nutrition',
    author: 'Dr. Meenakshi Sundaram, Clinical Nutritionist',
    readMinutes: 5,
    photo: 'assets/images/articles/nutrition.jpg',
    fallbackPhoto: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600&q=80',
    summary: 'Practical strategies for creating nutrient-dense meals that stabilize blood sugar and fuel sustained energy throughout the day.',
    takeaways: ['Fill half your plate with colorful vegetables', 'Prioritize whole protein sources at each meal', 'Incorporate unsaturated fats like extra virgin olive oil and nuts', 'Maintain hydration of 2.5-3 liters per day'],
    content: 'Evidence-based nutrition begins with foundational dietary diversity. Clinical research consistently shows that a dietary pattern rich in prebiotic soluble fiber, polyphenol-dense vegetables, and essential fatty acids supports optimal lipid homeostasis and gut microbiome resilience.\n\nWhen designing meals, focus on the 50-25-25 plate architecture: 50% non-starchy cruciferous and green vegetables, 25% clean bioavailable protein (lentils, fish, poultry, tofu), and 25% low-glycemic complex carbohydrates (quinoa, millets, brown rice, sweet potatoes).'
  },
  {
    id: 'art-2',
    title: 'The Science of Restorative Sleep: Circadian Rhythms & Wind-Down Rituals',
    category: 'Sleep',
    author: 'Dr. Kiran Kumar, Neurologist',
    readMinutes: 6,
    photo: 'assets/images/articles/sleep.jpg',
    fallbackPhoto: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=80',
    summary: 'How consistent circadian timing and bedtime light mitigation dramatically optimize deep slow-wave sleep and cellular repair.',
    takeaways: ['Keep a consistent wake-up time 7 days a week', 'Dim blue light exposure 90 minutes before bedtime', 'Maintain bedroom temperature between 18-20°C', 'Avoid caffeine within 8 hours of sleep'],
    content: 'Sleep architecture is governed by two complementary physiological mechanisms: circadian rhythmicity (Process C) and homeostatic sleep pressure (Process S). Deep non-REM sleep serves as the primary window for glymphatic cerebral toxin clearance and protein synthesis.\n\nTo optimize sleep quality, morning sunlight exposure within 30 minutes of waking sets the master suprachiasmatic nucleus clock, priming melatonin secretion approximately 14 hours later.'
  },
  {
    id: 'art-3',
    title: 'Functional Daily Movement: Cardiovascular Longevity Beyond The Gym',
    category: 'Fitness',
    author: 'CarePlus Sports Medicine Advisory',
    readMinutes: 4,
    photo: 'assets/images/articles/fitness.jpg',
    fallbackPhoto: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=600&q=80',
    summary: 'Why non-exercise activity thermogenesis (NEAT) and zone 2 aerobic conditioning are crucial for metabolic and vascular longevity.',
    takeaways: ['Aim for 7,500-10,000 functional daily steps', 'Incorporate 150 minutes of conversational Zone 2 cardio weekly', 'Perform compound resistance training twice a week', 'Take 3-minute walking breaks after sitting for 60 minutes'],
    content: 'Sedentary physiology impairs capillary endothelial nitric oxide production and lipoprotein lipase activity. Integrating intermittent movement throughout the workday significantly attenuates postprandial glucose spikes.\n\nCombining moderate aerobic conditioning with progressive resistance exercises preserves lean muscle mass, improves bone mineral density, and supports lifelong mobility.'
  },
  {
    id: 'art-4',
    title: 'Stress Modulation & Mental Health: Clinical Mindfulness Strategies',
    category: 'Mental Health',
    author: 'Dr. Shalini Raman, Clinical Psychologist',
    readMinutes: 5,
    photo: 'assets/images/articles/mental_health.jpg',
    fallbackPhoto: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80',
    summary: 'Evidence-based cognitive reframing, vagal nerve activation, and physiological sigh breathing to regulate the autonomic nervous system.',
    takeaways: ['Practice 4-7-8 or double-inhale physiological sigh breathing', 'Establish dedicated tech-free mindfulness blocks', 'Maintain social connection and peer dialogue', 'Schedule periodic clinical mental health check-ins'],
    content: 'Chronic sympathetic nervous system overactivation leads to elevated cortisol and inflammatory cytokines. Activating parasympathetic tone via diaphragmatic breathing and structured mindfulness meditation facilitates heart rate variability (HRV) recovery.\n\nRegular cognitive boundary-setting promotes neuroplasticity, mood equilibrium, and executive cognitive resilience.'
  },
  {
    id: 'art-5',
    title: 'Cardiovascular Health 101: Understanding Blood Pressure & Lipid Ratios',
    category: 'Heart Health',
    author: 'Dr. Arjun Rao, Consultant Cardiologist',
    readMinutes: 7,
    photo: 'assets/images/articles/heart_health.jpg',
    fallbackPhoto: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=600&q=80',
    summary: 'A clinician guide to interpreting systolic/diastolic numbers, ApoB, triglycerides, and lifestyle interventions for arterial health.',
    takeaways: ['Target resting blood pressure below 120/80 mmHg', 'Monitor non-HDL cholesterol and triglyceride-to-HDL ratios', 'Reduce processed sodium and trans-fat consumption', 'Undergo periodic electrocardiogram and screening checkups'],
    content: 'Cardiovascular wellness requires understanding vascular dynamics. Systolic blood pressure measures arterial wall tension during cardiac contraction, while diastolic pressure measures resting arterial resistance.\n\nEarly lifestyle optimization—including dietary potassium intake, regular cardiovascular exercise, and stress management—prevents arterial stiffness and preserves endothelial integrity.'
  }
];

const DEFAULT_NOTIFICATIONS = [
  { id: 'notif-1', title: 'Upcoming Appointment Reminder', message: 'Appointment with Dr. Arjun Rao is scheduled for Sep 2 at 10:30 AM (Indiranagar).', time: '10 mins ago', type: 'appointment', read: false },
  { id: 'notif-2', title: 'Evening Medication Alert', message: 'It is time for your evening Omega 3 Fish Oil capsule.', time: '2 hours ago', type: 'medicine', read: false },
  { id: 'notif-3', title: 'Diagnostic Lab Report Ready', message: 'Your Complete Blood Count & Metabolic Panel report is ready for viewing and download.', time: '1 day ago', type: 'record', read: false },
  { id: 'notif-4', title: 'Health Milestone Achieved', message: 'You have completed your 7-day hydration target. Great work maintaining wellness!', time: '2 days ago', type: 'tracking', read: true }
];

const DEFAULT_PROFILE = {
  name: 'Vaseem Basha',
  patientId: 'CP-2026-1048',
  email: 'vaseem@example.com',
  phone: '+91 98765 43210',
  dob: '1994-10-14',
  dobDisplay: 'Oct 14, 1994 (31 yrs)',
  gender: 'Male',
  bloodGroup: 'O Positive (O+)',
  address: 'Indiranagar 100ft Rd, Bengaluru, Karnataka 560038',
  emergencyContact: 'Farhana Basha (+91 98765 11223)',
  photo: 'assets/images/profile/vaseem_basha.jpg',
  fallbackPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
};

const DEFAULT_EMERGENCY_HOSPITALS = [
  { name: 'CarePlus Multi-Specialty & Trauma Center', distance: '1.8 km', trauma: 'Level 1 24/7 Trauma Unit', phone: '+91 80 2500 1100' },
  { name: 'Manipal Hospital Emergency Department', distance: '3.2 km', trauma: 'Comprehensive Cardiac & Neuro Emergency', phone: '+91 80 2502 4444' },
  { name: 'Apollo Hospitals Emergency Response', distance: '4.5 km', trauma: '24/7 Advanced Critical Care & Stroke Unit', phone: '+91 80 2630 2030' },
  { name: 'Fortis Emergency Healthcare Center', distance: '5.1 km', trauma: '24/7 Pediatric & Adult Emergency', phone: '+91 80 6621 4444' }
];

// --- Application State Manager ---
class StateManager {
  constructor() {
    this.state = {
      doctors: this.migrateDoctors(this.load('doctors', DEFAULT_DOCTORS)),
      appointments: this.load('appointments', DEFAULT_APPOINTMENTS),
      medicines: this.load('medicines', DEFAULT_MEDICINES),
      records: this.load('records', DEFAULT_RECORDS),
      labTests: this.load('labTests', DEFAULT_LAB_TESTS),
      metrics: this.load('metrics', DEFAULT_METRICS),
      articles: this.migrateArticles(this.load('articles', DEFAULT_ARTICLES)),
      notifications: this.load('notifications', DEFAULT_NOTIFICATIONS),
      profile: this.migrateProfile(this.load('profile', DEFAULT_PROFILE)),
      settings: this.load('settings', { appearance: 'system', reminders: true, medAlerts: true, emailAlerts: true, privacy: false }),
      activeAppointmentTab: 'all',
      activeRecordCategory: 'all',
      activeArticleCategory: 'all'
    };
  }

  migrateDoctors(docs) {
    return docs.map(d => {
      const match = DEFAULT_DOCTORS.find(def => def.id === d.id);
      return match ? { ...d, photo: match.photo, fallbackPhoto: match.fallbackPhoto } : d;
    });
  }

  migrateArticles(arts) {
    return arts.map(a => {
      const match = DEFAULT_ARTICLES.find(def => def.id === a.id);
      return match ? { ...a, photo: match.photo, fallbackPhoto: match.fallbackPhoto } : a;
    });
  }

  migrateProfile(prof) {
    return {
      ...prof,
      photo: prof.photo || DEFAULT_PROFILE.photo,
      fallbackPhoto: prof.fallbackPhoto || DEFAULT_PROFILE.fallbackPhoto
    };
  }

  load(key, fallback) {
    try {
      const raw = localStorage.getItem('careplus_' + key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  save(key) {
    try {
      localStorage.setItem('careplus_' + key, JSON.stringify(this.state[key]));
    } catch (e) {
      console.warn('LocalStorage save warning:', e);
    }
  }
}

const App = new StateManager();

// --- Toast & Modal Notification Helpers ---
let toastTimeout = null;
function toast(msg, type = 'info') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.className = 'toast';
  t.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
    <span>${msg}</span>
  `;
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => { t.className = ''; }, 3200);
}

function openModal(html) {
  const modal = document.getElementById('modal');
  const content = document.getElementById('modalContent');
  if (modal && content) {
    content.innerHTML = html;
    modal.classList.add('show');
  }
}

function closeModal() {
  const modal = document.getElementById('modal');
  if (modal) modal.classList.remove('show');
}

// --- Navigation & Page Switching ---
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById(id);
  if (page) page.classList.add('active');

  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.toggle('active', n.dataset.page === id);
  });

  // Close mobile drawer if open
  const sidebar = document.getElementById('appSidebar');
  if (sidebar) sidebar.classList.remove('open');

  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Render respective page views
  if (id === 'dashboard') renderDashboard();
  if (id === 'doctors') renderDoctors();
  if (id === 'appointments') renderAppointments();
  if (id === 'records') renderRecords();
  if (id === 'medicines') renderMedicines();
  if (id === 'labs') renderLabTests();
  if (id === 'tracking') renderTracking();
  if (id === 'articles') renderArticles();
  if (id === 'emergency') renderEmergency();
  if (id === 'profile') renderProfile();
  if (id === 'notifications') renderNotifications();
  if (id === 'settings') renderSettings();
}

function toggleMobileSidebar() {
  const sidebar = document.getElementById('appSidebar');
  if (sidebar) sidebar.classList.toggle('open');
}

// --- Theme Management ---
function initTheme() {
  const saved = App.state.settings.appearance || 'system';
  applyTheme(saved);
}

function applyTheme(theme) {
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  App.state.settings.appearance = isDark ? 'dark' : 'light';
  App.save('settings');
  const sel = document.getElementById('appearanceSelect');
  if (sel) sel.value = App.state.settings.appearance;
  toast(isDark ? 'Dark theme enabled' : 'Light theme enabled');
}

function handleAppearanceChange(val) {
  App.state.settings.appearance = val;
  App.save('settings');
  applyTheme(val);
  toast('Appearance set to ' + val);
}

// --- Dashboard Module ---
function renderDashboard() {
  // Update Date and Greeting
  const dateEl = document.getElementById('todayDateLabel');
  if (dateEl) {
    const today = new Date();
    dateEl.textContent = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }
  const greetEl = document.getElementById('userGreeting');
  if (greetEl) {
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const firstName = App.state.profile.name.split(' ')[0] || 'Patient';
    greetEl.textContent = `${timeOfDay}, ${firstName}`;
  }

  // Render Upcoming Appointment on Dashboard with Doctor's authentic photograph
  const nextAppt = App.state.appointments.find(a => a.status === 'Confirmed');
  const apptContainer = document.getElementById('dashNextAppointment');
  if (apptContainer) {
    if (nextAppt) {
      const matchedDoctor = App.state.doctors.find(d => d.name === nextAppt.doctor);
      const doctorPhoto = matchedDoctor ? matchedDoctor.photo : '';
      const doctorFallback = matchedDoctor ? matchedDoctor.fallbackPhoto : '';
      const initials = nextAppt.doctor.replace('Dr. ', '').split(' ').map(n=>n[0]).join('');

      apptContainer.innerHTML = `
        <div class="appointment-item">
          <div class="doc-avatar-wrap" style="width:46px;height:46px;">
            ${doctorPhoto ? `<img src="${doctorPhoto}" alt="${nextAppt.doctor}" class="doc-avatar-img" style="width:46px;height:46px;" onerror="this.onerror=null; if(this.src!=='${doctorFallback}'){this.src='${doctorFallback}'}else{this.style.display='none'; this.nextElementSibling.style.display='grid';}" loading="lazy">` : ''}
            <div class="doc-badge-avatar" ${doctorPhoto ? 'style="display:none;"' : ''}>${initials}</div>
          </div>
          <div>
            <strong>${nextAppt.doctor}</strong>
            <p>${nextAppt.spec} · ${nextAppt.hospital || 'Clinical Wing'}</p>
            <span>📅 ${nextAppt.date} · ${nextAppt.time} (${nextAppt.type})</span>
          </div>
          <button class="action-btn-circle" onclick="openAppointmentActions('${nextAppt.id}')" title="Appointment Options">•••</button>
        </div>
      `;
    } else {
      apptContainer.innerHTML = `
        <div style="text-align:center;padding:20px;color:var(--text-muted);">
          <p>No upcoming appointments scheduled.</p>
          <button class="btn-secondary" style="margin-top:10px;" onclick="openAppointmentModal()">Book a Visit</button>
        </div>
      `;
    }
  }

  // Render Dashboard Medication Checklist
  const medContainer = document.getElementById('dashMedicationList');
  if (medContainer) {
    if (App.state.medicines.length > 0) {
      medContainer.innerHTML = App.state.medicines.slice(0, 3).map((m, i) => `
        <div class="med-row">
          <div class="stat-icon emerald" style="width:36px;height:36px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/></svg>
          </div>
          <div>
            <strong>${m.name}</strong>
            <p>${m.dose} · ${m.schedule}</p>
          </div>
          <button class="check ${m.takenToday ? 'done' : ''}" onclick="toggleMedTaken('${m.id}')" title="Toggle Dose Complete">
            ${m.takenToday ? '✓' : ''}
          </button>
        </div>
      `).join('');
    } else {
      medContainer.innerHTML = `<p class="muted" style="padding:15px 0;">No active medications recorded.</p>`;
    }
  }

  // Render Activity Chart
  const rangeSel = document.getElementById('activityRangeSelect');
  updateActivityChart(rangeSel ? rangeSel.value : '7');
}

function updateActivityChart(range) {
  const barsContainer = document.getElementById('activityBars');
  const daysContainer = document.getElementById('activityDays');
  if (!barsContainer || !daysContainer) return;

  const daysCount = parseInt(range, 10) || 7;
  const daysNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();

  let barsHtml = '';
  let daysHtml = '';

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dayLabel = daysNames[d.getDay()];

    // Realistic seeded step data
    const seed = (d.getDate() * 9301 + 49297) % 233280;
    const steps = Math.floor(4500 + (seed / 233280) * 5500);
    const heightPercent = Math.min(100, Math.round((steps / 10000) * 100));

    barsHtml += `
      <div class="bar-col" title="${d.toLocaleDateString()}: ${steps.toLocaleString()} steps">
        <div class="bar-fill" style="height: ${heightPercent}%;"></div>
      </div>
    `;

    if (daysCount <= 7 || i % Math.ceil(daysCount / 7) === 0) {
      daysHtml += `<span>${dayLabel}</span>`;
    }
  }

  barsContainer.innerHTML = barsHtml;
  daysContainer.innerHTML = daysHtml;
}

// --- Doctors Module (Authentic Physician Photography & Monogram Fallback) ---
function renderDoctors() {
  const grid = document.getElementById('doctorGrid');
  if (!grid) return;

  const search = (document.getElementById('doctorSearch')?.value || '').toLowerCase().trim();
  const specialty = document.getElementById('specialtyFilter')?.value || '';
  const sort = document.getElementById('sortDoctorSelect')?.value || 'rating';

  let list = App.state.doctors.filter(d => {
    const matchQuery = !search || (d.name + ' ' + d.spec + ' ' + d.hospital + ' ' + d.bio).toLowerCase().includes(search);
    const matchSpec = !specialty || d.spec.toLowerCase() === specialty.toLowerCase();
    return matchQuery && matchSpec;
  });

  if (sort === 'rating') list.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
  if (sort === 'experience') list.sort((a, b) => parseInt(b.exp) - parseInt(a.exp));
  if (sort === 'fee') list.sort((a, b) => a.fee - b.fee);

  if (list.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:40px;" class="card">
        <h3>No doctors found matching criteria</h3>
        <p class="muted">Try clearing your search query or selecting "All Specialties".</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = list.map(d => `
    <div class="card doctor-card">
      <div>
        <div class="doctor-top">
          <div class="doc-avatar-wrap">
            <img src="${d.photo}" alt="${d.name}" class="doc-avatar-img" onerror="this.onerror=null; if(this.src!=='${d.fallbackPhoto}'){this.src='${d.fallbackPhoto}'}else{this.style.display='none'; this.nextElementSibling.style.display='grid';}" loading="lazy">
            <div class="doc-avatar-large doc-avatar-fallback" style="display:none;">${d.initials}</div>
          </div>
          <div>
            <h3>${d.name}</h3>
            <p>${d.spec}</p>
            <div class="rating-badge">★ ${d.rating} · ${d.exp} exp</div>
          </div>
        </div>
        <div class="doctor-meta">
          <span>${d.hospital}</span>
          <strong>₹${d.fee}</strong>
        </div>
        <p class="muted" style="font-size:12px;margin-bottom:14px;line-height:1.4;">${d.bio}</p>
      </div>
      <button class="primary full-btn" onclick="openDoctorProfile('${d.id}')">
        <span>View Profile & Book</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>
  `).join('');
}

function filterDoctors() {
  renderDoctors();
}

function openDoctorProfile(id) {
  const d = App.state.doctors.find(doc => doc.id === id);
  if (!d) return;

  openModal(`
    <div style="display:flex;gap:18px;align-items:flex-start;margin-bottom:16px;">
      <div class="doc-avatar-wrap" style="width:72px;height:72px;">
        <img src="${d.photo}" alt="${d.name}" class="doc-modal-avatar-img" onerror="this.onerror=null; if(this.src!=='${d.fallbackPhoto}'){this.src='${d.fallbackPhoto}'}else{this.style.display='none'; this.nextElementSibling.style.display='grid';}" loading="lazy">
        <div class="doc-avatar-large doc-avatar-fallback" style="display:none;width:72px;height:72px;font-size:22px;">${d.initials}</div>
      </div>
      <div>
        <h2>${d.name}</h2>
        <p class="muted">${d.spec} · ${d.exp} clinical experience</p>
        <div class="rating-badge" style="margin-top:4px;">★ ${d.rating} Verified Patient Rating</div>
      </div>
    </div>

    <div style="background:var(--bg-subtle);padding:14px;border-radius:var(--radius-md);margin-bottom:18px;font-size:13px;">
      <div style="margin-bottom:6px;"><strong>Hospital Affiliation:</strong> ${d.hospital}</div>
      <div style="margin-bottom:6px;"><strong>Consultation Fee:</strong> ₹${d.fee} (In-person / Video)</div>
      <div><strong>Languages Spoken:</strong> English, Hindi, Regional</div>
    </div>

    <h4 style="margin-bottom:6px;font-size:14px;">Specialist Bio & Clinical Focus</h4>
    <p class="muted" style="font-size:13px;line-height:1.5;margin-bottom:20px;">${d.bio} Comprehensive clinical consultations, preventive screenings, diagnostic evaluations, and post-treatment follow-ups.</p>

    <div class="modal-footer">
      <button class="btn-secondary" onclick="closeModal()">Close</button>
      <button class="primary" onclick="closeModal();openAppointmentModal('${d.name}', '${d.spec}')">
        <span>Book Consultation</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </button>
    </div>
  `);
}

// --- Appointments Module ---
function setAppointmentTab(tab, btn) {
  App.state.activeAppointmentTab = tab;
  document.querySelectorAll('#appointmentTabs .tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderAppointments();
}

function renderAppointments() {
  const tbody = document.getElementById('appointmentRows');
  if (!tbody) return;

  const tab = App.state.activeAppointmentTab;
  const list = App.state.appointments.filter(a => {
    if (tab === 'all') return true;
    return a.status.toLowerCase() === tab.toLowerCase();
  });

  if (list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center;padding:30px;color:var(--text-muted);">
          No ${tab !== 'all' ? tab.toLowerCase() : ''} appointments found.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = list.map(a => `
    <tr>
      <td>
        <strong>${a.doctor}</strong>
        <div style="font-size:11px;color:var(--text-muted);">${a.hospital || 'CarePlus Medical Center'}</div>
      </td>
      <td>${a.spec}</td>
      <td>
        <strong>${a.date}</strong>
        <div style="font-size:11px;color:var(--text-muted);">${a.time}</div>
      </td>
      <td>${a.type}</td>
      <td>
        <span class="status-badge ${a.status.toLowerCase()}">${a.status}</span>
      </td>
      <td style="text-align:right;">
        <button class="btn-secondary" style="padding:6px 12px;font-size:12px;" onclick="openAppointmentActions('${a.id}')">
          Manage
        </button>
      </td>
    </tr>
  `).join('');
}

function openAppointmentModal(defaultDoc = '', defaultSpec = '') {
  const docOptions = App.state.doctors.map(d => {
    const selected = (defaultDoc && d.name.includes(defaultDoc)) ? 'selected' : '';
    return `<option value="${d.name}|${d.spec}" ${selected}>${d.name} (${d.spec}) — ₹${d.fee}</option>`;
  }).join('');

  const todayIso = new Date().toISOString().split('T')[0];

  openModal(`
    <h2>Book an Appointment</h2>
    <p class="muted">Select a healthcare specialist, date, and consultation format.</p>

    <div class="form-group">
      <label>Specialist Doctor</label>
      <select id="aptDoctorSelect">${docOptions}</select>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
      <div class="form-group">
        <label>Preferred Date</label>
        <input type="date" id="aptDateInput" min="${todayIso}" value="${todayIso}">
      </div>
      <div class="form-group">
        <label>Time Slot</label>
        <select id="aptTimeSelect">
          <option value="09:00 AM">09:00 AM</option>
          <option value="10:30 AM" selected>10:30 AM</option>
          <option value="11:45 AM">11:45 AM</option>
          <option value="02:00 PM">02:00 PM</option>
          <option value="04:30 PM">04:30 PM</option>
          <option value="06:00 PM">06:00 PM</option>
        </select>
      </div>
    </div>

    <div class="form-group">
      <label>Consultation Mode</label>
      <select id="aptTypeSelect">
        <option value="In-person">In-person Visit (Hospital Clinic)</option>
        <option value="Video consultation">HD Video Tele-consultation</option>
      </select>
    </div>

    <div class="form-group">
      <label>Reason for Visit / Symptoms (Optional)</label>
      <textarea id="aptNotesInput" rows="2" placeholder="Briefly describe symptoms or checkup goal..."></textarea>
    </div>

    <div class="modal-footer">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="primary" onclick="saveAppointment()">Confirm Booking</button>
    </div>
  `);
}

function saveAppointment() {
  const docVal = document.getElementById('aptDoctorSelect')?.value || '';
  const date = document.getElementById('aptDateInput')?.value;
  const time = document.getElementById('aptTimeSelect')?.value;
  const type = document.getElementById('aptTypeSelect')?.value || 'In-person';
  const notes = document.getElementById('aptNotesInput')?.value || 'Routine consultation';

  if (!docVal || !date || !time) {
    toast('Please select a doctor, date, and time slot.');
    return;
  }

  const [docName, docSpec] = docVal.split('|');
  const matchedDoc = App.state.doctors.find(d => d.name === docName);

  const newApt = {
    id: 'apt-' + Date.now(),
    doctor: docName,
    spec: docSpec || 'Specialist',
    hospital: matchedDoc ? matchedDoc.hospital : 'CarePlus Clinic',
    date: date,
    time: time,
    type: type,
    status: 'Confirmed',
    notes: notes
  };

  App.state.appointments.unshift(newApt);
  App.save('appointments');

  // Push notification
  App.state.notifications.unshift({
    id: 'notif-' + Date.now(),
    title: 'New Appointment Confirmed',
    message: `Confirmed appointment with ${docName} on ${date} at ${time}.`,
    time: 'Just now',
    type: 'appointment',
    read: false
  });
  App.save('notifications');
  updateNotificationBadge();

  closeModal();
  renderAppointments();
  renderDashboard();
  toast(`Appointment with ${docName} booked successfully!`);
}

function openAppointmentActions(id) {
  const apt = App.state.appointments.find(a => a.id === id);
  if (!apt) return;

  openModal(`
    <h2>Manage Appointment</h2>
    <p class="muted">ID: ${apt.id} · ${apt.doctor}</p>

    <div style="background:var(--bg-subtle);padding:14px;border-radius:var(--radius-md);margin:16px 0;font-size:13px;line-height:1.6;">
      <div><strong>Specialist:</strong> ${apt.doctor} (${apt.spec})</div>
      <div><strong>Facility:</strong> ${apt.hospital}</div>
      <div><strong>Scheduled Time:</strong> ${apt.date} · ${apt.time}</div>
      <div><strong>Mode:</strong> ${apt.type}</div>
      <div><strong>Status:</strong> <span class="status-badge ${apt.status.toLowerCase()}">${apt.status}</span></div>
      <div><strong>Clinical Notes:</strong> ${apt.notes || 'None'}</div>
    </div>

    <div style="display:flex;flex-direction:column;gap:10px;">
      ${apt.status === 'Confirmed' ? `
        <button class="primary full-btn" onclick="rescheduleAppointment('${apt.id}')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Reschedule Date & Time
        </button>
        <button class="btn-secondary full-btn" onclick="markAppointmentCompleted('${apt.id}')">
          ✓ Mark as Completed
        </button>
        <button class="btn-danger full-btn" onclick="cancelAppointment('${apt.id}')">
          Cancel Appointment
        </button>
      ` : `
        <button class="btn-danger full-btn" onclick="deleteAppointment('${apt.id}')">
          Delete from History
        </button>
      `}
      <button class="btn-secondary full-btn" onclick="closeModal()">Close</button>
    </div>
  `);
}

function rescheduleAppointment(id) {
  const apt = App.state.appointments.find(a => a.id === id);
  if (!apt) return;

  const todayIso = new Date().toISOString().split('T')[0];

  openModal(`
    <h2>Reschedule Appointment</h2>
    <p class="muted">${apt.doctor} · ${apt.spec}</p>

    <div class="form-group">
      <label>New Date</label>
      <input type="date" id="reschedDate" min="${todayIso}" value="${apt.date}">
    </div>

    <div class="form-group">
      <label>New Time Slot</label>
      <select id="reschedTime">
        <option value="09:00 AM">09:00 AM</option>
        <option value="10:30 AM" selected>10:30 AM</option>
        <option value="11:45 AM">11:45 AM</option>
        <option value="02:00 PM">02:00 PM</option>
        <option value="04:30 PM">04:30 PM</option>
        <option value="06:00 PM">06:00 PM</option>
      </select>
    </div>

    <div class="modal-footer">
      <button class="btn-secondary" onclick="openAppointmentActions('${apt.id}')">Back</button>
      <button class="primary" onclick="confirmReschedule('${apt.id}')">Save Changes</button>
    </div>
  `);
}

function confirmReschedule(id) {
  const apt = App.state.appointments.find(a => a.id === id);
  const newDate = document.getElementById('reschedDate')?.value;
  const newTime = document.getElementById('reschedTime')?.value;

  if (apt && newDate && newTime) {
    apt.date = newDate;
    apt.time = newTime;
    App.save('appointments');
    closeModal();
    renderAppointments();
    renderDashboard();
    toast(`Appointment rescheduled to ${newDate} at ${newTime}`);
  }
}

function markAppointmentCompleted(id) {
  const apt = App.state.appointments.find(a => a.id === id);
  if (apt) {
    apt.status = 'Completed';
    App.save('appointments');
    closeModal();
    renderAppointments();
    renderDashboard();
    toast('Appointment marked as Completed.');
  }
}

function cancelAppointment(id) {
  const apt = App.state.appointments.find(a => a.id === id);
  if (apt) {
    apt.status = 'Cancelled';
    App.save('appointments');
    closeModal();
    renderAppointments();
    renderDashboard();
    toast('Appointment cancelled.');
  }
}

function deleteAppointment(id) {
  App.state.appointments = App.state.appointments.filter(a => a.id !== id);
  App.save('appointments');
  closeModal();
  renderAppointments();
  renderDashboard();
  toast('Appointment record deleted.');
}

function exportAppointments() {
  const header = 'ID,Doctor,Specialty,Hospital,Date,Time,Type,Status,Notes\n';
  const rows = App.state.appointments.map(a => 
    `"${a.id}","${a.doctor}","${a.spec}","${a.hospital}","${a.date}","${a.time}","${a.type}","${a.status}","${a.notes || ''}"`
  ).join('\n');

  downloadTextFile('CarePlus_Appointments_Schedule.csv', header + rows, 'text/csv');
  toast('Appointments schedule exported successfully');
}

// --- Health Records Module ---
function filterRecordCategory(cat, btn) {
  App.state.activeRecordCategory = cat;
  document.querySelectorAll('#recordTabs .tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderRecords();
}

function renderRecords() {
  const grid = document.getElementById('recordGrid');
  if (!grid) return;

  const cat = App.state.activeRecordCategory;
  const list = App.state.records.filter(r => {
    if (cat === 'all') return true;
    return r.category.toLowerCase() === cat.toLowerCase();
  });

  if (list.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:40px;" class="card">
        <h3>No records in this category</h3>
        <p class="muted">Click "Upload Record" to add your diagnostic reports.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = list.map(r => `
    <div class="card record-card">
      <div>
        <div class="card-icon-header ${r.category.includes('Lab') ? 'teal' : r.category.includes('Radio') ? 'blue' : 'purple'}">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
        <span class="pill" style="margin-bottom:8px;">${r.category}</span>
        <h3>${r.title}</h3>
        <p>${r.date} · ${r.facility}</p>
        <p class="muted" style="font-size:12px;line-height:1.4;">${r.summary}</p>
      </div>
      <div class="card-actions-row">
        <button class="btn-secondary" style="flex:1;" onclick="viewRecord('${r.id}')">View</button>
        <button class="primary" style="flex:1;" onclick="downloadRecord('${r.id}')">Download</button>
        <button class="btn-danger" style="padding:9px 12px;" onclick="deleteRecord('${r.id}')" title="Delete record">🗑</button>
      </div>
    </div>
  `).join('');
}

function openUploadRecordModal() {
  const todayIso = new Date().toISOString().split('T')[0];

  openModal(`
    <h2>Upload Health Record</h2>
    <p class="muted">Attach laboratory reports, prescriptions, or clinical imaging scans.</p>

    <div class="form-group">
      <label>Record Title</label>
      <input id="recTitleInput" placeholder="e.g. Lipid Profile, Chest X-Ray, Eye Checkup">
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
      <div class="form-group">
        <label>Category</label>
        <select id="recCategorySelect">
          <option value="Lab Report">Lab Report</option>
          <option value="Radiology & Imaging">Radiology & Imaging</option>
          <option value="Prescription">Prescription</option>
          <option value="Discharge Summary">Discharge Summary</option>
        </select>
      </div>
      <div class="form-group">
        <label>Document Date</label>
        <input type="date" id="recDateInput" value="${todayIso}">
      </div>
    </div>

    <div class="form-group">
      <label>Doctor or Issuing Medical Facility</label>
      <input id="recFacilityInput" placeholder="e.g. City Diagnostics, Dr. Arjun Rao">
    </div>

    <div class="form-group">
      <label>Summary / Findings Note</label>
      <textarea id="recSummaryInput" rows="2" placeholder="Brief clinical impression or normal parameters..."></textarea>
    </div>

    <div class="form-group">
      <label>Choose File (PDF, PNG, JPG)</label>
      <input type="file" id="recFileInput" accept=".pdf,.png,.jpg,.jpeg">
    </div>

    <div class="modal-footer">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="primary" onclick="saveUploadedRecord()">Upload Record</button>
    </div>
  `);
}

function saveUploadedRecord() {
  const title = document.getElementById('recTitleInput')?.value.trim();
  const category = document.getElementById('recCategorySelect')?.value || 'Lab Report';
  const date = document.getElementById('recDateInput')?.value || new Date().toISOString().split('T')[0];
  const facility = document.getElementById('recFacilityInput')?.value.trim() || 'CarePlus Diagnostics';
  const summary = document.getElementById('recSummaryInput')?.value.trim() || 'Verified clinical diagnostic report.';

  if (!title) {
    toast('Please enter a record title.');
    return;
  }

  const newRec = {
    id: 'rec-' + Date.now(),
    title: title,
    category: category,
    doctor: 'CarePlus Clinical Staff',
    facility: facility,
    date: date,
    size: '1.4 MB',
    summary: summary
  };

  App.state.records.unshift(newRec);
  App.save('records');

  closeModal();
  renderRecords();
  toast(`Record "${title}" uploaded successfully!`);
}

function viewRecord(id) {
  const r = App.state.records.find(rec => rec.id === id);
  if (!r) return;

  openModal(`
    <h2>${r.title}</h2>
    <p class="muted">${r.category} · ${r.date}</p>

    <div style="background:var(--bg-subtle);border:1px solid var(--border-light);border-radius:var(--radius-md);padding:20px;margin:18px 0;font-size:13px;line-height:1.6;">
      <div style="display:flex;justify-content:space-between;border-bottom:1px solid var(--border-light);padding-bottom:10px;margin-bottom:10px;">
        <div><strong>Patient:</strong> ${App.state.profile.name} (ID: ${App.state.profile.patientId})</div>
        <div><strong>Date:</strong> ${r.date}</div>
      </div>
      <div><strong>Diagnostic Facility:</strong> ${r.facility}</div>
      <div><strong>Document Category:</strong> ${r.category}</div>
      <div style="margin-top:12px;padding:12px;background:var(--bg-card);border-radius:var(--radius-sm);border:1px solid var(--border-light);">
        <strong>Clinical Impression:</strong>
        <p style="margin-top:4px;color:var(--text-main);">${r.summary}</p>
      </div>
      <div style="margin-top:12px;font-size:11px;color:var(--text-muted);text-align:right;">
        ✓ Authenticated Digital Signature · CarePlus Health Informatics
      </div>
    </div>

    <div class="modal-footer">
      <button class="btn-secondary" onclick="closeModal()">Close</button>
      <button class="primary" onclick="downloadRecord('${r.id}')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Download File
      </button>
    </div>
  `);
}

function downloadRecord(id) {
  const r = App.state.records.find(rec => rec.id === id);
  if (!r) return;

  const content = `=============================================================
CAREPLUS HEALTHCARE PORTAL — CLINICAL MEDICAL RECORD
=============================================================
Document: ${r.title}
Category: ${r.category}
Date of Exam: ${r.date}
Facility: ${r.facility}

PATIENT INFORMATION:
Name: ${App.state.profile.name}
Patient ID: ${App.state.profile.patientId}
Email: ${App.state.profile.email}
Phone: ${App.state.profile.phone}
Blood Group: ${App.state.profile.bloodGroup}

CLINICAL FINDINGS & SUMMARY:
${r.summary}

=============================================================
Verified Authenticated Digital Copy
CarePlus Clinical Informatics System (Demo Mode)
=============================================================`;

  downloadTextFile(`CarePlus_Record_${r.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`, content, 'text/plain');
  toast(`Downloading "${r.title}"`);
}

function deleteRecord(id) {
  if (confirm('Are you sure you want to remove this health record?')) {
    App.state.records = App.state.records.filter(r => r.id !== id);
    App.save('records');
    renderRecords();
    toast('Record deleted.');
  }
}

// --- Medicines Module ---
function renderMedicines() {
  const tbody = document.getElementById('medicineRows');
  if (!tbody) return;

  if (App.state.medicines.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;padding:30px;color:var(--text-muted);">
          No medications active. Click "Add Medicine" to track a prescription.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = App.state.medicines.map(m => `
    <tr>
      <td>
        <strong>${m.name}</strong>
      </td>
      <td>${m.dose}</td>
      <td>${m.schedule}</td>
      <td>${m.start}</td>
      <td>${m.instructions || 'As directed'}</td>
      <td>
        <button class="status-badge ${m.takenToday ? 'completed' : 'pending'}" style="cursor:pointer;" onclick="toggleMedTaken('${m.id}')">
          ${m.takenToday ? '✓ Taken Today' : '○ Pending'}
        </button>
      </td>
      <td style="text-align:right;">
        <div style="display:flex;gap:6px;justify-content:flex-end;">
          <button class="btn-secondary" style="padding:4px 8px;font-size:12px;" onclick="editMedicine('${m.id}')">Edit</button>
          <button class="btn-danger" style="padding:4px 8px;font-size:12px;" onclick="deleteMedicine('${m.id}')">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function toggleMedTaken(id) {
  const med = App.state.medicines.find(m => m.id === id);
  if (med) {
    med.takenToday = !med.takenToday;
    App.save('medicines');
    renderMedicines();
    renderDashboard();
    toast(`${med.name} marked as ${med.takenToday ? 'Taken' : 'Pending'}`);
  }
}

function openAddMedicineModal() {
  const todayIso = new Date().toISOString().split('T')[0];

  openModal(`
    <h2>Add Medication</h2>
    <p class="muted">Enter prescription details to configure reminder schedules.</p>

    <div class="form-group">
      <label>Medicine Name</label>
      <input id="medNameInput" placeholder="e.g. Atorvastatin, Metformin, Vitamin C">
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
      <div class="form-group">
        <label>Dosage & Strength</label>
        <input id="medDoseInput" placeholder="e.g. 500 mg, 1 tablet, 5 ml">
      </div>
      <div class="form-group">
        <label>Intake Timing</label>
        <select id="medScheduleSelect">
          <option value="Daily · After breakfast">Daily · After breakfast</option>
          <option value="Daily · After dinner">Daily · After dinner</option>
          <option value="Twice daily · Morning & Night">Twice daily · Morning & Night</option>
          <option value="Daily · 30m before bed">Daily · 30m before bed</option>
          <option value="Weekly · Sunday morning">Weekly · Sunday morning</option>
        </select>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
      <div class="form-group">
        <label>Start Date</label>
        <input type="date" id="medStartDateInput" value="${todayIso}">
      </div>
      <div class="form-group">
        <label>Duration / Refill Period</label>
        <input id="medDurationInput" placeholder="e.g. 30 days, 3 months, Ongoing">
      </div>
    </div>

    <div class="form-group">
      <label>Doctor's Instructions</label>
      <input id="medInstructionsInput" placeholder="e.g. Take with food, avoid grapefruit juice">
    </div>

    <div class="modal-footer">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="primary" onclick="saveMedicine()">Save Medication</button>
    </div>
  `);
}

function saveMedicine() {
  const name = document.getElementById('medNameInput')?.value.trim();
  const dose = document.getElementById('medDoseInput')?.value.trim() || '1 unit';
  const schedule = document.getElementById('medScheduleSelect')?.value || 'Daily';
  const start = document.getElementById('medStartDateInput')?.value || new Date().toISOString().split('T')[0];
  const duration = document.getElementById('medDurationInput')?.value.trim() || 'Ongoing';
  const instructions = document.getElementById('medInstructionsInput')?.value.trim() || 'As directed by physician';

  if (!name) {
    toast('Please enter the medication name.');
    return;
  }

  const newMed = {
    id: 'med-' + Date.now(),
    name: name,
    dose: dose,
    schedule: schedule,
    start: start,
    duration: duration,
    instructions: instructions,
    takenToday: false
  };

  App.state.medicines.push(newMed);
  App.save('medicines');

  closeModal();
  renderMedicines();
  renderDashboard();
  toast(`Medication "${name}" added successfully!`);
}

function editMedicine(id) {
  const med = App.state.medicines.find(m => m.id === id);
  if (!med) return;

  openModal(`
    <h2>Edit Medication</h2>
    <p class="muted">Update details for ${med.name}</p>

    <div class="form-group">
      <label>Medicine Name</label>
      <input id="editMedName" value="${med.name}">
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
      <div class="form-group">
        <label>Dosage</label>
        <input id="editMedDose" value="${med.dose}">
      </div>
      <div class="form-group">
        <label>Schedule</label>
        <input id="editMedSchedule" value="${med.schedule}">
      </div>
    </div>

    <div class="form-group">
      <label>Instructions</label>
      <input id="editMedInstructions" value="${med.instructions}">
    </div>

    <div class="modal-footer">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="primary" onclick="saveEditedMedicine('${med.id}')">Save Changes</button>
    </div>
  `);
}

function saveEditedMedicine(id) {
  const med = App.state.medicines.find(m => m.id === id);
  if (!med) return;

  med.name = document.getElementById('editMedName')?.value.trim() || med.name;
  med.dose = document.getElementById('editMedDose')?.value.trim() || med.dose;
  med.schedule = document.getElementById('editMedSchedule')?.value.trim() || med.schedule;
  med.instructions = document.getElementById('editMedInstructions')?.value.trim() || med.instructions;

  App.save('medicines');
  closeModal();
  renderMedicines();
  renderDashboard();
  toast('Medication updated successfully.');
}

function deleteMedicine(id) {
  if (confirm('Are you sure you want to remove this medication?')) {
    App.state.medicines = App.state.medicines.filter(m => m.id !== id);
    App.save('medicines');
    renderMedicines();
    renderDashboard();
    toast('Medication removed.');
  }
}

// --- Lab Tests Module ---
function renderLabTests() {
  const grid = document.getElementById('labGrid');
  if (!grid) return;

  const search = (document.getElementById('labSearchInput')?.value || '').toLowerCase().trim();
  const cat = document.getElementById('labCategorySelect')?.value || '';

  const list = App.state.labTests.filter(t => {
    const matchSearch = !search || (t.name + ' ' + t.description + ' ' + t.category).toLowerCase().includes(search);
    const matchCat = !cat || t.category.toLowerCase().includes(cat.toLowerCase());
    return matchSearch && matchCat;
  });

  if (list.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:40px;" class="card">
        <h3>No diagnostic tests found</h3>
        <p class="muted">Try refining your search query or selecting "All Test Categories".</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = list.map(t => `
    <div class="card lab-card">
      <div>
        <div class="card-icon-header emerald">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 2v7.31L4.75 18.1A2 2 0 0 0 6.46 21h11.08a2 2 0 0 0 1.71-2.9L14 9.31V2"/><path d="M8.5 2h7"/></svg>
        </div>
        <span class="pill" style="margin-bottom:8px;">${t.category}</span>
        <h3>${t.name}</h3>
        <p>₹${t.price} · Turnaround: ${t.turnaround}</p>
        <p class="muted" style="font-size:12px;line-height:1.4;">${t.description}</p>
      </div>
      <div class="card-actions-row">
        <button class="btn-secondary" style="flex:1;" onclick="viewLabDetails('${t.id}')">Details</button>
        <button class="primary" style="flex:1;" onclick="openLabBookingModal('${t.name}')">Book Now</button>
      </div>
    </div>
  `).join('');
}

function filterLabTests() {
  renderLabTests();
}

function viewLabDetails(id) {
  const t = App.state.labTests.find(test => test.id === id);
  if (!t) return;

  openModal(`
    <h2>${t.name}</h2>
    <p class="muted">${t.category} Diagnostic Package</p>

    <div style="background:var(--bg-subtle);border-radius:var(--radius-md);padding:16px;margin:18px 0;font-size:13px;line-height:1.6;">
      <div style="margin-bottom:6px;"><strong>Estimated Price:</strong> ₹${t.price} (Includes home collection)</div>
      <div style="margin-bottom:6px;"><strong>Report Delivery:</strong> Within ${t.turnaround}</div>
      <div style="margin-bottom:6px;"><strong>Preparation Guidelines:</strong> ${t.prep}</div>
      <div><strong>Sample Type:</strong> Venous blood sample / Serum</div>
    </div>

    <h4 style="margin-bottom:6px;font-size:14px;">Test Description</h4>
    <p class="muted" style="font-size:13px;line-height:1.5;margin-bottom:20px;">${t.description}</p>

    <div class="modal-footer">
      <button class="btn-secondary" onclick="closeModal()">Close</button>
      <button class="primary" onclick="closeModal();openLabBookingModal('${t.name}')">Book Test Package</button>
    </div>
  `);
}

function openLabBookingModal(testName = '') {
  const options = App.state.labTests.map(t => {
    const selected = (testName && t.name.includes(testName)) ? 'selected' : '';
    return `<option value="${t.name} — ₹${t.price}" ${selected}>${t.name} (₹${t.price})</option>`;
  }).join('');

  const todayIso = new Date().toISOString().split('T')[0];

  openModal(`
    <h2>Book Diagnostic Test</h2>
    <p class="muted">Schedule home sample collection or visit our accredited lab center.</p>

    <div class="form-group">
      <label>Diagnostic Test / Package</label>
      <select id="labBookingSelect">${options}</select>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
      <div class="form-group">
        <label>Preferred Date</label>
        <input type="date" id="labBookingDate" min="${todayIso}" value="${todayIso}">
      </div>
      <div class="form-group">
        <label>Sample Collection Mode</label>
        <select id="labBookingMode">
          <option value="Home Collection">Free Home Sample Collection</option>
          <option value="Diagnostic Center">Visit Lab Diagnostic Center</option>
        </select>
      </div>
    </div>

    <div class="form-group">
      <label>Address for Collection / Patient Note</label>
      <input id="labBookingAddress" value="${App.state.profile.address}">
    </div>

    <div class="modal-footer">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="primary" onclick="saveLabBooking()">Confirm Lab Booking</button>
    </div>
  `);
}

function saveLabBooking() {
  const testInfo = document.getElementById('labBookingSelect')?.value || 'Diagnostic Test';
  const date = document.getElementById('labBookingDate')?.value;
  const mode = document.getElementById('labBookingMode')?.value || 'Home Collection';

  if (!date) {
    toast('Please select a collection date.');
    return;
  }

  // Add booking to appointments
  const testTitle = testInfo.split(' — ')[0];
  App.state.appointments.unshift({
    id: 'lab-apt-' + Date.now(),
    doctor: 'CarePlus Diagnostics',
    spec: 'Laboratory Pathology',
    hospital: mode,
    date: date,
    time: '07:30 AM',
    type: mode,
    status: 'Confirmed',
    notes: `Diagnostic Test: ${testTitle}`
  });
  App.save('appointments');

  closeModal();
  renderAppointments();
  toast(`${testTitle} booked for ${date} (${mode})!`);
}

// --- Health Tracking Module ---
function renderTracking() {
  const grid = document.getElementById('trackingGrid');
  const historyTbody = document.getElementById('metricHistoryRows');
  if (!grid || !historyTbody) return;

  // Render Metric Cards
  grid.innerHTML = `
    <div class="card metric">
      <div class="stat-header">
        <small>HEART RATE</small>
        <div class="stat-icon red">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
        </div>
      </div>
      <strong>72 BPM</strong>
      <div class="trend up">Optimal Resting Rate</div>
      <button class="primary full-btn" style="margin-top:14px;" onclick="openAddMetricModal('Heart Rate')">+ Add Reading</button>
    </div>

    <div class="card metric">
      <div class="stat-header">
        <small>BLOOD PRESSURE</small>
        <div class="stat-icon blue">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
        </div>
      </div>
      <strong>118/76 mmHg</strong>
      <div class="trend up">Normal Hemodynamics</div>
      <button class="primary full-btn" style="margin-top:14px;" onclick="openAddMetricModal('Blood Pressure')">+ Add Reading</button>
    </div>

    <div class="card metric">
      <div class="stat-header">
        <small>BODY WEIGHT</small>
        <div class="stat-icon emerald">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
      </div>
      <strong>68.4 kg</strong>
      <div class="trend up">↓ 0.6 kg this month</div>
      <button class="primary full-btn" style="margin-top:14px;" onclick="openAddMetricModal('Body Weight')">+ Add Reading</button>
    </div>

    <div class="card metric">
      <div class="stat-header">
        <small>FASTING GLUCOSE</small>
        <div class="stat-icon purple">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
      </div>
      <strong>92 mg/dL</strong>
      <div class="trend up">Optimal Glycemic Index</div>
      <button class="primary full-btn" style="margin-top:14px;" onclick="openAddMetricModal('Fasting Blood Glucose')">+ Add Reading</button>
    </div>
  `;

  // Render Log History Table
  if (App.state.metrics.length === 0) {
    historyTbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center;padding:25px;color:var(--text-muted);">
          No biometric readings logged yet. Click "Add Metric Reading".
        </td>
      </tr>
    `;
    return;
  }

  historyTbody.innerHTML = App.state.metrics.map(m => `
    <tr>
      <td><strong>${m.type}</strong></td>
      <td>${m.value}</td>
      <td>${m.date}</td>
      <td><span class="status-badge active">${m.status || 'Logged'}</span></td>
      <td style="text-align:right;">
        <button class="btn-danger" style="padding:4px 8px;font-size:11px;" onclick="deleteMetric('${m.id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

function openAddMetricModal(defaultType = 'Heart Rate') {
  const todayIso = new Date().toISOString().slice(0, 16);

  openModal(`
    <h2>Log Biometric Reading</h2>
    <p class="muted">Record vital signs and clinical biomarkers.</p>

    <div class="form-group">
      <label>Biometric Indicator</label>
      <select id="metricTypeSelect">
        <option value="Heart Rate" ${defaultType === 'Heart Rate' ? 'selected' : ''}>Heart Rate (BPM)</option>
        <option value="Blood Pressure" ${defaultType === 'Blood Pressure' ? 'selected' : ''}>Blood Pressure (mmHg)</option>
        <option value="Body Weight" ${defaultType === 'Body Weight' ? 'selected' : ''}>Body Weight (kg)</option>
        <option value="Steps Walked" ${defaultType === 'Steps Walked' ? 'selected' : ''}>Daily Steps (count)</option>
        <option value="Fasting Blood Glucose" ${defaultType === 'Fasting Blood Glucose' ? 'selected' : ''}>Blood Glucose (mg/dL)</option>
        <option value="Blood Oxygen (SpO2)" ${defaultType === 'Blood Oxygen (SpO2)' ? 'selected' : ''}>Blood Oxygen SpO2 (%)</option>
      </select>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
      <div class="form-group">
        <label>Measured Value</label>
        <input id="metricValueInput" placeholder="e.g. 74 or 120/80">
      </div>
      <div class="form-group">
        <label>Timestamp</label>
        <input type="datetime-local" id="metricTimeInput" value="${todayIso}">
      </div>
    </div>

    <div class="modal-footer">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="primary" onclick="saveMetricReading()">Save Reading</button>
    </div>
  `);
}

function saveMetricReading() {
  const type = document.getElementById('metricTypeSelect')?.value || 'Heart Rate';
  const val = document.getElementById('metricValueInput')?.value.trim();
  const time = document.getElementById('metricTimeInput')?.value || new Date().toISOString().replace('T', ' ').slice(0, 16);

  if (!val) {
    toast('Please enter a measured value.');
    return;
  }

  const newM = {
    id: 'm-' + Date.now(),
    type: type,
    value: val,
    status: 'Recorded',
    date: time
  };

  App.state.metrics.unshift(newM);
  App.save('metrics');

  closeModal();
  renderTracking();
  renderDashboard();
  toast(`${type} reading saved successfully!`);
}

function deleteMetric(id) {
  App.state.metrics = App.state.metrics.filter(m => m.id !== id);
  App.save('metrics');
  renderTracking();
  toast('Metric reading deleted.');
}

function exportMetrics() {
  const header = 'ID,Type,Value,Date,Status\n';
  const rows = App.state.metrics.map(m => `"${m.id}","${m.type}","${m.value}","${m.date}","${m.status}"`).join('\n');
  downloadTextFile('CarePlus_Biometrics_Log.csv', header + rows, 'text/csv');
  toast('Biometric logs exported');
}

// --- Health Articles Module (Authentic Real Photography & Clinical Overviews) ---
function filterArticles(cat, btn) {
  App.state.activeArticleCategory = cat;
  document.querySelectorAll('#articleTabs .tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderArticles();
}

function renderArticles() {
  const grid = document.getElementById('articleGrid');
  if (!grid) return;

  const cat = App.state.activeArticleCategory;
  const list = App.state.articles.filter(a => {
    if (cat === 'all') return true;
    return a.category.toLowerCase() === cat.toLowerCase();
  });

  grid.innerHTML = list.map(a => `
    <div class="card article-card">
      <div class="article-header-banner">
        <img src="${a.photo}" alt="${a.title}" class="article-img" onerror="this.onerror=null; if(this.src!=='${a.fallbackPhoto}'){this.src='${a.fallbackPhoto}'}else{this.style.display='none'; this.nextElementSibling.style.display='flex';}" loading="lazy">
        <div class="article-fallback-art" style="display:none;width:100%;height:100%;align-items:center;justify-content:center;background:var(--bg-subtle);">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10M6 10h10M6 14h6"/></svg>
        </div>
      </div>
      <div class="article-body">
        <div>
          <span class="pill">${a.category} · ${a.readMinutes} MIN READ</span>
          <h3>${a.title}</h3>
          <p>${a.summary}</p>
        </div>
        <button class="primary full-btn" onclick="openArticleReader('${a.id}')">
          <span>Read Clinical Guide</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>
  `).join('');
}

function openArticleReader(id) {
  const a = App.state.articles.find(art => art.id === id);
  if (!a) return;

  const takeawaysHtml = a.takeaways ? `
    <div style="background:var(--bg-subtle);border-left:4px solid var(--primary);padding:14px;border-radius:var(--radius-sm);margin:16px 0;">
      <strong>Key Clinical Takeaways:</strong>
      <ul style="margin-top:6px;padding-left:20px;font-size:13px;line-height:1.6;">
        ${a.takeaways.map(t => `<li>${t}</li>`).join('')}
      </ul>
    </div>
  ` : '';

  openModal(`
    <div style="border-radius:var(--radius-md);overflow:hidden;margin-bottom:16px;height:180px;background:var(--bg-subtle);">
      <img src="${a.photo}" alt="${a.title}" style="width:100%;height:100%;object-fit:cover;" onerror="this.onerror=null; this.src='${a.fallbackPhoto}';">
    </div>
    <span class="pill" style="margin-bottom:8px;">${a.category} · ${a.readMinutes} MIN READ</span>
    <h2>${a.title}</h2>
    <p class="muted" style="font-size:12px;margin-bottom:14px;">Author: ${a.author}</p>

    ${takeawaysHtml}

    <div style="font-size:13px;line-height:1.7;color:var(--text-main);margin:16px 0;">
      ${a.content.replace(/\\n\\n/g, '<br><br>')}
    </div>

    <div style="background:var(--border-subtle);padding:10px;border-radius:var(--radius-sm);font-size:11px;color:var(--text-muted);margin:16px 0;">
      <strong>Medical Disclaimer:</strong> This article is published for educational and wellness guidance. It is not intended as medical diagnosis or treatment. Consult a licensed clinician for individualized health concerns.
    </div>

    <div class="modal-footer">
      <button class="btn-secondary" onclick="toggleArticleBookmark('${a.id}')">
        ${a.bookmarked ? '★ Bookmarked' : '☆ Bookmark Article'}
      </button>
      <button class="primary" onclick="closeModal()">Close</button>
    </div>
  `);
}

function toggleArticleBookmark(id) {
  const a = App.state.articles.find(art => art.id === id);
  if (a) {
    a.bookmarked = !a.bookmarked;
    App.save('articles');
    toast(a.bookmarked ? 'Article saved to reading list' : 'Bookmark removed');
    closeModal();
  }
}

// --- Emergency Module ---
function renderEmergency() {
  const tbody = document.getElementById('emergencyHospitalRows');
  if (!tbody) return;

  tbody.innerHTML = DEFAULT_EMERGENCY_HOSPITALS.map(h => `
    <tr>
      <td><strong>${h.name}</strong></td>
      <td><span class="pill">${h.distance}</span></td>
      <td>${h.trauma}</td>
      <td><strong>${h.phone}</strong></td>
      <td style="text-align:right;">
        <button class="danger" style="padding:6px 12px;font-size:12px;" onclick="callEmergency('${h.phone}')">
          Call ER
        </button>
      </td>
    </tr>
  `).join('');
}

function callEmergency(number) {
  if (confirm(`Connect emergency call to ${number} immediately?`)) {
    window.location.href = 'tel:' + number.replace(/[^0-9+]/g, '');
  }
}

function downloadEmergencyCard() {
  const p = App.state.profile;
  const card = `=============================================================
CAREPLUS EMERGENCY MEDICAL PROFILE CARD
=============================================================
PATIENT: ${p.name}
PATIENT ID: ${p.patientId}
DATE OF BIRTH: ${p.dob}
BLOOD GROUP: ${p.bloodGroup}

EMERGENCY CONTACT:
${p.emergencyContact}

PRIMARY ADDRESS:
${p.address}

ACTIVE MEDICATIONS:
${App.state.medicines.map(m => '- ' + m.name + ' (' + m.dose + ')').join('\n') || 'None recorded'}

KNOWN ALLERGIES:
No drug allergies reported (NKDA)

=============================================================
Please present this medical card to first responders or ER triage.
=============================================================`;

  downloadTextFile('CarePlus_Emergency_Card.txt', card, 'text/plain');
  toast('Emergency Medical Card downloaded.');
}

// --- Profile Module (Authentic Portrait & Monogram Fallback) ---
function renderProfile() {
  const p = App.state.profile;
  const initials = p.name.split(' ').map(n => n[0]).join('');
  const photoUrl = p.photo || 'assets/images/profile/vaseem_basha.jpg';
  const photoFallback = p.fallbackPhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80';

  const topAvatarEl = document.getElementById('topAvatar');
  if (topAvatarEl) {
    topAvatarEl.innerHTML = `
      <img src="${photoUrl}" alt="${p.name}" class="avatar-photo" onerror="this.onerror=null; if(this.src!=='${photoFallback}'){this.src='${photoFallback}'}else{this.style.display='none'; this.nextElementSibling.style.display='block';}" loading="lazy">
      <span class="avatar-initials" style="display:none;">${initials}</span>
    `;
  }

  const bigAvatarEl = document.getElementById('profileBigAvatar');
  if (bigAvatarEl) {
    bigAvatarEl.innerHTML = `
      <img src="${photoUrl}" alt="${p.name}" class="big-avatar-photo" onerror="this.onerror=null; if(this.src!=='${photoFallback}'){this.src='${photoFallback}'}else{this.style.display='none'; this.nextElementSibling.style.display='block';}" loading="lazy">
      <span class="avatar-initials" style="display:none;">${initials}</span>
    `;
  }

  const nameEl = document.getElementById('profileName');
  if (nameEl) nameEl.textContent = p.name;
  const idEl = document.getElementById('profileId');
  if (idEl) idEl.textContent = 'Patient ID: ' + p.patientId;
  const emailEl = document.getElementById('profileEmail');
  if (emailEl) emailEl.textContent = p.email;
  const phoneEl = document.getElementById('profilePhone');
  if (phoneEl) phoneEl.textContent = p.phone;
  const dobEl = document.getElementById('profileDob');
  if (dobEl) dobEl.textContent = p.dobDisplay || p.dob;
  const genderEl = document.getElementById('profileGender');
  if (genderEl) genderEl.textContent = `${p.gender} · ${p.bloodGroup}`;
  const emEl = document.getElementById('profileEmergencyContact');
  if (emEl) emEl.textContent = p.emergencyContact;
  const addrEl = document.getElementById('profileAddress');
  if (addrEl) addrEl.textContent = p.address;
}

function openEditProfileModal() {
  const p = App.state.profile;

  openModal(`
    <h2>Edit Profile</h2>
    <p class="muted">Update identification, clinical demographics, and contact info.</p>

    <div class="form-group">
      <label>Full Name</label>
      <input id="profNameInput" value="${p.name}">
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
      <div class="form-group">
        <label>Email Address</label>
        <input id="profEmailInput" type="email" value="${p.email}">
      </div>
      <div class="form-group">
        <label>Phone Number</label>
        <input id="profPhoneInput" value="${p.phone}">
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
      <div class="form-group">
        <label>Date of Birth</label>
        <input type="date" id="profDobInput" value="${p.dob}">
      </div>
      <div class="form-group">
        <label>Blood Group</label>
        <select id="profBloodSelect">
          <option value="O Positive (O+)" ${p.bloodGroup.includes('O+') ? 'selected' : ''}>O Positive (O+)</option>
          <option value="O Negative (O-)" ${p.bloodGroup.includes('O-') ? 'selected' : ''}>O Negative (O-)</option>
          <option value="A Positive (A+)" ${p.bloodGroup.includes('A+') ? 'selected' : ''}>A Positive (A+)</option>
          <option value="A Negative (A-)" ${p.bloodGroup.includes('A-') ? 'selected' : ''}>A Negative (A-)</option>
          <option value="B Positive (B+)" ${p.bloodGroup.includes('B+') ? 'selected' : ''}>B Positive (B+)</option>
          <option value="AB Positive (AB+)" ${p.bloodGroup.includes('AB+') ? 'selected' : ''}>AB Positive (AB+)</option>
        </select>
      </div>
    </div>

    <div class="form-group">
      <label>Emergency Contact Person & Phone</label>
      <input id="profEmergencyInput" value="${p.emergencyContact}">
    </div>

    <div class="form-group">
      <label>Residential Address</label>
      <input id="profAddressInput" value="${p.address}">
    </div>

    <div class="modal-footer">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="primary" onclick="saveProfile()">Save Profile</button>
    </div>
  `);
}

function saveProfile() {
  const name = document.getElementById('profNameInput')?.value.trim();
  const email = document.getElementById('profEmailInput')?.value.trim();
  const phone = document.getElementById('profPhoneInput')?.value.trim();
  const dob = document.getElementById('profDobInput')?.value;
  const blood = document.getElementById('profBloodSelect')?.value || 'O Positive (O+)';
  const emergency = document.getElementById('profEmergencyInput')?.value.trim();
  const address = document.getElementById('profAddressInput')?.value.trim();

  if (!name || !email) {
    toast('Name and email are required.');
    return;
  }

  App.state.profile.name = name;
  App.state.profile.email = email;
  App.state.profile.phone = phone || App.state.profile.phone;
  App.state.profile.dob = dob || App.state.profile.dob;
  App.state.profile.bloodGroup = blood;
  App.state.profile.emergencyContact = emergency || App.state.profile.emergencyContact;
  App.state.profile.address = address || App.state.profile.address;

  App.save('profile');
  closeModal();
  renderProfile();
  renderDashboard();
  toast('Profile updated successfully!');
}

// --- Notifications Module ---
function updateNotificationBadge() {
  const unread = App.state.notifications.filter(n => !n.read).length;
  const badge = document.getElementById('unreadBadge');
  if (badge) {
    badge.textContent = unread;
    badge.style.display = unread > 0 ? 'inline-block' : 'none';
  }
}

function renderNotifications() {
  const container = document.getElementById('notificationContainer');
  if (!container) return;

  updateNotificationBadge();

  if (App.state.notifications.length === 0) {
    container.innerHTML = `<p class="muted" style="padding:20px;text-align:center;">No notifications at this time.</p>`;
    return;
  }

  container.innerHTML = App.state.notifications.map((n, i) => `
    <div class="notification-item ${!n.read ? 'unread' : ''}" onclick="handleNotificationClick(${i})">
      <div class="notification-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
      </div>
      <div style="flex:1;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <strong>${n.title}</strong>
          <span style="font-size:11px;color:var(--text-muted);">${n.time}</span>
        </div>
        <p class="muted" style="margin-top:4px;font-size:13px;">${n.message}</p>
      </div>
    </div>
  `).join('');
}

function handleNotificationClick(i) {
  const n = App.state.notifications[i];
  if (n) {
    n.read = true;
    App.save('notifications');
    renderNotifications();
    if (n.type === 'appointment') showPage('appointments');
    if (n.type === 'medicine') showPage('medicines');
    if (n.type === 'record') showPage('records');
    if (n.type === 'tracking') showPage('tracking');
  }
}

function markAllNotificationsRead() {
  App.state.notifications.forEach(n => { n.read = true; });
  App.save('notifications');
  renderNotifications();
  toast('All notifications marked as read.');
}

function clearAllNotifications() {
  App.state.notifications = [];
  App.save('notifications');
  renderNotifications();
  toast('Notifications cleared.');
}

// --- Settings Module ---
function renderSettings() {
  const s = App.state.settings;
  const appSel = document.getElementById('appearanceSelect');
  if (appSel) appSel.value = s.appearance || 'system';

  const remChk = document.getElementById('setReminders');
  if (remChk) remChk.checked = !!s.reminders;

  const medChk = document.getElementById('setMedAlerts');
  if (medChk) medChk.checked = !!s.medAlerts;

  const emailChk = document.getElementById('setEmailAlerts');
  if (emailChk) emailChk.checked = !!s.emailAlerts;

  const privChk = document.getElementById('setPrivacy');
  if (privChk) privChk.checked = !!s.privacy;
}

function saveSettingToggle(key, value) {
  App.state.settings[key] = value;
  App.save('settings');
  toast(`${key} preference updated.`);
}

function exportFullHealthData() {
  const data = {
    exportDate: new Date().toISOString(),
    profile: App.state.profile,
    appointments: App.state.appointments,
    medicines: App.state.medicines,
    records: App.state.records,
    metrics: App.state.metrics,
    settings: App.state.settings
  };

  downloadTextFile('CarePlus_Complete_Health_Backup.json', JSON.stringify(data, null, 2), 'application/json');
  toast('Complete health archive downloaded.');
}

function confirmResetData() {
  if (confirm('Are you sure you want to reset all data back to original sample defaults? This cannot be undone.')) {
    localStorage.clear();
    toast('Application data reset. Reloading...');
    setTimeout(() => { window.location.reload(); }, 800);
  }
}

// --- Support Modal Module ---
function openSupportModal() {
  openModal(`
    <h2>24/7 Clinical & Technical Support</h2>
    <p class="muted">Our care coordination team responds within 15 minutes.</p>

    <div class="form-group">
      <label>Inquiry Category</label>
      <select id="supCategory">
        <option value="Appointment Support">Appointment Scheduling / Reschedule</option>
        <option value="Prescription Refill">Medication Refill Request</option>
        <option value="Lab Reports">Diagnostic Lab Report Inquiry</option>
        <option value="Technical Assistance">Portal Technical Assistance</option>
      </select>
    </div>

    <div class="form-group">
      <label>Subject</label>
      <input id="supSubject" placeholder="Brief summary of inquiry...">
    </div>

    <div class="form-group">
      <label>Message / Clinical Question</label>
      <textarea id="supMessage" rows="3" placeholder="Please describe how we can assist you..."></textarea>
    </div>

    <div class="modal-footer">
      <button class="btn-secondary" onclick="closeModal()">Close</button>
      <button class="primary" onclick="submitSupportTicket()">Submit Support Request</button>
    </div>
  `);
}

function submitSupportTicket() {
  const sub = document.getElementById('supSubject')?.value.trim() || 'General Inquiry';
  const ticketId = 'TKT-' + Math.floor(100000 + Math.random() * 900000);

  closeModal();
  toast(`Support ticket ${ticketId} submitted! Care team notified.`);
}

// --- Utility File Downloader ---
function downloadTextFile(filename, text, mimeType = 'text/plain') {
  const blob = new Blob([text], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// --- Event Listeners & Global Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  renderDashboard();
  renderProfile();
  updateNotificationBadge();

  // Modal backdrop click
  const modal = document.getElementById('modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target.id === 'modal') closeModal();
    });
  }

  // Keyboard Escape listener
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
});
