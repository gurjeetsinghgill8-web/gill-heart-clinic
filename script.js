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
