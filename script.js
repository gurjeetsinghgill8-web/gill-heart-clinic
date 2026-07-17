/* ==========================================
   Gill Heart Clinic — Premium JavaScript
   Version 2.0
   Features: AOS, Swiper, Navbar, Counter,
   Typewriter, Back to Top, Ripple, Floating Hearts
   ========================================== */

/* ==============================
   PRELOADER (LEGO Part 58)
   ============================== */
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    setTimeout(() => {
      preloader.classList.add('hide');
      setTimeout(() => { preloader.style.display = 'none'; }, 600);
    }, 2000);
  }
});

/* ==============================
   INIT AOS (Animate On Scroll)
   ============================== */
AOS.init({
  duration: 800,
  once: true,
  offset: 100,
  easing: 'ease-out-cubic'
});

/* ==============================
   SWIPER TESTIMONIALS
   ============================== */
new Swiper('.testimonial-swiper', {
  loop: true,
  autoplay: {
    delay: 4000,
    disableOnInteraction: false,
  },
  pagination: {
    el: '.swiper-pagination',
    clickable: true,
  },
  effect: 'slide',
  speed: 800,
});

/* ==============================
   STICKY NAVBAR
   ============================== */
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

/* ==============================
   SMOOTH SCROLL FOR ANCHOR LINKS
   ============================== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    const targetEl = document.querySelector(targetId);
    if (targetEl) {
      e.preventDefault();
      const navHeight = navbar.offsetHeight + 50; // + emergency banner
      const targetPos = targetEl.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top: targetPos, behavior: 'smooth' });

      // Close mobile menu if open
      const navCollapse = document.getElementById('navMenu');
      if (navCollapse.classList.contains('show')) {
        const toggler = document.querySelector('.navbar-toggler');
        toggler.click();
      }
    }
  });
});

/* ==============================
   COUNTER ANIMATION
   ============================== */
const counters = document.querySelectorAll('.counter');

const startCounter = (counter) => {
  const target = +counter.getAttribute('data-target');
  counter.innerText = '0';

  const update = () => {
    const current = +counter.innerText.replace(/,/g, '');
    const increment = target / 100;

    if (current < target) {
      counter.innerText = Math.ceil(current + increment);
      setTimeout(update, 20);
    } else {
      counter.innerText = target.toLocaleString();
    }
  };

  update();
};

// Use IntersectionObserver to trigger counters when visible
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      startCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

counters.forEach(counter => counterObserver.observe(counter));

/* ==============================
   BACK TO TOP BUTTON
   ============================== */
const topBtn = document.createElement('button');
topBtn.innerHTML = '↑';
topBtn.id = 'topBtn';
topBtn.setAttribute('aria-label', 'Back to top');
document.body.appendChild(topBtn);

window.addEventListener('scroll', () => {
  topBtn.style.display = window.scrollY > 500 ? 'block' : 'none';
});

topBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ==============================
   TYPEWRITER EFFECT
   ============================== */
const heroHeading = document.querySelector('.hero-text h1');
if (heroHeading) {
  const originalText = heroHeading.textContent;
  heroHeading.innerHTML = '';
  let charIndex = 0;

  function typeWriter() {
    if (charIndex < originalText.length) {
      heroHeading.innerHTML += originalText.charAt(charIndex);
      charIndex++;
      setTimeout(typeWriter, 60);
    }
  }

  // Start typewriter after a short delay
  setTimeout(typeWriter, 500);
}

/* ==============================
   RIPPLE BUTTON EFFECT
   ============================== */
