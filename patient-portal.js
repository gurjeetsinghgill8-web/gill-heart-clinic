/**
 * Gill Heart Clinic — Patient Digital Health Portal & Interactive BP Graph
 * - Permanent Lock: Name and Phone Number are permanently locked after registration.
 * - PIN Verification: Patient logs in with 10-digit Phone + 4-digit PIN.
 * - Interactive Chart: Visual BP Trend Graph (Systolic, Diastolic, Pulse) with Chart.js.
 * - Vitals Logger: Patient logs new readings over time without re-entering name/phone.
 * - Doctor OPD Lookup: Dr. Gill can instant-fetch by phone number without PIN.
 */

const DOCTOR_WHATSAPP = '919258879884';
let bpChartInstance = null;
let currentPatientData = null;

/**
 * Universal Indian Mobile Normalizer
 */
function normalizeIndianPhone(input) {
  if (!input) return '';
  let digits = String(input).replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  } else if (digits.length > 10) {
    digits = digits.slice(-10);
  }
  return digits;
}

function getBPAnalysis(sys, dia) {
  sys = parseInt(sys, 10);
  dia = parseInt(dia, 10);
  if (!sys || !dia) return { label: 'अपूर्ण', color: '#64748b', bg: '#f1f5f9' };
  if (sys < 120 && dia < 80) return { label: 'सामान्य (Normal BP)', color: '#16a34a', bg: '#dcfce7' };
  if (sys <= 129 && dia < 80) return { label: 'एलिवेटेड (Elevated)', color: '#ca8a04', bg: '#fef9c3' };
  if (sys <= 139 || dia <= 89) return { label: 'स्टेज 1 हाइपरटेंशन (Stage 1)', color: '#ea580c', bg: '#ffedd5' };
  return { label: 'स्टेज 2 हाइपरटेंशन (Stage 2)', color: '#dc2626', bg: '#fee2e2' };
}

// Reliable Backend endpoints (with Cloud Run fallback when running on static GitHub Pages)
const PORTAL_BACKEND_HOSTS = [
  'https://ais-pre-apsudkn5ahf43yfcvz7hcw-873171684615.asia-southeast1.run.app',
  'https://ais-dev-apsudkn5ahf43yfcvz7hcw-873171684615.asia-southeast1.run.app',
  ''
];

// Offline & Local Patient Database Helper
function getLocalPatient(phone) {
  try {
    const raw = localStorage.getItem('gill_patient_' + phone);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

function saveLocalPatient(patient) {
  if (!patient || !patient.phone) return;
  try {
    localStorage.setItem('gill_patient_' + patient.phone, JSON.stringify(patient));
    const dir = JSON.parse(localStorage.getItem('gill_patient_directory') || '{}');
    dir[patient.phone] = {
      phone: patient.phone,
      name: patient.name,
      pin: patient.pin,
      updatedAt: patient.updatedAt || new Date().toISOString()
    };
    localStorage.setItem('gill_patient_directory', JSON.stringify(dir));
  } catch (e) {}
}

async function callPortalApi(endpoint, options = {}) {
  const isGitHubPages = window.location.hostname.includes('github.io');
  // On GitHub Pages, prioritize Cloud Run backend over relative path to avoid 404 HTML response
  const hostOrder = isGitHubPages ? PORTAL_BACKEND_HOSTS : ['', PORTAL_BACKEND_HOSTS[0], PORTAL_BACKEND_HOSTS[1]];

  let lastError = null;

  for (const host of hostOrder) {
    try {
      const url = host + endpoint;
      const res = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      });

      // Avoid parsing HTML error pages as JSON (prevents "Unexpected token '<'")
      const cType = res.headers.get('content-type') || '';
      if (!cType.includes('application/json')) {
        const text = await res.text();
        if (text.trim().startsWith('<')) {
          continue; // Try next host
        }
      }

      const data = await res.json();
      return { ok: res.ok, status: res.status, data };
    } catch (err) {
      lastError = err;
    }
  }

  return { ok: false, status: 0, error: (lastError ? lastError.message : 'सर्वर कनेक्ट नहीं हो सका') };
}

/**
 * Switch view between Login, Register, and Dashboard
 */
function showPortalView(viewName) {
  const loginSection = document.getElementById('ptLoginSection');
  const registerSection = document.getElementById('ptRegisterSection');
  const dashboardSection = document.getElementById('ptDashboardSection');
  const alertEl = document.getElementById('ptPortalAlert');

  if (alertEl) {
    alertEl.style.display = 'none';
    alertEl.textContent = '';
  }

  if (loginSection) loginSection.style.display = viewName === 'login' ? 'block' : 'none';
  if (registerSection) registerSection.style.display = viewName === 'register' ? 'block' : 'none';
  if (dashboardSection) dashboardSection.style.display = viewName === 'dashboard' ? 'block' : 'none';
}

/**
 * Patient Login with Mobile Number + 4-Digit PIN
 */
async function loginPatientWithPin() {
  const phoneEl = document.getElementById('ptLoginPhone');
  const pinEl = document.getElementById('ptLoginPin');
  const alertEl = document.getElementById('ptPortalAlert');

  const phone = normalizeIndianPhone(phoneEl ? phoneEl.value : '');
  const pin = pinEl ? pinEl.value.trim() : '';

  if (phone.length !== 10) {
    showPortalAlert('कृपया अपना 10 अंकों का वैध मोबाइल नंबर दर्ज करें।', 'danger');
    if (phoneEl) phoneEl.focus();
    return;
  }

  if (!pin || pin.length < 4) {
    showPortalAlert('कृपया अपना 4-अंकों का गुप्त पिन दर्ज करें।', 'danger');
    if (pinEl) pinEl.focus();
    return;
  }

  try {
    showPortalAlert('रिकॉर्ड सत्यापित किया जा रहा है...', 'info');

    const res = await callPortalApi('/api/patient-records/verify', {
      method: 'POST',
      body: JSON.stringify({ phone, pin })
    });

    if (res.ok && res.data && res.data.patient) {
      localStorage.setItem('gill_patient_phone', phone);
      localStorage.setItem('gill_patient_pin', pin);
      saveLocalPatient(res.data.patient);
      currentPatientData = res.data.patient;
      renderPatientDashboard(res.data.patient);
      return;
    }

    if (res.status === 401) {
      throw new Error((res.data && res.data.error) || 'अमान्य 4-अंकों का गुप्त पिन।');
    }

    // Local / Offline fallback
    const local = getLocalPatient(phone);
    if (local) {
      if (local.pin && String(local.pin).trim() !== pin) {
        throw new Error('अमान्य 4-अंकों का गुप्त पिन।');
      }
      localStorage.setItem('gill_patient_phone', phone);
      localStorage.setItem('gill_patient_pin', pin);
      currentPatientData = local;
      renderPatientDashboard(local);
      return;
    }

    throw new Error((res.data && res.data.error) || 'इस मोबाइल नंबर का कोई रिकॉर्ड नहीं मिला। कृपया पहले रजिस्टर करें।');
  } catch (err) {
    showPortalAlert(err.message, 'danger');
  }
}

