const doctors=[
{name:"Dr. Arjun Rao",spec:"Cardiologist",rating:"4.9",exp:"12 years",emoji:"👨‍⚕️"},
{name:"Dr. Priya Sharma",spec:"Dermatologist",rating:"4.8",exp:"9 years",emoji:"👩‍⚕️"},
{name:"Dr. Kiran Kumar",spec:"Neurologist",rating:"4.9",exp:"15 years",emoji:"👨‍⚕️"},
{name:"Dr. Ananya Singh",spec:"Pediatrician",rating:"4.8",exp:"8 years",emoji:"👩‍⚕️"},
{name:"Dr. Rahul Mehta",spec:"Cardiologist",rating:"4.7",exp:"10 years",emoji:"👨‍⚕️"},
{name:"Dr. Sneha Reddy",spec:"Dermatologist",rating:"4.9",exp:"11 years",emoji:"👩‍⚕️"}];
let appointments=[
["Dr. Arjun Rao","Cardiologist","Sep 2, 2026 · 10:30 AM","In-person","Confirmed"],
["Dr. Priya Sharma","Dermatologist","Sep 8, 2026 · 2:00 PM","Video","Confirmed"],
["Dr. Kiran Kumar","Neurologist","Sep 15, 2026 · 11:00 AM","In-person","Pending"]];
let medicines=[
["Vitamin D3","1 capsule","After breakfast","Aug 01, 2026"],
["Omega 3","1 capsule","After dinner","Aug 01, 2026"],
["Magnesium","1 tablet","Before bed","Aug 10, 2026"]];

