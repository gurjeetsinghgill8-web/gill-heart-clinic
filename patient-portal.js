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

    const res = await fetch('/api/patient-records/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, pin })
    });

    const data = await res.json();

    if (!res.ok || !data.success || !data.patient) {
      throw new Error(data.error || 'अमान्य मोबाइल नंबर या पिन।');
    }

    // Save session in localStorage
    localStorage.setItem('gill_patient_phone', phone);
    localStorage.setItem('gill_patient_pin', pin);

    // Render Dashboard
    currentPatientData = data.patient;
    renderPatientDashboard(data.patient);
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

    const res = await fetch('/api/patient-records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok || !data.success || !data.patient) {
      throw new Error(data.error || 'रजिस्ट्रेशन विफल रहा।');
    }

    // Save session
    localStorage.setItem('gill_patient_phone', phone);
    localStorage.setItem('gill_patient_pin', pin);

    currentPatientData = data.patient;
    renderPatientDashboard(data.patient);
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

    const res = await fetch('/api/patient-records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok || !data.success || !data.patient) {
      throw new Error(data.error || 'रीडिंग सेव नहीं हो सकी।');
    }

    currentPatientData = data.patient;

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
    renderPatientDashboard(data.patient);
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
    const res = await fetch(`/api/patient-records?phone=${cleanPhone}`);
    const data = await res.json();

    if (!res.ok || !data.success || !data.patient) {
      resultDiv.innerHTML = `
        <div class="alert alert-warning py-2 small mb-0">
          <i class="fas fa-exclamation-triangle me-1"></i> इस मोबाइल नंबर (${cleanPhone}) का कोई रिकॉर्ड नहीं मिला।
          <a href="javascript:void(0)" onclick="openRegisterForPhone('${cleanPhone}')" class="fw-bold ms-2 text-primary">यहाँ नया रजिस्टर करें →</a>
        </div>
      `;
      return;
    }

    const p = data.patient;
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
    const res = await fetch(`/api/patient-records?phone=${phone}`);
    const data = await res.json();
    if (data.success && data.patient) {
      currentPatientData = data.patient;
      renderPatientDashboard(data.patient);
    }
  } catch (e) {
    alert('डेटा लोड नहीं हो सका: ' + e.message);
  }
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
