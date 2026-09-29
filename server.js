import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Enable CORS so upload from GitHub Pages (or any origin) works seamlessly
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Enable large JSON payloads for base64 photo uploads and patient data
app.use(express.json({ limit: '50mb' }));

const PATIENTS_DB_FILE = path.join(__dirname, 'patient_records.json');

// Initialize patient database file if not exists
if (!fs.existsSync(PATIENTS_DB_FILE)) {
  fs.writeFileSync(PATIENTS_DB_FILE, JSON.stringify({}, null, 2));
}

// Helper to read and write patient records
function getPatientDb() {
  try {
    return JSON.parse(fs.readFileSync(PATIENTS_DB_FILE, 'utf8') || '{}');
  } catch (e) {
    return {};
  }
}

function savePatientDb(data) {
  try {
    fs.writeFileSync(PATIENTS_DB_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error saving patient database:', e);
  }
}

// Normalize any Indian mobile input (+91, 91, 0, spaces, dashes) to clean 10 digits
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

// API: Save or Update Patient Registration & Vitals
app.post('/api/patient-records', (req, res) => {
  try {
    const { phone, name, age, gender, complaints, sys, dia, pulse, sugar, notes, pin, isDoctorAdmin } = req.body;
    const cleanPhone = normalizeIndianPhone(phone);

    if (cleanPhone.length !== 10) {
      return res.status(400).json({ error: 'कृपया 10 अंकों का वैध भारतीय मोबाइल नंबर दर्ज करें।' });
    }

    const db = getPatientDb();
    const isNew = !db[cleanPhone];
    const existing = db[cleanPhone] || {
      phone: cleanPhone,
      name: name || 'Patient',
      age: age || '',
      gender: gender || '',
      complaints: complaints || '',
      pin: pin || '1234',
      registered: true,
      createdAt: new Date().toISOString(),
      vitalsHistory: []
    };

    if (isNew) {
      // First-time registration locks Name & Phone permanently
      existing.name = name || 'Patient';
      existing.pin = pin || '1234';
      existing.registered = true;
    } else {
      // Security: If already registered, Name & Phone CANNOT be changed by patient!
      // Only Clinic Owner / Doctor Admin can edit Name
      if (isDoctorAdmin && name) {
        existing.name = name;
      }
      // If PIN is provided during subsequent login/save, check PIN
      if (pin && existing.pin && existing.pin !== pin && !isDoctorAdmin) {
        return res.status(401).json({ error: 'गलत 4-अंकों का गुप्त पिन। कृपया सही पिन डालें।' });
      }
    }

    // Editable medical vitals & complaints & weekly goal
    if (age) existing.age = age;
    if (gender) existing.gender = gender;
    if (complaints) existing.complaints = complaints;
    if (req.body.weeklyGoal) existing.weeklyGoal = req.body.weeklyGoal;

    // Append vital reading if BP provided
    if (sys && dia) {
      existing.vitalsHistory.unshift({
        sys: parseInt(sys, 10),
        dia: parseInt(dia, 10),
        pulse: pulse ? parseInt(pulse, 10) : null,
        sugar: sugar ? parseInt(sugar, 10) : null,
        notes: notes || '',
        recordedAt: new Date().toISOString()
      });
      // Keep last 50 readings
      if (existing.vitalsHistory.length > 50) {
        existing.vitalsHistory = existing.vitalsHistory.slice(0, 50);
      }
    }

    existing.updatedAt = new Date().toISOString();
    db[cleanPhone] = existing;
    savePatientDb(db);

    return res.json({ success: true, patient: existing, isNew });
  } catch (err) {
    console.error('Error saving patient record:', err);
    return res.status(500).json({ error: err.message });
  }
});

// API: Patient Login / Unlock with Phone + 4-Digit PIN
app.post('/api/patient-records/verify', (req, res) => {
  try {
    const { phone, pin } = req.body;
    const cleanPhone = normalizeIndianPhone(phone);

    if (cleanPhone.length !== 10) {
      return res.status(400).json({ error: 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।' });
    }

    const db = getPatientDb();
    const patient = db[cleanPhone];

    if (!patient) {
      return res.status(404).json({ error: 'इस मोबाइल नंबर का कोई रिकॉर्ड नहीं मिला। कृपया पहले रजिस्टर करें।' });
    }

    if (patient.pin && pin && String(patient.pin).trim() !== String(pin).trim()) {
      return res.status(401).json({ error: 'अमान्य पिन! कृपया 4 अंकों का सही पिन दर्ज करें।' });
    }

    return res.json({ success: true, patient });
  } catch (err) {
    console.error('Error verifying patient PIN:', err);
    return res.status(500).json({ error: err.message });
  }
});

// API: Update Patient Weekly Health Goal
app.post('/api/patient-records/goal', (req, res) => {
  try {
    const { phone, pin, weeklyGoal } = req.body;
    const cleanPhone = normalizeIndianPhone(phone);
    if (!cleanPhone || cleanPhone.length !== 10) {
      return res.status(400).json({ error: 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।' });
    }
    const db = getPatientDb();
    const patient = db[cleanPhone];
    if (!patient) {
      return res.status(404).json({ error: 'मरीज़ रिकॉर्ड नहीं मिला।' });
    }
    if (patient.pin && pin && String(patient.pin).trim() !== String(pin).trim()) {
      return res.status(401).json({ error: 'अमान्य पिन।' });
    }
    patient.weeklyGoal = weeklyGoal;
    patient.updatedAt = new Date().toISOString();
    db[cleanPhone] = patient;
    savePatientDb(db);
    return res.json({ success: true, patient, weeklyGoal: patient.weeklyGoal });
  } catch (err) {
    console.error('Error saving patient weekly goal:', err);
    return res.status(500).json({ error: err.message });
  }
});

// API: Lookup Patient by 10-digit Phone Number (For Dr. Gill & Patients)
app.get('/api/patient-records', (req, res) => {
  try {
    const cleanPhone = normalizeIndianPhone(req.query.phone);
    if (!cleanPhone || cleanPhone.length !== 10) {
      return res.status(400).json({ error: 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।' });
    }

    const db = getPatientDb();
    const patient = db[cleanPhone];

    if (!patient) {
      return res.status(404).json({ error: 'इस मोबाइल नंबर का कोई रिकॉर्ड नहीं मिला।' });
    }

    return res.json({ success: true, patient });
  } catch (err) {
    console.error('Error fetching patient record:', err);
    return res.status(500).json({ error: err.message });
  }
});

// API to save doctor's real photos uploaded from phone/desktop
app.post('/api/upload-photo', (req, res) => {
  try {
    const { filename, base64 } = req.body;
    if (!filename || !base64) {
      return res.status(400).json({ error: 'Missing filename or base64 data' });
    }
    const cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    
    console.log(`Processing upload for filename: ${filename} (${buffer.length} bytes)`);

    // Determine target based on filename or photo type
    const fnLower = (filename || '').toLowerCase();
    const isPortrait = fnLower.includes('164346') || fnLower.includes('portrait') || fnLower.includes('suit') || fnLower.includes('blazer') || fnLower.includes('court');
    const isOpd = fnLower.includes('125939') || fnLower.includes('172901') || fnLower.includes('opd') || fnLower.includes('scrub');

    let savedFiles = [];

    if (isPortrait || (!isOpd && fnLower.includes('doctor-portrait'))) {
      // 1. Doctor in Navy Suit / Blazer at Desk
      fs.writeFileSync(path.join(__dirname, 'doctor-portrait.jpg'), buffer);
      fs.writeFileSync(path.join(__dirname, 'doctor.jpg'), buffer);
      fs.writeFileSync(path.join(__dirname, 'hero.jpg'), buffer);
      savedFiles.push('doctor-portrait.jpg', 'doctor.jpg', 'hero.jpg');
    } else {
      // 2. Doctor in Scrubs with Stethoscope
      fs.writeFileSync(path.join(__dirname, 'doctor-opd.jpg'), buffer);
      fs.writeFileSync(path.join(__dirname, 'doctor2.jpg'), buffer);
      fs.writeFileSync(path.join(__dirname, 'doctor3.jpg'), buffer);
      savedFiles.push('doctor-opd.jpg', 'doctor2.jpg', 'doctor3.jpg');
    }

    console.log(`Successfully saved files locally: ${savedFiles.join(', ')}`);

    // Automatically push updated photo files to GitHub if token configured
    let gitPushSuccess = false;
    let gitPushMessage = '';
    try {
      let gitToken = process.env.GITHUB_PAT;
      const tokenFile = path.join(__dirname, '.git_token');
      if (!gitToken && fs.existsSync(tokenFile)) {
        gitToken = fs.readFileSync(tokenFile, 'utf8').trim();
      }

      if (gitToken) {
        const repoUrl = `https://gurjeetsinghgill8-web:${gitToken}@github.com/gurjeetsinghgill8-web/gill-heart-clinic.git`;
        execSync(`git add doctor* hero* && git commit -m "Update doctor real clinic photos [auto-upload]" && git push ${repoUrl} gh-pages:gh-pages && git push ${repoUrl} gh-pages:master`, {
          cwd: __dirname,
          timeout: 20000
        });
        gitPushSuccess = true;
        gitPushMessage = 'Live on GitHub Pages!';
        console.log('Successfully auto-pushed photos to GitHub gh-pages & master!');
      }
    } catch (gitErr) {
      console.warn('Auto git push notice (may retry or token changed):', gitErr.message);
      gitPushMessage = gitErr.message;
    }

    return res.json({
      success: true,
      files: savedFiles,
      bytes: buffer.length,
      gitPush: gitPushSuccess,
      message: gitPushSuccess ? 'फ़ोटो वेबसाइट व GitHub दोनों पर सफलतापूर्वक लाइव हो गई है!' : 'फ़ोटो सर्वर पर सेव हो गई है!'
    });
  } catch (err) {
    console.error('Error saving uploaded photo:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Intercept legacy gate photos and serve real doctor photo if available, otherwise vector avatar
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');

  // Check if user uploaded real doctor photos
  const portraitPath = path.join(__dirname, 'doctor-portrait.jpg');
  const opdPath = path.join(__dirname, 'doctor-opd.jpg');
  const hasPortrait = fs.existsSync(portraitPath);
  const hasOpd = fs.existsSync(opdPath);

  if (req.path === '/doctor-portrait.jpg' && hasPortrait) {
    return res.sendFile(portraitPath);
  }
  if (req.path === '/doctor-opd.jpg' && hasOpd) {
    return res.sendFile(opdPath);
  }

  // If old gate photo paths are requested:
  const legacyGatePhotos = ['/doctor.jpg', '/doctor2.jpg', '/doctor3.jpg', '/hero.jpg', '/clinic1.jpg', '/clinic2.jpg', '/og-image.jpg'];
  if (legacyGatePhotos.includes(req.path)) {
    if (hasPortrait) {
      return res.sendFile(portraitPath);
    }
    return res.sendFile(path.join(__dirname, 'doctor-avatar.svg'));
  }
  next();
});

// Serve static assets with html extensions support
app.use(express.static(__dirname, {
  extensions: ['html', 'htm']
}));

// Fallback routing for clean URLs
app.use((req, res) => {
  const potentialHtmlPath = path.join(__dirname, req.path + '.html');
  if (fs.existsSync(potentialHtmlPath) && fs.statSync(potentialHtmlPath).isFile()) {
    return res.sendFile(potentialHtmlPath);
  }

  const potentialIndexPath = path.join(__dirname, req.path, 'index.html');
  if (fs.existsSync(potentialIndexPath) && fs.statSync(potentialIndexPath).isFile()) {
    return res.sendFile(potentialIndexPath);
  }

  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Gill Heart Clinic server listening on http://${HOST}:${PORT}`);
});