document.querySelectorAll('.btn, .submit-btn').forEach(button => {
  button.addEventListener('click', function (e) {
    const rect = this.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);

    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: rgba(255,255,255,.35);
      border-radius: 50%;
      left: ${e.clientX - rect.left - size / 2}px;
      top: ${e.clientY - rect.top - size / 2}px;
      transform: scale(0);
      pointer-events: none;
      transition: transform .6s, opacity .6s;
    `;

    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(ripple);

    requestAnimationFrame(() => {
      ripple.style.transform = 'scale(2.5)';
      ripple.style.opacity = '0';
    });

    setTimeout(() => ripple.remove(), 700);
  });
});

/* ==============================
   FLOATING HEART EFFECT
   ============================== */
setInterval(() => {
  const heart = document.createElement('div');
  heart.innerHTML = '<i class="fas fa-heart"></i>';
  heart.style.cssText = `
    position: fixed;
    left: ${Math.random() * window.innerWidth}px;
    bottom: -50px;
    font-size: ${14 + Math.random() * 20}px;
    color: rgba(217, 4, 41, 0.25);
    pointer-events: none;
    z-index: 0;
    transition: all 6s cubic-bezier(.4,0,.2,1);
    user-select: none;
    transform: translateX(0);
  `;
  document.body.appendChild(heart);

  requestAnimationFrame(() => {
    heart.style.bottom = '110%';
    heart.style.transform = `translateX(${Math.random() * 40 - 20}px) rotate(${Math.random() * 30 - 15}deg)`;
    heart.style.opacity = '0';
  });

  setTimeout(() => heart.remove(), 6500);
}, 3500);

/* ==============================
   BMI CALCULATOR (LEGO Part 35)
   ============================== */
const calcBtn = document.getElementById('calcBmi');
if (calcBtn) {
  calcBtn.addEventListener('click', () => {
    const weight = parseFloat(document.getElementById('weight').value);
    const height = parseFloat(document.getElementById('height').value);

    if (!weight || !height || weight < 1 || height < 1) {
      alert('Please enter valid weight and height.');
      return;
    }

    const heightM = height / 100;
    const bmi = weight / (heightM * heightM);
    const rounded = bmi.toFixed(1);

    // Category
    let category, color, barColor, percent;
    if (bmi < 18.5) {
      category = 'Underweight';
      color = '#92400e';
      barColor = '#f59e0b';
      percent = (bmi / 40) * 100;
    } else if (bmi < 25) {
      category = 'Normal Weight';
      color = '#065f46';
      barColor = '#10b981';
      percent = (bmi / 40) * 100;
    } else if (bmi < 30) {
      category = 'Overweight';
      color = '#9a3412';
      barColor = '#f97316';
      percent = (bmi / 40) * 100;
    } else {
      category = 'Obese';
      color = '#991b1b';
      barColor = '#ef4444';
      percent = (bmi / 40) * 100;
    }

    // Show results
    const placeholder = document.querySelector('.bmi-result-placeholder');
    const data = document.querySelector('.bmi-result-data');
    if (placeholder) placeholder.style.display = 'none';
    if (data) data.style.display = 'block';

    const scoreEl = document.getElementById('bmiScore');
    const catEl = document.getElementById('bmiCategory');
    const barEl = document.getElementById('bmiBarFill');

    if (scoreEl) scoreEl.textContent = rounded;
    if (catEl) {
      catEl.textContent = category;
      catEl.className = 'bmi-category ' + category.toLowerCase().replace(' ', '');
    }
    if (barEl) {
      barEl.style.width = Math.min(percent, 100) + '%';
      barEl.style.background = barColor;
    }

    // Animate score
    if (scoreEl) {
      scoreEl.style.color = color;
      scoreEl.style.transition = 'color .5s';
    }
  });

  // Enter key support
  document.querySelectorAll('.bmi-input').forEach(input => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') calcBtn.click();
    });
  });
}

/* ==============================
   HEART RISK CALCULATOR (Part 36)
   ============================== */
const riskBtn = document.getElementById('calcRisk');
if (riskBtn) {
  riskBtn.addEventListener('click', () => {
    const gender = document.getElementById('riskGender').value;
    const age = parseInt(document.getElementById('riskAge').value);
    const weight = parseFloat(document.getElementById('riskWeight').value);
    const height = parseFloat(document.getElementById('riskHeight').value);
    const smoker = document.getElementById('riskSmoker').value;
    const diabetes = document.getElementById('riskDiabetes').value;
    const sbp = parseInt(document.getElementById('riskBP').value);
    const chol = parseInt(document.getElementById('riskChol').value);

    // Validate
    if (!age || age < 30 || age > 74) { alert('Enter age between 30-74'); return; }
    if (!weight || weight < 20) { alert('Enter valid weight'); return; }
    if (!height || height < 50) { alert('Enter valid height'); return; }
    if (!sbp || sbp < 80) { alert('Enter valid systolic BP'); return; }
    if (!chol || chol < 50) { alert('Enter valid cholesterol'); return; }

    // Simplified risk scoring (Framingham-based approximation)
    let points = 0;
    const bmi = weight / ((height / 100) ** 2);

    // Age points
    if (gender === 'male') {
      if (age >= 30 && age <= 34) points += 0;
      else if (age <= 39) points += 2;
      else if (age <= 44) points += 5;
      else if (age <= 49) points += 7;
      else if (age <= 54) points += 10;
      else if (age <= 59) points += 13;
      else if (age <= 64) points += 16;
      else points += 18;
    } else {
      if (age >= 30 && age <= 34) points += 0;
      else if (age <= 39) points += 2;
      else if (age <= 44) points += 4;
      else if (age <= 49) points += 6;
      else if (age <= 54) points += 9;
      else if (age <= 59) points += 12;
      else if (age <= 64) points += 15;
      else points += 17;
    }

    // BMI points
    if (bmi >= 30) points += 2;
    else if (bmi >= 25) points += 1;

    // Smoker
    if (smoker === 'yes') points += (gender === 'male' ? 4 : 3);

    // Diabetes
    if (diabetes === 'yes') points += (gender === 'male' ? 3 : 4);

    // BP points
    if (sbp >= 160) points += (gender === 'male' ? 3 : 5);
    else if (sbp >= 140) points += (gender === 'male' ? 2 : 3);
    else if (sbp >= 130) points += 1;

    // Cholesterol
    if (chol >= 240) points += (gender === 'male' ? 2 : 3);
    else if (chol >= 200) points += (gender === 'male' ? 1 : 2);

    // Convert points to risk percentage
    let risk = Math.min(points * 2.5, 45);
    risk = Math.round(risk * 10) / 10;

    // Category
    let level, color, message;
    if (risk < 10) {
      level = 'Low Risk';
      color = '#10b981';
      message = 'Your heart risk is low. Maintain a healthy lifestyle with regular exercise and a balanced diet.';
    } else if (risk < 20) {
      level = 'Moderate Risk';
      color = '#f59e0b';
      message = 'Your risk is moderate. Consider lifestyle changes and schedule a checkup with Dr G S Gill.';
    } else {
      level = 'High Risk';
      color = '#ef4444';
      message = 'Your risk is high. Please consult Dr G S Gill immediately for a complete cardiac evaluation.';
    }

    // Show results
    const placeholder = document.querySelector('.risk-placeholder');
    const data = document.querySelector('.risk-data');
    if (placeholder) placeholder.style.display = 'none';
    if (data) data.style.display = 'block';

    // Gauge
    const gauge = document.getElementById('riskGauge');
    const percent = document.getElementById('riskPercent');
    const levelEl = document.getElementById('riskLevel');
    const barFill = document.getElementById('riskBarFill');
    const msgEl = document.getElementById('riskMessage');

    const angle = (risk / 45) * 360;
    if (gauge) gauge.style.background = `conic-gradient(${color} 0deg, ${color} ${angle}deg, #e5e7eb ${angle}deg)`;
    if (percent) percent.textContent = risk + '%';
    if (levelEl) { levelEl.textContent = level; levelEl.className = 'risk-level ' + level.split(' ')[0].toLowerCase(); }
    if (barFill) barFill.style.width = Math.min((risk / 30) * 100, 100) + '%';
    if (msgEl) msgEl.textContent = message;
  });
}

/* ==============================
   AI CHATBOT (LEGO Part 50)
   ============================== */
const chatbotToggle = document.getElementById('chatbotToggle');
const chatbotBox = document.getElementById('chatbotBox');
const chatbotClose = document.getElementById('chatbotClose');
const chatbotInput = document.getElementById('chatbotInput');
const chatbotSend = document.getElementById('chatbotSend');
const chatbotMsgs = document.getElementById('chatbotMsgs');

// Chatbot knowledge base
const botReplies = {
  'timings': '🕘 **Clinic Hours:**\nMonday – Sunday\n9:00 AM – 7:00 PM\n\n📍 Sugar Mill, Mohiuddinpur, Meerut',
  'fees': '💰 **Consultation Fee:**\nJust ₹300 only!\n\nAffordable & ethical cardiac care for everyone.',
  'location': '📍 **Gill Heart Clinic**\nSugar Mill, Mohiuddinpur\nMeerut 250205\nNear Metro Pillar No. 1375\n\n📞 +91 9258879884',
  'services': '🩺 **Heart Care Services:**\n❤️ Chest Pain Evaluation\n📈 ECG & 2D Echo\n🏃 TMT (Treadmill Test)\n🫀 Heart Failure Treatment\n💉 Diabetes Care\n🥗 Cholesterol Management\n🩺 High BP Management',
  'contact': '📞 **Contact Us:**\nPhone: +91 9258879884\nWhatsApp: +91 9258879884\n\n📍 Sugar Mill, Mohiuddinpur, Meerut\nNear Metro Pillar No. 1375',
  'doctor': '👨‍⚕️ **Dr Gurjeet Singh Gill (Dr. GS Gill)**\nCardio-Physician | AI in Healthcare (IIT Kanpur)\n\n✅ MBBS — Govt Medical College MPSMC\n✅ Diploma Cardiology — UN Mehta Institute, Ahmedabad\n✅ PGDCCP (NI) — Clinical Cardiology\n✅ AI in Healthcare — IIT Kanpur\n✅ 12+ Years Experience\n✅ 50,000+ Patients Treated\n✅ Associate Consultant — Yashoda Hospital, Ghaziabad',
  'emergency': '🚑 **Heart Emergency?**\nCall us immediately:\n📞 +91 9258879884\n\nChest Pain • Breathlessness • High BP\nDon\'t delay!',
  'appointment': '📅 **Book Appointment**\nCall: +91 9258879884\nWhatsApp: wa.me/919258879884\n\nOr fill the appointment form on our website!',
};

function addBotMessage(text) {
  const div = document.createElement('div');
  div.className = 'chat-msg bot';
  div.innerHTML = '<div class="msg-text">' + text.replace(/\n/g, '<br>') + '</div>';
  chatbotMsgs.appendChild(div);
  chatbotMsgs.scrollTop = chatbotMsgs.scrollHeight;
}

function addUserMessage(text) {
  const div = document.createElement('div');
  div.className = 'chat-msg user';
  div.innerHTML = '<div class="msg-text">' + text + '</div>';
  chatbotMsgs.appendChild(div);
  chatbotMsgs.scrollTop = chatbotMsgs.scrollHeight;
}

function getBotReply(input) {
  const q = input.toLowerCase().trim();
  if (q.includes('time') || q.includes('hour') || q.includes('timing') || q.includes('kholta') || q.includes('kab')) return botReplies.timings;
  if (q.includes('fee') || q.includes('price') || q.includes('cost') || q.includes('₹') || q.includes('rs') || q.includes('kimat')) return botReplies.fees;
  if (q.includes('where') || q.includes('location') || q.includes('address') || q.includes('map') || q.includes('kahan') || q.includes('pata')) return botReplies.location;
  if (q.includes('service') || q.includes('treat') || q.includes('ecg') || q.includes('echo') || q.includes('tmt')) return botReplies.services;
  if (q.includes('doctor') || q.includes('gill') || q.includes('specia')) return botReplies.doctor;
  if (q.includes('emergency') || q.includes('chest pain') || q.includes('attack') || q.includes('ambulance')) return botReplies.emergency;
  if (q.includes('appointment') || q.includes('book') || q.includes('visit') || q.includes('meet')) return botReplies.appointment;
  if (q.includes('contact') || q.includes('phone') || q.includes('call') || q.includes('mobile') || q.includes('whatsapp') || q.includes('📞')) return botReplies.contact;
  if (q.includes('hi') || q.includes('hello') || q.includes('hey') || q.includes('namaste') || q.includes('hlo')) return '👋 Namaste! I\'m Dr Gill\'s virtual assistant. How can I help you?\n\nTry asking about:\n🕘 Timings &nbsp; 💰 Fees &nbsp; 📍 Location &nbsp; 🩺 Services &nbsp; 📞 Contact';
  if (q.includes('thank') || q.includes('thanks') || q.includes('dhanyavad')) return '🙏 You\'re welcome! Is there anything else I can help you with?\n\nFor emergencies, please call 📞 +91 9258879884 immediately.';
  if (q.includes('bmi') || q.includes('weight')) return '📊 Try our **BMI Calculator** on this website! Go to the BMI Calculator section to check your Body Mass Index.';
  if (q.includes('risk') || q.includes('heart disease')) return '🫀 Try our **Heart Risk Calculator** on this website! Fill in your health details to check your 10-year heart disease risk.';
  return '🤔 I\'m not sure I understand. Try asking about:\n\n🕘 **Timings** — Clinic hours\n💰 **Fees** — Consultation cost\n📍 **Location** — Where to find us\n🩺 **Services** — What we treat\n📞 **Contact** — Phone & WhatsApp\n👨‍⚕️ **Doctor** — About Dr Gill';
}

if (chatbotToggle && chatbotBox) {
  chatbotToggle.addEventListener('click', () => {
    chatbotBox.classList.toggle('open');
  });

  if (chatbotClose) {
    chatbotClose.addEventListener('click', () => {
      chatbotBox.classList.remove('open');
    });
  }

  if (chatbotSend && chatbotInput) {
    const sendMsg = () => {
      const msg = chatbotInput.value.trim();
      if (!msg) return;
      addUserMessage(msg);
      chatbotInput.value = '';
      setTimeout(() => {
        const reply = getBotReply(msg);
        addBotMessage(reply);
      }, 500);
    };

    chatbotSend.addEventListener('click', sendMsg);
    chatbotInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendMsg();
    });
  }

  // Quick buttons
  document.querySelectorAll('.quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const msg = btn.dataset.msg;
      addUserMessage(msg);
      const reply = getBotReply(msg);
      setTimeout(() => addBotMessage(reply), 400);
    });
  });
}

