# 📋 Gill Heart Clinic — Product Requirements Document (PRD)

> **Project:** Gill Heart Clinic Digital Platform v1.0
> **Author:** Dr G S Gill / Development Team
> **Version:** 1.0
> **Date:** 2026-07-17
> **Status:** Draft — Active Development

---

## 1. Executive Summary

Gill Heart Clinic Digital Platform is a comprehensive healthcare website for Dr G S Gill's cardiology practice in Meerut. The platform serves as a digital front door for patients, providing clinic information, health education, appointment booking, and health tools — all while establishing Dr Gill as the trusted heart specialist in the Meerut region.

**Tagline:** *"Quality Heart Treatment for Every Patient"*
**Location:** Sugar Mill, Mohiuddinpur, Meerut — Near Metro Pillar No. 1375

---

## 2. Product Vision

To become the most trusted digital healthcare platform in Western UP, starting with Gill Heart Clinic — providing world-class cardiac care information, accessible health tools, and seamless patient-doctor connection, all in Hindi-English bilingual format.

---

## 3. Target Audience

| Segment | Description | Needs |
|---------|-------------|-------|
| **Primary** | Patients aged 35-70 in Meerut, Modinagar, Partapur | Heart disease info, appointment booking, clinic details |
| **Secondary** | Caregivers / family members | Emergency contact, health tools, second opinion |
| **Tertiary** | Other doctors / referrals | Credentials, professional profile, referral process |

---

## 4. Core Requirements

### 4.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | Display clinic info (timings, address, phone) | P0 (Critical) | ✅ |
| FR-02 | Doctor profile with qualifications | P0 (Critical) | ✅ |
| FR-03 | Services listing with descriptions | P0 (Critical) | ✅ |
| FR-04 | Appointment form → WhatsApp integration | P0 (Critical) | ✅ |
| FR-05 | Google Maps embed with directions | P0 (Critical) | ✅ |
| FR-06 | Statistics counters (experience, patients) | P1 (High) | ✅ |
| FR-07 | Patient testimonials slider | P1 (High) | ✅ |
| FR-08 | Contact section with phone, address, timings | P0 (Critical) | ✅ |
| FR-09 | Emergency banner with helpline | P1 (High) | ✅ |
| FR-10 | WhatsApp & Call floating buttons | P1 (High) | ✅ |
| FR-11 | BMI Calculator | P1 (High) | ⚪ |
| FR-12 | Heart Risk Calculator | P1 (High) | ⚪ |
| FR-13 | Blog / Articles system | P1 (High) | ⚪ |
| FR-14 | Google Reviews integration | P2 (Medium) | ⚪ |
| FR-15 | PWA (Install as app) | P2 (Medium) | ⚪ |
| FR-16 | Dark mode toggle | P3 (Low) | ⚪ |
| FR-17 | AI Chatbot | P2 (Medium) | ⚪ |
| FR-18 | Video gallery | P2 (Medium) | ⚪ |
| FR-19 | Image slider / gallery | P2 (Medium) | ⚪ |
| FR-20 | Multi-language (Hindi/English) | P3 (Low) | ⚪ |

### 4.2 Non-Functional Requirements

| ID | Requirement | Target | Status |
|----|-------------|--------|--------|
| NFR-01 | Page load time | < 3s | ✅ |
| NFR-02 | Mobile responsive | All screen sizes | ✅ |
| NFR-03 | Lighthouse Performance | 90+ | ⚪ |
| NFR-04 | Lighthouse Accessibility | 90+ | ⚪ |
| NFR-05 | Lighthouse SEO | 95+ | ⚪ |
| NFR-06 | Cross-browser support | Chrome, Firefox, Safari, Edge | ✅ |
| NFR-07 | Offline support | Basic fallback | ⚪ |
| NFR-08 | Security (no backend) | N/A (static site) | ✅ |

---

## 5. Technical Architecture

### 5.1 Stack

```
Frontend:      HTML5 + CSS3 + JavaScript (ES6)
CSS Framework: Bootstrap 5.3
Icons:         Font Awesome 6
Animations:    AOS 2.3 (Animate On Scroll)
Slider:        Swiper 11
Fonts:         Poppins + Playfair Display (Google Fonts)
Maps:          Google Maps Embed API
Analytics:    Google Analytics 4 (future)
Hosting:       GitHub Pages / Netlify / Vercel
```

### 5.2 File Structure

```
📦 Dr G S GILL WEBSITE/
 ┣ 📄 index.html         # Main HTML — all sections
 ┣ 📄 style.css          # All styles (modular sections)
 ┣ 📄 script.js          # All JavaScript
 ┣ 📄 MEMORY.md          # LEGO project tracker
 ┣ 📄 PRD.md             # This file — product requirements
 ┣ 📄 manifest.json      # PWA manifest (future)
 ┣ 📄 sw.js              # Service worker (future)
 ┣ 📄 sitemap.xml        # SEO sitemap (future)
 ┣ 📄 robots.txt         # Crawler directives (future)
 ┣ 📂 assets/
 ┃ ┣ 📂 images/          # All images
 ┃ ┣ 📂 icons/           # SVG icons
 ┃ ┗ 📂 docs/            # Certificates, brochures
 ┗ 📂 pages/             # Future sub-pages
   ┣ 📜 ecg.html
   ┣ 📜 echo.html
   ┣ 📜 bmi.html
   ┣ 📜 blog.html
   ┗ ...
```

### 5.3 CSS Architecture (Modular by Section)

