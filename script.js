/* ==========================================
   Gill Heart Clinic — Premium JavaScript
   Version 2.0
   Features: AOS, Swiper, Navbar, Counter,
   Typewriter, Back to Top, Ripple, Floating Hearts
   ========================================== */

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