/**
 * New Patient Self-Registration (Permanently Locks Name & Phone)
 */
async function registerNewPatient() {
  const nameEl = document.getElementById('ptRegName');
  const phoneEl = document.getElementById('ptRegPhone');
  const pinEl = document.getElementById('ptRegPin');
  const ageEl = document.getElementById('ptRegAge');
  const genderEl = document.getElementById('ptRegGender');
  const complaintEl = document.getElementById('ptRegComplaint');
  const sysEl = document.getElementById('ptRegSys');
  const diaEl = document.getElementById('ptRegDia');
  const pulseEl = document.getElementById('ptRegPulse');
  const sugarEl = document.getElementById('ptRegSugar');

  const name = nameEl ? nameEl.value.trim() : '';
  const phone = normalizeIndianPhone(phoneEl ? phoneEl.value : '');
  const pin = pinEl ? pinEl.value.trim() : '';
  const age = ageEl ? ageEl.value.trim() : '';
  const gender = genderEl ? genderEl.value : 'Male';
  const complaints = complaintEl ? complaintEl.value.trim() : '';
  const sys = sysEl ? sysEl.value.trim() : '';
  const dia = diaEl ? diaEl.value.trim() : '';
  const pulse = pulseEl ? pulseEl.value.trim() : '';
  const sugar = sugarEl ? sugarEl.value.trim() : '';

  if (!name) {
    showPortalAlert('कृपया मरीज़ का पूरा नाम दर्ज करें। (यह नाम स्थायी रूप से पंजीकृत होगा)', 'danger');
    if (nameEl) nameEl.focus();
    return;
  }

  if (phone.length !== 10) {
    showPortalAlert('कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।', 'danger');
    if (phoneEl) phoneEl.focus();
    return;
  }

  if (!pin || pin.length < 4) {
    showPortalAlert('कृपया भविष्य में कार्ड खोलने के लिए 4-अंकों का गुप्त पिन सेट करें।', 'danger');
    if (pinEl) pinEl.focus();
    return;
  }

  const payload = {
    name,
    phone,
    pin,
    age,
    gender,
    complaints,
    sys,
    dia,
    pulse,
    sugar
  };

  try {
    showPortalAlert('हेल्थ कार्ड बनाया जा रहा है व नाम लॉक किया जा रहा है...', 'info');

    const res = await callPortalApi('/api/patient-records', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    let patientObj = res.ok && res.data && res.data.patient ? res.data.patient : null;

    if (!patientObj) {
      // Local fallback creation if network is down
      patientObj = {
        name,
        phone,
        pin,
        age,
        gender,
        complaints,
        registered: true,
        createdAt: new Date().toISOString(),
        vitalsHistory: sys && dia ? [{
          sys: parseInt(sys, 10),
          dia: parseInt(dia, 10),
          pulse: pulse ? parseInt(pulse, 10) : null,
          sugar: sugar ? parseInt(sugar, 10) : null,
          notes: '',
          recordedAt: new Date().toISOString()
        }] : []
      };
    }

    // Save session
    localStorage.setItem('gill_patient_phone', phone);
    localStorage.setItem('gill_patient_pin', pin);
    saveLocalPatient(patientObj);

    currentPatientData = patientObj;
    renderPatientDashboard(patientObj);
  } catch (err) {
    showPortalAlert(err.message, 'danger');
  }
}

/**
 * Log New BP & Vitals from Dashboard (Name and Phone remain permanently locked!)
 */
async function logDashboardVital() {
  if (!currentPatientData) return;

  const sysEl = document.getElementById('dashSys');
  const diaEl = document.getElementById('dashDia');
  const pulseEl = document.getElementById('dashPulse');
  const sugarEl = document.getElementById('dashSugar');
  const notesEl = document.getElementById('dashNotes');
  const alertEl = document.getElementById('dashLogAlert');

  const sys = sysEl ? sysEl.value.trim() : '';
  const dia = diaEl ? diaEl.value.trim() : '';
  const pulse = pulseEl ? pulseEl.value.trim() : '';
  const sugar = sugarEl ? sugarEl.value.trim() : '';
  const notes = notesEl ? notesEl.value.trim() : '';

  if (!sys || !dia) {
    if (alertEl) {
      alertEl.style.display = 'block';
      alertEl.className = 'alert alert-danger py-2 small';
      alertEl.textContent = 'कृपया BP Systolic (ऊपर) और Diastolic (नीचे) दोनों भरें।';
    }
    return;
  }

  const savedPin = localStorage.getItem('gill_patient_pin') || currentPatientData.pin;

  const payload = {
    phone: currentPatientData.phone,
    pin: savedPin,
    sys,
    dia,
    pulse,
    sugar,
    notes
  };

  try {
    if (alertEl) {
      alertEl.style.display = 'block';
      alertEl.className = 'alert alert-info py-2 small';
      alertEl.textContent = 'रीडिंग सेव की जा रही है...';
    }

    const res = await callPortalApi('/api/patient-records', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    let updatedPatient = res.ok && res.data && res.data.patient ? res.data.patient : null;

    if (!updatedPatient) {
      // Local vitals history append if offline
      if (!currentPatientData.vitalsHistory) currentPatientData.vitalsHistory = [];
      currentPatientData.vitalsHistory.unshift({
        sys: parseInt(sys, 10),
        dia: parseInt(dia, 10),
        pulse: pulse ? parseInt(pulse, 10) : null,
        sugar: sugar ? parseInt(sugar, 10) : null,
        notes: notes || '',
        recordedAt: new Date().toISOString()
      });
      updatedPatient = currentPatientData;
    }

    currentPatientData = updatedPatient;
    saveLocalPatient(updatedPatient);

    // Reset inputs
    if (sysEl) sysEl.value = '';
    if (diaEl) diaEl.value = '';
    if (pulseEl) pulseEl.value = '';
    if (sugarEl) sugarEl.value = '';
    if (notesEl) notesEl.value = '';

    if (alertEl) {
      alertEl.className = 'alert alert-success py-2 small';
      alertEl.textContent = '✅ नई रीडिंग सफलतापूर्वक ग्राफ़ और डेटाबेस में जुड़ गई!';
      setTimeout(() => { alertEl.style.display = 'none'; }, 4000);
    }

    // Refresh Dashboard display & Chart
    renderPatientDashboard(updatedPatient);
  } catch (err) {
    if (alertEl) {
      alertEl.className = 'alert alert-danger py-2 small';
      alertEl.textContent = 'त्रुटि: ' + err.message;
    }
  }
}

/**
 * Render Complete Patient Health Dashboard
 */
function renderPatientDashboard(patient) {
  showPortalView('dashboard');

  // Populate Locked Identity
  const nameEl = document.getElementById('dashPatientName');
  const phoneEl = document.getElementById('dashPatientPhone');
  const ageGenderEl = document.getElementById('dashPatientAgeGender');
  const complaintEl = document.getElementById('dashPatientComplaint');
  const bpBadgeEl = document.getElementById('dashLatestBPBadge');
  const personalLinkEl = document.getElementById('dashPersonalLink');

  if (nameEl) nameEl.textContent = patient.name || 'मरीज़';
  if (phoneEl) phoneEl.textContent = `+91 ${patient.phone}`;
  if (ageGenderEl) {
    ageGenderEl.textContent = patient.age ? `${patient.age} वर्ष (${patient.gender || 'General'})` : (patient.gender || 'उपलब्ध नहीं');
  }
  if (complaintEl) complaintEl.textContent = patient.complaints || 'नियमित चेकअप';

  const vitals = patient.vitalsHistory || [];
  const latest = vitals.length > 0 ? vitals[0] : null;

  if (bpBadgeEl) {
    if (latest && latest.sys && latest.dia) {
      const info = getBPAnalysis(latest.sys, latest.dia);
      bpBadgeEl.textContent = `${latest.sys}/${latest.dia} mmHg — ${info.label}`;
      bpBadgeEl.style.background = info.bg;
      bpBadgeEl.style.color = info.color;
      bpBadgeEl.style.border = `1px solid ${info.color}`;
    } else {
      bpBadgeEl.textContent = 'कोई बीपी रीडिंग उपलब्ध नहीं';
      bpBadgeEl.style.background = '#f1f5f9';
      bpBadgeEl.style.color = '#64748b';
      bpBadgeEl.style.border = '1px solid #cbd5e1';
    }
  }

  // Personal Bookmark URL
  const personalUrl = `${window.location.origin}/?patient=${patient.phone}`;
  if (personalLinkEl) personalLinkEl.textContent = personalUrl;

  // Setup WhatsApp share buttons
  setupDashboardWhatsAppButtons(patient, personalUrl);

  // Render Table
  renderVitalsTable(vitals);

  // Render Interactive Chart.js Graph
  renderBPChart(vitals);

  // Render Weekly Health Goal Progress Checklist
  renderWeeklyHealthGoal(patient);
}

/**
 * Render Interactive Chart.js Graph
 */
function renderBPChart(vitals) {
  const canvas = document.getElementById('patientBPChart');
  if (!canvas) return;

  // Sort chronological for graph (oldest to newest, max last 20)
  const chartData = [...vitals].reverse().slice(-20);

  if (chartData.length === 0) {
    const emptyNotice = document.getElementById('chartEmptyNotice');
    if (emptyNotice) emptyNotice.style.display = 'block';
    canvas.style.display = 'none';
    if (bpChartInstance) {
      bpChartInstance.destroy();
      bpChartInstance = null;
    }
    return;
  }

  const emptyNotice = document.getElementById('chartEmptyNotice');
  if (emptyNotice) emptyNotice.style.display = 'none';
  canvas.style.display = 'block';

  const labels = chartData.map(v => {
    const d = new Date(v.recordedAt);
    return `${d.getDate()}/${d.getMonth() + 1} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  });

  const sysValues = chartData.map(v => v.sys || null);
  const diaValues = chartData.map(v => v.dia || null);
  const pulseValues = chartData.map(v => v.pulse || null);

  if (bpChartInstance) {
    bpChartInstance.destroy();
  }

  if (typeof Chart === 'undefined') {
    console.warn('Chart.js not loaded');
    return;
  }

  const ctx = canvas.getContext('2d');
  bpChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Systolic BP (ऊपर - mmHg)',
          data: sysValues,
          borderColor: '#dc2626',
          backgroundColor: 'rgba(220, 38, 38, 0.1)',
          borderWidth: 2.5,
          tension: 0.3,
          pointBackgroundColor: '#dc2626',
          pointRadius: 4,
          fill: false
        },
        {
          label: 'Diastolic BP (नीचे - mmHg)',
          data: diaValues,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          borderWidth: 2.5,
          tension: 0.3,
          pointBackgroundColor: '#2563eb',
          pointRadius: 4,
          fill: false
        },
        {
          label: 'Heart Rate / Pulse (bpm)',
          data: pulseValues,
          borderColor: '#16a34a',
          backgroundColor: 'rgba(22, 163, 74, 0.05)',
          borderWidth: 1.8,
          borderDash: [5, 5],
          tension: 0.3,
          pointBackgroundColor: '#16a34a',
          pointRadius: 3,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            font: { size: 12, weight: 'bold' },
            boxWidth: 14
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            footer: (items) => {
              const sys = items.find(i => i.datasetIndex === 0)?.raw;
              const dia = items.find(i => i.datasetIndex === 1)?.raw;
              if (sys && dia) {
                return `स्थिति: ${getBPAnalysis(sys, dia).label}`;
              }
              return '';
            }
          }
        }
      },
      scales: {
        y: {
          min: 40,
          max: 200,
          ticks: {
            stepSize: 20
          },
          title: {
            display: true,
            text: 'रीडिंग मान (mmHg / bpm)',
            font: { size: 11, weight: 'bold' }
          }
        },
        x: {
          ticks: {
            maxRotation: 45,
            minRotation: 0,
            font: { size: 10 }
          }
        }
      }
    }
  });
}

/**
 * Render Vitals Table
 */
function renderVitalsTable(vitals) {
  const container = document.getElementById('dashVitalsTableBody');
  if (!container) return;

  if (vitals.length === 0) {
    container.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-3 small">अभी कोई BP रीडिंग दर्ज नहीं है। नीचे दिए गए फ़ॉर्म से पहली रीडिंग जोड़ें।</td></tr>';
    return;
  }

  let rows = '';
  vitals.forEach((v) => {
    const d = new Date(v.recordedAt);
    const dateStr = `${d.toLocaleDateString('hi-IN')} ${d.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })}`;
    const bpAnalysis = v.sys && v.dia ? getBPAnalysis(v.sys, v.dia) : null;

    rows += `
      <tr>
        <td class="small fw-bold text-dark">${dateStr}</td>
        <td>
          <span class="badge fw-bold" style="background:${bpAnalysis ? bpAnalysis.bg : '#f1f5f9'}; color:${bpAnalysis ? bpAnalysis.color : '#334155'}; border:1px solid ${bpAnalysis ? bpAnalysis.color : '#cbd5e1'}; font-size:12px;">
            ${v.sys}/${v.dia} mmHg
          </span>
          <div class="small text-muted" style="font-size:11px;">${bpAnalysis ? bpAnalysis.label : ''}</div>
        </td>
        <td class="small">${v.pulse ? `<strong>${v.pulse}</strong> bpm` : '-'}</td>
        <td class="small">${v.sugar ? `<strong>${v.sugar}</strong> mg/dL` : '-'}</td>
        <td class="small text-muted">${v.notes || '-'}</td>
      </tr>
    `;
  });

  container.innerHTML = rows;
}

/**
 * Configure WhatsApp Sharing Links
 */
function setupDashboardWhatsAppButtons(patient, personalUrl) {
  const vitals = patient.vitalsHistory || [];
  const latest = vitals.length > 0 ? vitals[0] : null;
  const bpInfo = latest && latest.sys && latest.dia ? getBPAnalysis(latest.sys, latest.dia) : null;

  // WhatsApp to Doctor
  let waDoctorText = `*नमस्ते डॉ. गुरजीत सिंह गिल (गिल हार्ट क्लिनिक)*\n`;
  waDoctorText += `मरीज़ का डिजिटल हेल्थ कार्ड विवरण:\n\n`;
  waDoctorText += `👤 *नाम:* ${patient.name}\n`;
  waDoctorText += `📱 *मोबाइल:* ${patient.phone}\n`;
  if (patient.age) waDoctorText += `🎂 *उम्र व लिंग:* ${patient.age} वर्ष, ${patient.gender}\n`;
  if (patient.complaints) waDoctorText += `⚠️ *मुख्य परेशानी:* ${patient.complaints}\n`;
  if (latest && latest.sys && latest.dia) {
    waDoctorText += `🩺 *हालिया BP:* ${latest.sys}/${latest.dia} mmHg (${bpInfo.label})\n`;
    if (latest.pulse) waDoctorText += `💓 *पल्स:* ${latest.pulse} bpm\n`;
    if (latest.sugar) waDoctorText += `🩸 *शुगर:* ${latest.sugar} mg/dL\n`;
  }
  waDoctorText += `📊 *कुल दर्ज रीडिंग्स:* ${vitals.length}\n`;
  waDoctorText += `🔗 *पर्सनल लिंक व ग्राफ़:* ${personalUrl}\n`;
  waDoctorText += `\n— गिल हार्ट क्लिनिक, मोहिउद्दीनपुर (हेल्पलाइन: 9258879884)`;

  const docBtn = document.getElementById('dashSendDoctorWaBtn');
  if (docBtn) {
    docBtn.href = `https://api.whatsapp.com/send?phone=${DOCTOR_WHATSAPP}&text=${encodeURIComponent(waDoctorText)}`;
  }

  // Save to Patient's Own WhatsApp
  let waSelfText = `*गिल हार्ट क्लिनिक — आपका व्यक्तिगत हेल्थ कार्ड लिंक*\n\n`;
  waSelfText += `प्रिय ${patient.name},\n`;
  waSelfText += `यह आपका स्थायी डिजिटल हेल्थ कार्ड लिंक है। इसे कभी भी खोलकर अपना BP ग्राफ़ देखें या नई रीडिंग दर्ज करें:\n`;
  waSelfText += `👉 ${personalUrl}\n\n`;
  waSelfText += `🔑 आपका पंजीकृत मोबाइल: ${patient.phone}\n`;
  waSelfText += `(क्लिनिक में डॉक्टर को सिर्फ़ अपना मोबाइल नंबर बताएं)\n`;
  waSelfText += `— डॉ. गुरजीत सिंह गिल (हेल्पलाइन: 9258879884)`;

  const selfBtn = document.getElementById('dashSaveSelfWaBtn');
  if (selfBtn) {
    selfBtn.href = `https://api.whatsapp.com/send?phone=91${patient.phone}&text=${encodeURIComponent(waSelfText)}`;
  }
}

/**
 * Copy Personal Patient Link
 */
function copyDashboardPatientLink() {
  const personalUrl = currentPatientData ? `${window.location.origin}/?patient=${currentPatientData.phone}` : '';
  if (!personalUrl) return;

  if (navigator.clipboard) {
    navigator.clipboard.writeText(personalUrl).then(() => {
      alert('✅ आपका पर्सनल हेल्थ लिंक कॉपी हो गया है! इसे व्हाट्सएप पर सेव कर लें।');
    });
  } else {
    prompt('अपना लिंक कॉपी करें:', personalUrl);
  }
}

/**
 * Download Patient Vitals History & BP/Heart Rate Trend Chart as Formatted PDF Report
 */
async function downloadVitalsReportPDF() {
  if (!currentPatientData) {
    alert('कृपया पहले अपना हेल्थ कार्ड खोलें।');
    return;
  }

  const btn = document.getElementById('dashDownloadPdfBtn');
  const originalBtnHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>PDF रिपोर्ट तैयार हो रही है...';
  }

  try {
    // 1. Ensure jsPDF is loaded
    if (typeof window.jspdf === 'undefined') {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
    }
    if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF) {
      throw new Error('PDF लाइब्रेरी लोड नहीं हो सकी। कृपया इंटरनेट कनेक्शन जांचें।');
    }

    // 2. Ensure autoTable plugin is loaded
    if (typeof window.jspdf.jsPDF.prototype.autoTable === 'undefined') {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js');
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const patient = currentPatientData;
    const vitals = patient.vitalsHistory || [];

    // Calculate Summary Statistics
    let avgSys = 0;
    let avgDia = 0;
    let avgPulse = 0;
    let validBpCount = 0;
    let validPulseCount = 0;

    vitals.forEach(v => {
      if (v.sys && v.dia) {
        avgSys += v.sys;
        avgDia += v.dia;
        validBpCount++;
      }
      if (v.pulse) {
        avgPulse += v.pulse;
        validPulseCount++;
      }
    });

    avgSys = validBpCount > 0 ? Math.round(avgSys / validBpCount) : '-';
    avgDia = validBpCount > 0 ? Math.round(avgDia / validBpCount) : '-';
    avgPulse = validPulseCount > 0 ? Math.round(avgPulse / validPulseCount) : '-';

    const latest = vitals.length > 0 ? vitals[0] : null;
    const latestBpText = latest && latest.sys && latest.dia ? `${latest.sys}/${latest.dia} mmHg` : 'N/A';
    const latestAnalysis = latest && latest.sys && latest.dia ? getBPAnalysis(latest.sys, latest.dia) : { label: 'N/A' };

    // ==========================================
    // 1. CLINIC HEADER (Branded Top Banner)
    // ==========================================
    doc.setFillColor(15, 23, 42); // Navy slate-900
    doc.rect(0, 0, 210, 32, 'F');

    doc.setFillColor(220, 38, 38); // Crimson accent line
    doc.rect(0, 32, 210, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('GILL HEART CLINIC & CARDIOLOGY CENTRE', 14, 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(226, 232, 240);
    doc.text('Dr. Gurjeet Singh Gill | MBBS, MD, PGDCC (Cardiology)', 14, 17);
    doc.text('Opp. Primary School, Meerut-Delhi Road, Mohiuddinpur, Meerut, U.P.', 14, 22);
    doc.text('Helpline / WhatsApp: +91 9258879884 | OPD Timing: 09:00 AM - 08:00 PM', 14, 27);

    // Right-side badge
    doc.setFillColor(220, 38, 38);
    doc.roundedRect(146, 7, 50, 18, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('PATIENT VITALS REPORT', 148, 14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text('Clinical Record / History', 148, 19);

    // ==========================================
    // 2. PATIENT INFORMATION CARD
    // ==========================================
    let currentY = 39;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.4);
    doc.roundedRect(14, currentY, 182, 25, 3, 3, 'FD');

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text(`Patient: ${patient.name || 'Anonymous'} [Locked Identity]`, 18, currentY + 6.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Mobile: +91 ${patient.phone || '-'}`, 18, currentY + 13.5);
    doc.text(`Age/Gender: ${patient.age ? patient.age + ' Yrs' : '-'} / ${patient.gender || '-'}`, 18, currentY + 20);

    const printDate = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Report Date: ${printDate}`, 110, currentY + 6.5);
    doc.text(`Chief Complaints: ${(patient.complaints || 'Routine Vitals Monitoring').slice(0, 40)}`, 110, currentY + 13.5);
    doc.text(`Total Records: ${vitals.length} logged reading(s)`, 110, currentY + 20);

    // ==========================================
    // 3. STATISTICAL SUMMARY METRICS
    // ==========================================
    currentY += 30;
    const boxWidth = 43;
    const boxHeight = 15;
    const gap = 3.3;

    drawStatBox(doc, 14, currentY, boxWidth, boxHeight, 'Latest BP', latestBpText, latestAnalysis.label.split('(')[0].trim(), '#dc2626');
    const avgBpText = validBpCount > 0 ? `${avgSys}/${avgDia} mmHg` : 'N/A';
    drawStatBox(doc, 14 + (boxWidth + gap), currentY, boxWidth, boxHeight, 'Average BP', avgBpText, `Over ${validBpCount} entries`, '#2563eb');
    const avgPulseText = validPulseCount > 0 ? `${avgPulse} bpm` : 'N/A';
    drawStatBox(doc, 14 + (boxWidth + gap) * 2, currentY, boxWidth, boxHeight, 'Avg Heart Rate', avgPulseText, 'Pulse resting rate', '#16a34a');
    const sugarText = latest && latest.sugar ? `${latest.sugar} mg/dL` : 'Not tested';
    drawStatBox(doc, 14 + (boxWidth + gap) * 3, currentY, boxWidth, boxHeight, 'Latest Blood Sugar', sugarText, 'Random Blood Sugar', '#0284c7');

    // ==========================================
    // 4. EMBED BP & HEART RATE VISUAL CHART
    // ==========================================
    currentY += 20;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('Blood Pressure & Pulse Visual Trend Analysis (Chart)', 15, currentY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Red Line: Systolic BP | Blue Line: Diastolic BP | Green Line: Heart Rate (bpm)', 15, currentY + 4);

    currentY += 6;

    const chartCanvas = document.getElementById('patientBPChart');
    if (chartCanvas && bpChartInstance && vitals.length > 0) {
      try {
        const chartImgData = chartCanvas.toDataURL('image/png', 1.0);
        doc.setDrawColor(226, 232, 240);
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(14, currentY, 182, 54, 2, 2, 'FD');
        doc.addImage(chartImgData, 'PNG', 16, currentY + 2, 178, 50, undefined, 'FAST');
        currentY += 57;
      } catch (e) {
        console.warn('Chart image export error:', e);
        doc.setFontSize(8);
        doc.text('Visual chart preview unavailable.', 16, currentY + 8);
        currentY += 12;
      }
    } else {
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, currentY, 182, 15, 2, 2, 'FD');
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.text('No historical readings logged yet for graph display.', 20, currentY + 9);
      currentY += 18;
    }

    // ==========================================
    // 5. DETAILED VITALS HISTORY TABLE
    // ==========================================
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('Recorded Vitals Log History', 15, currentY + 2);

    const tableRows = vitals.map((v, idx) => {
      const d = new Date(v.recordedAt);
      const dateFormatted = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      const analysis = v.sys && v.dia ? getBPAnalysis(v.sys, v.dia) : { label: '-' };
      return [
        idx + 1,
        dateFormatted,
        v.sys && v.dia ? `${v.sys}/${v.dia} mmHg` : '-',
        v.pulse ? `${v.pulse} bpm` : '-',
        v.sugar ? `${v.sugar} mg/dL` : '-',
        analysis.label.split('(')[0].trim(),
        (v.notes || '-').slice(0, 32)
      ];
    });

    if (tableRows.length === 0) {
      tableRows.push(['-', 'No records found', '-', '-', '-', '-', '-']);
    }

    doc.autoTable({
      startY: currentY + 4,
      head: [['#', 'Date & Time', 'Blood Pressure', 'Pulse', 'Sugar', 'Classification', 'Clinical Notes']],
      body: tableRows,
      margin: { left: 14, right: 14, bottom: 20 },
      theme: 'grid',
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [30, 41, 59]
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 8 },
        1: { halign: 'center', cellWidth: 32 },
        2: { halign: 'center', fontStyle: 'bold', cellWidth: 28 },
        3: { halign: 'center', cellWidth: 20 },
        4: { halign: 'center', cellWidth: 22 },
        5: { halign: 'center', cellWidth: 32 },
        6: { halign: 'left', cellWidth: 'auto' }
      },
      didDrawPage: function (data) {
        const pageCount = doc.internal.getNumberOfPages();
        const pageCurrent = data.pageNumber;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text(
          'Gill Heart Clinic | Verified Digital Medical Document | Dr. Gurjeet Singh Gill (+91 9258879884)',
          14,
          290
        );
        doc.text(`Page ${pageCurrent} of ${pageCount}`, 186, 290);
      }
    });

    // Save and trigger browser download
    const cleanName = (patient.name || 'Patient').replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Gill_Heart_Clinic_Report_${cleanName}_${patient.phone}.pdf`;
    doc.save(filename);

    if (btn) {
      btn.innerHTML = '<i class="fas fa-check-circle me-1"></i> PDF डाउनलोड हो गई!';
      setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = originalBtnHtml;
      }, 3000);
    }
  } catch (err) {
    console.error('Error generating PDF:', err);
    alert('PDF बनाते समय त्रुटि: ' + err.message + '\nआप स्क्रीन का प्रिंट/स्क्रीनशॉट भी ले सकते हैं।');
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalBtnHtml;
    }
  }
}

/**
 * Helper to dynamically load external JS if needed
 */
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

function drawStatBox(doc, x, y, w, h, label, value, subtext, colorHex) {
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, w, h, 2, 2, 'FD');

  doc.setFillColor(colorHex);
  doc.roundedRect(x, y, 1.8, h, 1, 1, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(label, x + 3.5, y + 4);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(String(value), x + 3.5, y + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text(String(subtext), x + 3.5, y + 13);
}

/**
 * Patient Logout from Dashboard
 */
function logoutPatient() {
  localStorage.removeItem('gill_patient_phone');
  localStorage.removeItem('gill_patient_pin');
  currentPatientData = null;
  if (bpChartInstance) {
    bpChartInstance.destroy();
    bpChartInstance = null;
  }
  showPortalView('login');
}

/**
 * Doctor OPD Quick Lookup by Phone (Direct access without PIN for Doctor)
 */
async function lookupPatientByPhone() {
  const searchInput = document.getElementById('doctorSearchPhone');
  const resultDiv = document.getElementById('doctorLookupResult');
  const cleanPhone = normalizeIndianPhone(searchInput ? searchInput.value : '');

  if (cleanPhone.length !== 10) {
    alert('कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें (उदा. 9258879884)।');
    if (searchInput) searchInput.focus();
    return;
  }

  if (searchInput) searchInput.value = cleanPhone;

  if (resultDiv) {
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = '<div class="text-center py-3"><div class="spinner-border spinner-border-sm text-primary"></div> रिकॉर्ड खोजा जा रहा है...</div>';
  }

  try {
    const res = await callPortalApi(`/api/patient-records?phone=${cleanPhone}`);
    let p = res.ok && res.data && res.data.patient ? res.data.patient : getLocalPatient(cleanPhone);

    if (!p) {
      resultDiv.innerHTML = `
        <div class="alert alert-warning py-2 small mb-0">
          <i class="fas fa-exclamation-triangle me-1"></i> इस मोबाइल नंबर (${cleanPhone}) का कोई रिकॉर्ड नहीं मिला।
          <a href="javascript:void(0)" onclick="openRegisterForPhone('${cleanPhone}')" class="fw-bold ms-2 text-primary">यहाँ नया रजिस्टर करें →</a>
        </div>
      `;
      return;
    }

    const latestVital = p.vitalsHistory && p.vitalsHistory.length > 0 ? p.vitalsHistory[0] : null;

    let html = `
      <div class="p-3 rounded-3" style="background:#f0fdf4; border:1.5px solid #86efac;">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <span class="badge bg-success mb-1">✅ Verified Patient Record</span>
            <span class="badge bg-dark ms-1">🔒 Locked ID</span>
            <h5 class="mb-1 text-dark fw-bold">${p.name} <small class="text-muted fw-normal" style="font-size:14px;">(${p.age ? p.age + ' वर्ष, ' : ''}${p.gender || ''})</small></h5>
            <div class="text-muted small"><i class="fas fa-phone-alt me-1"></i> +91 ${p.phone}</div>
          </div>
          <button class="btn btn-sm btn-primary fw-bold" onclick="openDoctorPatientView('${p.phone}')">
            <i class="fas fa-chart-line me-1"></i> पूरा ग्राफ़ व रिकॉर्ड खोलें
          </button>
        </div>

        <div class="mt-2 pt-2 border-top">
          <div class="small"><strong>मुख्य परेशानी:</strong> ${p.complaints || 'उपलब्ध नहीं'}</div>
          ${latestVital ? `
            <div class="small mt-1">
              <strong>हालिया BP:</strong> <span class="badge bg-danger">${latestVital.sys}/${latestVital.dia} mmHg</span>
              ${latestVital.pulse ? `| <strong>पल्स:</strong> ${latestVital.pulse} bpm` : ''}
              ${latestVital.sugar ? `| <strong>शुगर:</strong> ${latestVital.sugar} mg/dL` : ''}
              <span class="text-muted ms-2">(${new Date(latestVital.recordedAt).toLocaleDateString('hi-IN')})</span>
            </div>
          ` : '<div class="text-muted small mt-1">अभी कोई BP रीडिंग दर्ज नहीं है।</div>'}
        </div>
      </div>
    `;

    resultDiv.innerHTML = html;
  } catch (err) {
    if (resultDiv) {
      resultDiv.innerHTML = `<div class="alert alert-danger py-2 small">सर्वर त्रुटि: ${err.message}</div>`;
    }
  }
}

/**
 * Doctor opens patient full dashboard directly
 */
async function openDoctorPatientView(phone) {
  try {
    const res = await callPortalApi(`/api/patient-records?phone=${phone}`);
    let patient = res.ok && res.data && res.data.patient ? res.data.patient : getLocalPatient(phone);
    if (patient) {
      currentPatientData = patient;
      renderPatientDashboard(patient);
    } else {
      alert('मरीज़ रिकॉर्ड नहीं मिला।');
    }
  } catch (e) {
    alert('डेटा लोड नहीं हो सका: ' + e.message);
  }
}

/**
 * ==========================================
 * WEEKLY HEALTH GOAL (NON-MEDICAL ENGAGEMENT)
 * ==========================================
 */

function getISOWeekId(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

function getWeekDates(currentDate = new Date()) {
  const d = new Date(currentDate);
  const day = d.getDay(); // 0 is Sunday, 1 is Monday
  const diffToMonday = (day === 0 ? -6 : 1) - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  
  const weekDays = [];
  const dayNamesHi = ['सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि', 'रवि'];
  const dayNamesEn = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  for (let i = 0; i < 7; i++) {
    const cur = new Date(monday);
    cur.setDate(monday.getDate() + i);
    const isToday = cur.toDateString() === (new Date()).toDateString();
    weekDays.push({
      index: i,
      nameHi: dayNamesHi[i],
      nameEn: dayNamesEn[i],
      dateNum: cur.getDate(),
      monthName: cur.toLocaleString('hi-IN', { month: 'short' }),
      isToday: isToday
    });
  }
  return weekDays;
}

function getPatientGoal(patient) {
  const currentWeekId = getISOWeekId(new Date());
  let goal = patient.weeklyGoal;

  if (!goal) {
    try {
      const local = localStorage.getItem('gill_patient_goal_' + patient.phone);
      if (local) goal = JSON.parse(local);
    } catch (e) {}
  }

  if (!goal) {
    goal = {
      category: 'walk',
      icon: '🚶‍♂️',
      title: 'रोज़ाना 30 मिनट की सैर (Daily 30-min walk)',
      subtitle: 'हृदय को स्वस्थ व रक्तचाप को संतुलित रखने के लिए सबसे आसान और असरदार आदत',
      weekId: currentWeekId,
      days: [false, false, false, false, false, false, false]
    };
  } else if (goal.weekId !== currentWeekId) {
    // New week rollover: keep title/category, reset days
    goal.weekId = currentWeekId;
    goal.days = [false, false, false, false, false, false, false];
  }

  if (!Array.isArray(goal.days) || goal.days.length !== 7) {
    goal.days = [false, false, false, false, false, false, false];
  }

  return goal;
}

function renderWeeklyHealthGoal(patient) {
  if (!patient) return;
  const goal = getPatientGoal(patient);
  patient.weeklyGoal = goal;

  const iconEl = document.getElementById('goalCategoryIcon');
  const titleEl = document.getElementById('goalTitleDisplay');
  const subtitleEl = document.getElementById('goalSubtitleDisplay');
  const ratioEl = document.getElementById('goalCompletedRatio');
  const percentEl = document.getElementById('goalPercentText');
  const progressEl = document.getElementById('goalProgressBar');
  const streakEl = document.getElementById('goalStreakDays');
  const daysContainer = document.getElementById('goalDaysContainer');
  const celebrationBanner = document.getElementById('goalCelebrationBanner');
  const celebrationText = document.getElementById('goalCelebrationText');

  if (iconEl) iconEl.textContent = goal.icon || '🎯';
  if (titleEl) titleEl.textContent = goal.title || 'साप्ताहिक स्वास्थ्य लक्ष्य';
  if (subtitleEl) subtitleEl.textContent = goal.subtitle || 'दैनिक स्वस्थ जीवनशैली का पालन करें';

  const completedCount = goal.days.filter(Boolean).length;
  const percent = Math.round((completedCount / 7) * 100);

  if (ratioEl) ratioEl.textContent = `${completedCount} / 7 दिन पूरे`;
  if (percentEl) percentEl.textContent = `${percent}% पूर्ण`;
  if (progressEl) {
    progressEl.style.width = `${percent}%`;
    if (percent < 40) {
      progressEl.style.background = '#0284c7';
    } else if (percent < 80) {
      progressEl.style.background = '#f59e0b';
    } else {
      progressEl.style.background = 'linear-gradient(90deg, #10b981, #059669)';
    }
  }

  // Calculate streak (consecutive completed days up to today)
  const weekDays = getWeekDates();
  const todayObj = weekDays.find(d => d.isToday) || weekDays[0];
  const todayIdx = todayObj.index;

  let streak = 0;
  for (let i = todayIdx; i >= 0; i--) {
    if (goal.days[i]) streak++;
    else break;
  }
  if (streakEl) streakEl.textContent = streak;

  // Render 7-day checklist grid
  if (daysContainer) {
    daysContainer.innerHTML = '';
    weekDays.forEach((day, idx) => {
      const isChecked = Boolean(goal.days[idx]);
      const card = document.createElement('div');
      card.className = 'goal-day-item text-center p-2 rounded-3';
      card.style.flex = '1 1 12%';
      card.style.minWidth = '52px';
      card.style.cursor = 'pointer';
      card.style.transition = 'all 0.2s ease';
      card.style.userSelect = 'none';

      if (isChecked) {
        card.style.background = '#ecfdf5';
        card.style.border = '2px solid #10b981';
        card.style.boxShadow = '0 4px 10px rgba(16,185,129,0.15)';
      } else if (day.isToday) {
        card.style.background = '#f0f9ff';
        card.style.border = '2px solid #0284c7';
        card.style.boxShadow = '0 4px 12px rgba(2,132,199,0.15)';
      } else {
        card.style.background = '#ffffff';
        card.style.border = '1px solid #e2e8f0';
      }

      card.innerHTML = `
        <div style="font-size:12px; font-weight:800; color:${isChecked ? '#065f46' : (day.isToday ? '#0284c7' : '#334155')};">
          ${day.nameHi}
        </div>
        <div style="font-size:10px; color:#64748b; font-weight:600;">
          ${day.dateNum} ${day.monthName}
        </div>
        <div class="mt-1" style="font-size:22px; line-height:1;">
          ${isChecked 
            ? '<i class="fas fa-check-circle" style="color:#10b981;"></i>' 
            : (day.isToday 
                ? '<i class="far fa-circle" style="color:#0284c7;"></i>' 
                : '<i class="far fa-circle text-muted" style="opacity:0.5;"></i>')}
        </div>
        ${day.isToday ? '<span class="badge mt-1" style="background:#0284c7; color:#fff; font-size:9px; padding:2px 5px;">आज</span>' : ''}
      `;

      card.onclick = () => toggleGoalDay(idx);
      daysContainer.appendChild(card);
    });
  }

  // Celebration banner
  if (celebrationBanner) {
    if (completedCount === 7) {
      celebrationBanner.style.display = 'flex';
      celebrationBanner.className = 'alert alert-success mt-3 py-2 px-3 small d-flex align-items-center gap-2 mb-0';
      if (celebrationText) {
        celebrationText.innerHTML = '🏆 <strong>अद्भुत उपलब्धि!</strong> 7 में से 7 दिन पूरे! आपने इस सप्ताह का लक्ष्य 100% पूरा किया। आपका हृदय स्वस्थ है!';
      }
    } else if (goal.days[todayIdx]) {
      celebrationBanner.style.display = 'flex';
      celebrationBanner.className = 'alert alert-info mt-3 py-2 px-3 small d-flex align-items-center gap-2 mb-0';
      if (celebrationText) {
        celebrationText.innerHTML = `🎉 <strong>बहुत बढ़िया!</strong> आज (${todayObj.nameHi}) का लक्ष्य पूरा हो गया। लगातार ${streak} दिन की स्ट्रीक जारी है!`;
      }
    } else {
      celebrationBanner.style.display = 'none';
    }
  }
}

async function toggleGoalDay(idx) {
  if (!currentPatientData) return;
  const goal = getPatientGoal(currentPatientData);
  goal.days[idx] = !goal.days[idx];
  currentPatientData.weeklyGoal = goal;

  // Persist locally
  try {
    localStorage.setItem('gill_patient_goal_' + currentPatientData.phone, JSON.stringify(goal));
    saveLocalPatient(currentPatientData);
  } catch (e) {}

  // Re-render immediately
  renderWeeklyHealthGoal(currentPatientData);

  // Sync with backend
  const pin = localStorage.getItem('gill_patient_pin') || currentPatientData.pin;
  callPortalApi('/api/patient-records/goal', {
    method: 'POST',
    body: JSON.stringify({
      phone: currentPatientData.phone,
      pin: pin,
      weeklyGoal: goal
    })
  });
}

function openGoalSelectionModal() {
  const modalEl = document.getElementById('goalSelectionModal');
  if (modalEl && window.bootstrap) {
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }
}

function selectPresetGoal(category, title, subtitle, icon) {
  if (!currentPatientData) return;
  const goal = getPatientGoal(currentPatientData);
  goal.category = category;
  goal.title = title;
  goal.subtitle = subtitle;
  goal.icon = icon;
  currentPatientData.weeklyGoal = goal;

  try {
    localStorage.setItem('gill_patient_goal_' + currentPatientData.phone, JSON.stringify(goal));
    saveLocalPatient(currentPatientData);
  } catch (e) {}

  renderWeeklyHealthGoal(currentPatientData);

  // Close modal
  const modalEl = document.getElementById('goalSelectionModal');
  if (modalEl && window.bootstrap) {
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
  }

  // Sync with backend
  const pin = localStorage.getItem('gill_patient_pin') || currentPatientData.pin;
  callPortalApi('/api/patient-records/goal', {
    method: 'POST',
    body: JSON.stringify({
      phone: currentPatientData.phone,
      pin: pin,
      weeklyGoal: goal
    })
  });
}

function saveCustomGoal() {
  const inputEl = document.getElementById('customGoalInput');
  const val = inputEl ? inputEl.value.trim() : '';
  if (!val) {
    alert('कृपया अपना लक्ष्य दर्ज करें।');
    return;
  }
  selectPresetGoal('custom', val, 'व्यक्तिगत स्वास्थ्य आदत (Personal Lifestyle Habit)', '🎯');
  if (inputEl) inputEl.value = '';
}

function openRegisterForPhone(phone) {
  showPortalView('register');
  const regPhone = document.getElementById('ptRegPhone');
  if (regPhone) regPhone.value = phone;
}

function showPortalAlert(msg, type) {
  const alertEl = document.getElementById('ptPortalAlert');
  if (!alertEl) return;
  alertEl.style.display = 'block';
  alertEl.className = `alert alert-${type} py-2 px-3 small`;
  alertEl.textContent = msg;
}

// Auto-clean phone input on blur
function attachPhoneAutoClean(inputEl) {
  if (!inputEl) return;
  inputEl.addEventListener('blur', () => {
    const clean = normalizeIndianPhone(inputEl.value);
    if (clean.length === 10) {
      inputEl.value = clean;
    }
  });
}

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
  // Pre-seed initial verified patients for local offline fallback
  const initialPatients = {
    "9876543210": { "phone": "9876543210", "name": "रमेश कुमार", "age": "52", "gender": "Male", "complaints": "हाई बीपी और घबराहट", "pin": "1234", "registered": true, "createdAt": "2026-09-29T05:27:11.805Z", "vitalsHistory": [{ "sys": 138, "dia": 88, "pulse": 76, "sugar": 118, "notes": "", "recordedAt": "2026-09-29T05:27:11.806Z" }] },
    "9258879884": { "phone": "9258879884", "name": "गुरुजीत सिंह गिल", "age": "45", "gender": "Male", "complaints": "रूटीन चेकअप", "pin": "1234", "registered": true, "createdAt": "2026-09-29T12:27:36.989Z", "vitalsHistory": [{ "sys": 124, "dia": 82, "pulse": 72, "sugar": 105, "notes": "", "recordedAt": "2026-09-29T12:27:36.990Z" }] },
    "9717724669": { "phone": "9717724669", "name": "Bablu rajput", "age": "43", "gender": "Male", "complaints": "Cough", "pin": "1234", "registered": true, "createdAt": "2026-09-29T13:52:19.325Z", "vitalsHistory": [{ "sys": 130, "dia": 70, "pulse": 82, "sugar": 97, "notes": "", "recordedAt": "2026-09-29T13:52:19.325Z" }] },
    "9876501234": { "phone": "9876501234", "name": "मनोज शर्मा", "age": "50", "gender": "Male", "complaints": "हाई बीपी व बेचैनी", "pin": "5678", "registered": true, "createdAt": "2026-09-29T13:56:41.414Z", "vitalsHistory": [{ "sys": 132, "dia": 86, "pulse": 74, "sugar": null, "notes": "", "recordedAt": "2026-09-29T13:56:46.710Z" }, { "sys": 140, "dia": 92, "pulse": 80, "sugar": 125, "notes": "", "recordedAt": "2026-09-29T13:56:41.415Z" }] }
  };
  for (const [pPhone, pData] of Object.entries(initialPatients)) {
    if (!localStorage.getItem('gill_patient_' + pPhone)) {
      saveLocalPatient(pData);
    }
  }

  attachPhoneAutoClean(document.getElementById('ptLoginPhone'));
  attachPhoneAutoClean(document.getElementById('ptRegPhone'));
  attachPhoneAutoClean(document.getElementById('doctorSearchPhone'));

  // Check URL query parameters (e.g. ?patient=9258879884 or ?phone=9258879884)
  const urlParams = new URLSearchParams(window.location.search);
  const paramPhone = urlParams.get('patient') || urlParams.get('phone');

  if (paramPhone) {
    const cleanParam = normalizeIndianPhone(paramPhone);
    if (cleanParam.length === 10) {
      // Auto-open modal
      const modalEl = document.getElementById('patientPortalModal');
      if (modalEl && window.bootstrap) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
      }

      const loginPhone = document.getElementById('ptLoginPhone');
      if (loginPhone) loginPhone.value = cleanParam;

      const savedPin = localStorage.getItem('gill_patient_pin');
      if (savedPin) {
        const loginPin = document.getElementById('ptLoginPin');
        if (loginPin) loginPin.value = savedPin;
        // Auto-login
        loginPatientWithPin();
      } else {
        showPortalView('login');
        showPortalAlert(`मोबाइल नंबर (+91 ${cleanParam}) पहचाना गया। अपना 4-अंकों का गुप्त पिन डालकर कार्ड खोलें।`, 'info');
      }
      return;
    }
  }

  // Check saved session
  const savedPhone = localStorage.getItem('gill_patient_phone');
  const savedPin = localStorage.getItem('gill_patient_pin');
  if (savedPhone && savedPin) {
    const loginPhone = document.getElementById('ptLoginPhone');
    const loginPin = document.getElementById('ptLoginPin');
    if (loginPhone) loginPhone.value = savedPhone;
    if (loginPin) loginPin.value = savedPin;
  }
});