```css
/* style.css is organized by LEGO parts */
/* Each section has its own clearly marked block */
/* CSS variables in :root for theming */

:root {
  --primary: #d90429;      /* Main brand red */
  --primary-dark: #b50020;  /* Darker variant */
  --secondary: #0b5ed7;     /* Blue accent */
  --success: #16a34a;       /* Green for success */
  --dark: #0f172a;          /* Dark text */
  --darker: #04111f;        /* Footer background */
  --light: #f0f7ff;         /* Light section bg */
}
```

---

## 6. User Stories

### 6.1 Patient Journey — New Patient

```
As a patient experiencing chest pain,
I want to find a heart specialist near me,
So that I can get treatment quickly.

→ Finds clinic on Google → Lands on website
→ Sees emergency banner → Calls immediately
→ OR reads doctor profile → Books appointment via form
→ Gets WhatsApp confirmation → Visits clinic
```

### 6.2 Patient Journey — Follow-up

```
As an existing patient of Dr Gill,
I want to check clinic timings and book a follow-up,
So that I don't have to wait.

→ Opens website → Checks timings (9AM-7PM)
→ Fills appointment form → Gets WhatsApp confirmation
→ Visits for follow-up
```

### 6.3 Health Conscious User

```
As a person concerned about heart health,
I want to use health tools and read articles,
So that I can prevent heart disease.

→ Visits website → Uses BMI / Heart Risk calculator
→ Reads blog articles → Learns about prevention
→ Books health checkup → Becomes patient
```

---

## 7. Key Metrics (KPIs)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Monthly Visitors | 5,000+ | Google Analytics |
| Appointment Bookings | 100+/month | WhatsApp tracking |
| Bounce Rate | < 40% | GA |
| Avg Session Duration | > 2 min | GA |
| PWA Installs | 500+ | beforeinstall event |
| Google Reviews | 50+ new | Google Business |

---

## 8. Competitive Analysis

| Feature | Gill HC | Local Clinic A | Local Clinic B | Apollo/Fortis |
|---------|---------|----------------|----------------|---------------|
| Mobile-friendly | ✅ | ❌ | ⚪ | ✅ |
| WhatsApp booking | ✅ | ❌ | ❌ | ⚪ |
| Health tools | ✅ | ❌ | ❌ | ✅ |
| AI Chatbot | ⚪ | ❌ | ❌ | ✅ |
| PWA App | ⚪ | ❌ | ❌ | ✅ |
| Testimonials | ✅ | ⚪ | ⚪ | ✅ |
| Google Reviews | ⚪ | ⚪ | ❌ | ✅ |
| Blog/Education | ⚪ | ❌ | ❌ | ✅ |

---

## 9. Development Roadmap

### Phase 1 — Foundation (Weeks 1-2) ✅ COMPLETE
- ✅ Project structure
- ✅ Navbar, Hero, Services, About, Contact
- ✅ Basic styling & responsiveness
- ✅ JavaScript animations

### Phase 2 — Core Features (Weeks 3-4) ✅ COMPLETE
- ✅ Statistics counters
- ✅ Testimonials slider
- ✅ Appointment form
- ✅ Doctor profile
- ✅ Emergency section
- ✅ Google Maps integration
- ✅ Premium footer

### Phase 3 — Health Tools (Weeks 5-6) ⏳ NEXT
- ⚪ BMI Calculator
- ⚪ Heart Risk Calculator
- ⚪ ASCVD Calculator
- ⚪ BSA Calculator
- ⚪ Ideal Weight Calculator

### Phase 4 — Content & Education (Weeks 7-8)
- ⚪ Blog system
- ⚪ Disease pages (ECG, Echo, TMT, BP, Diabetes)
- ⚪ Heart tips & diet plans
- ⚪ Video gallery

### Phase 5 — Premium & PWA (Weeks 9-10)
- ⚪ PWA manifest + service worker
- ⚪ Dark mode
- ⚪ Loading screen
- ⚪ Google Reviews API

### Phase 6 — AI & Future (Weeks 11-12)
- ⚪ AI Chatbot
- ⚪ Schema.org + SEO optimization
- ⚪ Lighthouse 95+
- ⚪ GHOS integration prep

---

## 10. Brand Guidelines

### Colors

```css
--primary:    #d90429   /* Heart red — primary CTA */
--secondary:  #0b5ed7   /* Trust blue — secondary CTAs */
--success:    #16a34a   /* Health green — WhatsApp, success */
--dark:       #0f172a   /* Text headings */
--darker:     #04111f   /* Footer */
--light:      #f0f7ff   /* Section backgrounds */
```

### Typography

- **Headings:** Playfair Display (700) — premium serif
- **Body:** Poppins (300-800) — modern sans-serif
- **Base size:** 16px
- **Scale:** 1.25 (major third)

### Tone

- Professional yet warm
- Simple Hindi-English mix for local audience
- Short sentences, bullet points, clear CTAs
- Emergency info should feel urgent but not panic-inducing

---

## 11. Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Images not available | High | Medium | Use placeholder gradients/illustrations |
| WhatsApp API changes | Low | High | Form saves locally + multiple notification methods |
| Google Maps API key | Low | Low | Use embed (free, no key needed) |
| Browser compatibility | Low | Medium | Bootstrap handles cross-browser |
| SEO competition | High | Medium | Focus on local long-tail keywords |

---

## 12. Glossary

| Term | Definition |
|------|------------|
| **LEGO Parts** | Independent modular features that combine to form the complete platform |
| **GHOS** | Gill Heart Operating System — future unified patient management system |
| **PWA** | Progressive Web App — installable as mobile app |
| **AOS** | Animate On Scroll — JavaScript library for scroll animations |
| **Swiper** | Modern touch slider library |
| **ASCVD** | Atherosclerotic Cardiovascular Disease risk calculator |

---

## 13. Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Project Owner | Dr G S Gill | — | — |
| Lead Developer | — | — | — |

---

> *"This document is a living document — updated as the project evolves."*