function showPage(id){
 document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
 const page=document.getElementById(id); if(page) page.classList.add('active');
 document.querySelectorAll('.nav').forEach(n=>n.classList.toggle('active',n.dataset.page===id));
 window.scrollTo({top:0,behavior:'smooth'});
 if(id==='doctors') renderDoctors();
 if(id==='appointments') renderAppointments();
 if(id==='medicines') renderMedicines();
}
function toast(msg){const t=document.getElementById('toast');t.className='toast';t.textContent=msg;clearTimeout(window.tt);window.tt=setTimeout(()=>t.className='',2600)}
function openModal(html){document.getElementById('modalContent').innerHTML=html;document.getElementById('modal').classList.add('show')}
function closeModal(){document.getElementById('modal').classList.remove('show')}
function openAppointment(){
openModal(`<h2>Book an Appointment</h2><p class="muted">Choose a doctor and preferred time.</p>
<div class="form-group"><label>Doctor</label><select id="fdoctor">${doctors.map(d=>`<option>${d.name} — ${d.spec}</option>`).join('')}</select></div>
<div class="form-group"><label>Date</label><input id="fdate" type="date"></div>
<div class="form-group"><label>Time</label><input id="ftime" type="time"></div>
<div class="form-group"><label>Appointment type</label><select id="ftype"><option>In-person</option><option>Video consultation</option></select></div>
<button class="primary modal-submit" onclick="saveAppointment()">Confirm Appointment</button>`)
}
function saveAppointment(){let d=document.getElementById('fdoctor').value.split(' — '),date=document.getElementById('fdate').value||'Selected date',time=document.getElementById('ftime').value||'Selected time',type=document.getElementById('ftype').value;appointments.push([d[0],d[1],`${date} · ${time}`,type,'Confirmed']);closeModal();toast('Appointment booked successfully');renderAppointments()}
function renderDoctors(){
 const q=(document.getElementById('doctorSearch')?.value||'').toLowerCase(),s=document.getElementById('specialty')?.value||'';
 document.getElementById('doctorGrid').innerHTML=doctors.filter(d=>(!q||(d.name+d.spec).toLowerCase().includes(q))&&(!s||d.spec===s)).map((d,i)=>`<div class="doctor card"><div class="doctor-top"><div class="doctor-photo">${d.emoji}</div><div><h3>${d.name}</h3><p>${d.spec}</p><div class="rating">★ ${d.rating} · ${d.exp}</div></div></div><button onclick="openDoctor(${i})">View Profile & Book</button></div>`).join('');
}
function filterDoctors(){renderDoctors()}
function openDoctor(i){const d=doctors[i];openModal(`<h2>${d.name}</h2><p class="muted">${d.spec} · ${d.exp} experience</p><p>★ ${d.rating} rating · Available for appointments</p><p>This demo profile contains general information. For medical advice, consult a qualified healthcare professional.</p><button class="primary modal-submit" onclick="closeModal();openAppointment()">Book Appointment</button>`)}
function renderAppointments(){document.getElementById('appointmentRows').innerHTML=appointments.map((a,i)=>`<tr><td><strong>${a[0]}</strong></td><td>${a[1]}</td><td>${a[2]}</td><td>${a[3]}</td><td><span class="status">${a[4]}</span></td><td><button class="link" onclick="appointmentMenu(${i})">•••</button></td></tr>`).join('')}
function appointmentMenu(i){openModal(`<h2>Appointment options</h2><p>${appointments[i][0]} · ${appointments[i][2]}</p><button class="primary" onclick="toast('Appointment details opened');closeModal()">View Details</button><button class="danger" style="margin-left:8px;padding:10px 13px" onclick="appointments.splice(${i},1);renderAppointments();closeModal();toast('Appointment cancelled')">Cancel</button>`)}
function renderMedicines(){document.getElementById('medicineRows').innerHTML=medicines.map((m,i)=>`<tr><td><strong>💊 ${m[0]}</strong></td><td>${m[1]}</td><td>${m[2]}</td><td>${m[3]}</td><td><button class="link" onclick="removeMedicine(${i})">Remove</button></td></tr>`).join('')}
function openMedicine(){openModal(`<h2>Add Medicine</h2><div class="form-group"><label>Medicine name</label><input id="mname" placeholder="e.g. Paracetamol"></div><div class="form-group"><label>Dosage</label><input id="mdose" placeholder="e.g. 1 tablet"></div><div class="form-group"><label>Schedule</label><input id="mschedule" placeholder="e.g. After breakfast"></div><button class="primary modal-submit" onclick="saveMedicine()">Add Medicine</button>`)}
function saveMedicine(){const n=document.getElementById('mname').value.trim();if(!n)return toast('Enter a medicine name');medicines.push([n,document.getElementById('mdose').value||'As prescribed',document.getElementById('mschedule').value||'As directed','Today']);closeModal();renderMedicines();toast('Medicine added')}
function removeMedicine(i){medicines.splice(i,1);renderMedicines();toast('Medicine removed')}
function toggleMed(el){el.classList.toggle('done');el.textContent=el.classList.contains('done')?'✓':'○';toast(el.classList.contains('done')?'Medication marked complete':'Medication marked incomplete')}
function uploadRecord(){openModal(`<h2>Upload Health Record</h2><div class="form-group"><label>Document</label><input type="file" accept=".pdf,.jpg,.jpeg,.png"></div><div class="form-group"><label>Record title</label><input placeholder="e.g. Blood test"></div><button class="primary modal-submit" onclick="closeModal();toast('Record uploaded in demo mode')">Upload</button>`)}
function viewRecord(name){openModal(`<h2>${name}</h2><p class="muted">Secure document preview</p><div style="padding:35px;text-align:center;background:#f4f7f8;border-radius:12px;margin-top:15px">📄<br><strong>${name}</strong><br><small>Demo preview — no real medical data is stored.</small></div>`)}
function downloadRecord(){toast('Demo file download prepared')}
function bookLab(name='Lab Test'){openModal(`<h2>Book ${name}</h2><div class="form-group"><label>Preferred date</label><input type="date"></div><div class="form-group"><label>Collection</label><select><option>At laboratory</option><option>Home collection</option></select></div><button class="primary modal-submit" onclick="closeModal();toast('${name} booking requested')">Confirm Booking</button>`)}
function addMetric(name='Health Metric'){openModal(`<h2>Add ${name} Reading</h2><div class="form-group"><label>Value</label><input type="number" placeholder="Enter value"></div><div class="form-group"><label>Date</label><input type="date"></div><button class="primary modal-submit" onclick="closeModal();toast('Health reading saved')">Save Reading</button>`)}
function readArticle(){openModal(`<h2>Health article</h2><p class="muted">General wellness information</p><p>Healthy routines are built from small, consistent actions: eat a varied diet, stay active, sleep regularly, manage stress, and keep preventive appointments.</p><p><strong>Note:</strong> This website provides general educational information and is not a substitute for professional medical advice.</p>`)}
function editProfile(){openModal(`<h2>Edit Profile</h2><div class="form-group"><label>Full name</label><input value="Vaseem Basha"></div><div class="form-group"><label>Email</label><input value="vaseem@example.com"></div><div class="form-group"><label>Phone</label><input placeholder="+91"></div><button class="primary modal-submit" onclick="closeModal();toast('Profile updated')">Save Changes</button>`)}
function setAppearance(v){if(v==='Dark')document.documentElement.classList.add('dark');else document.documentElement.classList.remove('dark');toast(v+' appearance selected')}
function toggleTheme(){document.documentElement.classList.toggle('dark');toast('Theme changed')}
function confirmEmergency(){if(confirm('For a real emergency, call your local emergency service. Continue to the phone dialer?'))window.location.href='tel:112'}
document.getElementById('modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal()});
renderDoctors();renderAppointments();renderMedicines();// appointment flow note