/* ==============================
   APPOINTMENT FORM HANDLER
   ============================== */
const appointmentForm = document.getElementById('appointmentForm');
if (appointmentForm) {
  appointmentForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = this.querySelector('input[type="text"]').value.trim();
    const phone = this.querySelector('input[type="tel"]').value.trim();
    const age = this.querySelector('input[type="number"]').value.trim();
    const problem = this.querySelector('select').value;
    const symptoms = this.querySelector('textarea').value.trim();

    if (!name || !phone) {
      alert('Please enter your name and phone number.');
      return;
    }

    // Build WhatsApp message
    let message = `🏥 *New Appointment Request*\n\n`;
    message += `👤 *Name:* ${name}\n`;
    message += `📞 *Phone:* ${phone}\n`;
    if (age) message += `🎂 *Age:* ${age}\n`;
    if (problem) message += `🩺 *Problem:* ${problem}\n`;
    if (symptoms) message += `📝 *Symptoms:* ${symptoms}\n`;

    const encoded = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/919258879884?text=${encoded}`;

    window.open(whatsappURL, '_blank');

    // Show success feedback
    const btn = this.querySelector('.submit-btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check-circle"></i> Sent! We\'ll contact you soon';
    btn.style.background = 'linear-gradient(135deg, #16a34a, #22c55e)';

    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.style.background = '';
    }, 4000);

    this.reset();
  });
}

/* ==============================
   WELCOME MESSAGE
   ============================== */
window.addEventListener('load', () => {
  setTimeout(() => {
    console.log('❤️ Welcome to Gill Heart Clinic — Your Heart Matters to Us!');
    console.log('📍 Sugar Mill, Mohiuddinpur, Meerut | 📞 +91 9258879884');
  }, 1000);
});

/* ==============================
   FADE IN OBSERVER (Fallback for AOS)
   ============================== */
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
    }
  });
}, { threshold: .15 });

document.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));

/* ==============================
   ASCVD CALCULATOR (Part 37)
   ============================== */
document.getElementById('calcAscvd')?.addEventListener('click', () => {
  const gender = document.getElementById('ascvdGender').value;
  const age = parseInt(document.getElementById('ascvdAge').value);
  const race = document.getElementById('ascvdRace').value;
  const chol = parseInt(document.getElementById('ascvdChol').value);
  const hdl = parseInt(document.getElementById('ascvdHdl').value);
  const sbp = parseInt(document.getElementById('ascvdSbp').value);
  const bpMeds = document.getElementById('ascvdBpMeds').value;
  const smoker = document.getElementById('ascvdSmoker').value;
  const diabetes = document.getElementById('ascvdDiabetes').value;

  const err = [];
  if (!age || age < 40 || age > 79) err.push('Age (40-79)');
  if (!chol || chol < 100) err.push('Total Cholesterol');
  if (!hdl || hdl < 20) err.push('HDL Cholesterol');
  if (!sbp || sbp < 90) err.push('Systolic BP');
  if (err.length) { alert('Please fill: ' + err.join(', ')); return; }

  // Simplified ASCVD scoring
  let score = 0;
  score += (age - 40) * (gender === 'male' ? 0.4 : 0.3);
  if (smoker === 'yes') score += (gender === 'male' ? 4 : 5);
  if (diabetes === 'yes') score += (gender === 'male' ? 3 : 4);
  if (bpMeds === 'yes') score += 2;
  score += (chol - 150) * 0.01;
  score += (200 - hdl) * 0.02;
  if (race === 'african') score += (gender === 'male' ? 2 : 3);
  score = Math.round(Math.min(Math.max(score, 1), 45) * 10) / 10;

  let level, color, msg;
  if (score < 5) { level = 'low'; color = '#10b981'; msg = 'Low risk — keep up the healthy lifestyle!'; }
  else if (score < 7.5) { level = 'borderline'; color = '#f59e0b'; msg = 'Borderline risk — consider lifestyle changes.'; }
  else if (score < 20) { level = 'elevated'; color = '#f97316'; msg = 'Elevated risk — please consult Dr G S Gill.'; }
  else { level = 'high'; color = '#ef4444'; msg = 'High risk — schedule a cardiac evaluation immediately!'; }

  const result = document.getElementById('ascvdResult');
  result.style.display = 'block';
  document.getElementById('ascvdScore').textContent = score + '%';
  document.getElementById('ascvdScore').style.color = color;
  const lvl = document.getElementById('ascvdLevel');
  lvl.textContent = level.charAt(0).toUpperCase() + level.slice(1) + ' Risk';
  lvl.className = 'tools-level ' + level;
  document.getElementById('ascvdBar').style.width = Math.min((score / 30) * 100, 100) + '%';
  document.getElementById('ascvdMsg').textContent = msg;
  result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

/* ==============================
   BSA CALCULATOR (Part 38)
   ============================== */
document.getElementById('calcBsa')?.addEventListener('click', () => {
  const w = parseFloat(document.getElementById('bsaWeight').value);
  const h = parseFloat(document.getElementById('bsaHeight').value);
  if (!w || !h) { alert('Enter valid weight and height.'); return; }

  const mosteller = Math.sqrt((h * w) / 3600);
  const duBois = 0.007184 * Math.pow(w, 0.425) * Math.pow(h, 0.725);

  document.getElementById('bsaResult').style.display = 'block';
  document.getElementById('bsaScore').textContent = mosteller.toFixed(2) + ' m²';
  document.querySelector('#bsaResult .bsa-meta:first-child small').textContent = '= ' + mosteller.toFixed(2) + ' m²';
  document.querySelector('#bsaResult .bsa-meta:last-child small').textContent = '= ' + duBois.toFixed(2) + ' m²';
});

/* ==============================
   IDEAL WEIGHT CALCULATOR (Part 39)
   ============================== */
document.getElementById('calcIdeal')?.addEventListener('click', () => {
  const gender = document.getElementById('idealGender').value;
  const height = parseFloat(document.getElementById('idealHeight').value);
  const frame = document.getElementById('idealFrame').value;

  if (!height || height < 50) { alert('Enter valid height.'); return; }

  const heightInInches = height / 2.54;
  let devine;
  if (gender === 'male') {
    devine = 50 + 2.3 * (heightInInches - 60);
  } else {
    devine = 45.5 + 2.3 * (heightInInches - 60);
  }

  const frameAdjust = { small: 0.9, medium: 1.0, large: 1.1 };
  const ideal = devine * frameAdjust[frame];
  const lower = Math.round(devine * 0.88);
  const upper = Math.round(devine * 1.15);

  document.getElementById('idealResult').style.display = 'block';
  document.getElementById('idealWeight').textContent = Math.round(ideal) + ' kg';
  document.getElementById('idealRange').textContent = lower + '-' + upper + ' kg';
  document.getElementById('idealDevine').textContent = Math.round(devine) + ' kg';
});

/* ==============================
   DARK MODE TOGGLE (Part 57)
   ============================== */
const darkToggle = document.getElementById('darkModeToggle');
if (darkToggle) {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    darkToggle.innerHTML = '<i class="fas fa-sun"></i>';
  }
  darkToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    darkToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
}

/* ==============================
   PWA INSTALL (Part 59)
   ============================== */
let deferredPrompt;
const pwaInstall = document.getElementById('pwaInstall');
const pwaBtn = document.getElementById('pwaInstallBtn');
const pwaDismiss = document.getElementById('pwaDismiss');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (pwaInstall) pwaInstall.style.display = 'block';
});

if (pwaBtn) {
  pwaBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === 'accepted') console.log('App installed');
      deferredPrompt = null;
      if (pwaInstall) pwaInstall.style.display = 'none';
    }
  });
}
if (pwaDismiss) {
  pwaDismiss.addEventListener('click', () => {
    if (pwaInstall) pwaInstall.style.display = 'none';
  });
}
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
