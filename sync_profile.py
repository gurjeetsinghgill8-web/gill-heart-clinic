# Update index.html with all profile changes
with open('index.html', 'r', encoding='utf-8') as f:
    main = f.read()

changes = 0

# 1. About section
old = '<div class="section-header text-start">\n            <span class="section-tag">Know Your Doctor</span>\n            <h2 class="heading text-start">About Dr. Gurjeet Singh Gill (Dr. GS Gill)</h2>\n          </div>\n          <p class="about-desc">\n            <strong>Dr. G S Gill</strong> is an experienced Cardio-Physician dedicated to providing \n            <strong>ethical, affordable and evidence-based cardiac care</strong>. With over 15 years \n            of clinical experience, he has treated more than 50,000 patients across Meerut, Modinagar \n            and surrounding areas.\n          </p>'

new = '<div class="section-header" data-aos="fade-up">\n            <span class="section-tag">Know Your Doctor</span>\n            <h2 class="heading text-start">About Dr. Gurjeet Singh Gill (Dr. GS Gill)</h2>\n          </div>\n          <p class="about-desc">\n            <strong>Dr. Gurjeet Singh Gill (Dr. GS Gill)</strong> is a highly experienced Cardio-Physician with 12+ years of clinical expertise in non-invasive cardiology and critical care. He is currently bridging the gap between medicine and technology through an advanced certification in <strong>Artificial Intelligence in Healthcare from IIT Kanpur</strong>.\n          </p>\n          <p class="about-desc">\n            Dr. Gill holds his <strong>MBBS from Govt Medical College MPSMC</strong> (through All India PMT) and completed his <strong>Diploma in Cardiology at UN Mehta Institute of Cardiology, Ahmedabad, Gujarat</strong>, along with <strong>PGDCCP (NI)</strong>. He has a unique blend of deep clinical domain knowledge and practical skills in Generative AI, Prompt Engineering, and No-Code Development. He is passionate about developing patient-centric AI agents and automating clinical workflows.\n          </p>'

if old in main:
    main = main.replace(old, new)
    changes += 1
    print("✅ About section updated")
else:
    print("❌ About section NOT found")

# 2. Doctor list
old = '<h3 class="doctor-subtitle">Cardio-Physician | AI in Healthcare (IIT Kanpur)</h3>\n          <ul class="doctor-list">\n            <li><i class="fas fa-check-circle"></i> 15+ Years Experience</li>\n            <li><i class="fas fa-check-circle"></i> Heart Disease Management</li>\n            <li><i class="fas fa-check-circle"></i> High BP Specialist</li>\n            <li><i class="fas fa-check-circle"></i> Diabetes & Cholesterol Care</li>\n            <li><i class="fas fa-check-circle"></i> ECG | Echo | TMT</li>\n            <li><i class="fas fa-check-circle"></i> Affordable Heart Treatment</li>\n            <li><i class="fas fa-check-circle"></i> Charitable Clinic</li>\n          </ul>'

new = '<h3 class="doctor-subtitle">Cardio-Physician | AI in Healthcare (IIT Kanpur)</h3>\n          <ul class="doctor-list">\n            <li><i class="fas fa-check-circle"></i> 12+ Years Clinical Experience</li>\n            <li><i class="fas fa-check-circle"></i> MBBS \u2014 Govt Medical College MPSMC</li>\n            <li><i class="fas fa-check-circle"></i> Diploma Cardiology \u2014 UN Mehta Institute, Ahmedabad</li>\n            <li><i class="fas fa-check-circle"></i> PGDCCP (NI) \u2014 Clinical Cardiology</li>\n            <li><i class="fas fa-check-circle"></i> AI in Healthcare \u2014 IIT Kanpur</li>\n            <li><i class="fas fa-check-circle"></i> ECG | Echo | TMT | Non-Invasive Cardiology</li>\n            <li><i class="fas fa-check-circle"></i> Associate Consultant \u2014 Yashoda Superspeciality Hospital</li>\n            <li><i class="fas fa-check-circle"></i> Founder \u2014 Gill Heart Clinic & McGill Healthcare</li>\n          </ul>'

if old in main:
    main = main.replace(old, new)
    changes += 1
    print("✅ Doctor list updated")
else:
    print("❌ Doctor list NOT found")

# 3. Timeline
old = '<h3 class="awards-subtitle"><i class="fas fa-graduation-cap"></i> Qualifications</h3>\n          <div class="timeline">\n            <div class="timeline-item"><div class="timeline-dot"></div><div><strong>MBBS</strong><span>Bachelor of Medicine, Bachelor of Surgery</span></div></div>\n            <div class="timeline-item"><div class="timeline-dot"></div><div><strong>PGDCCCP (NI)</strong><span>Diploma in Clinical Cardiology & Critical Care</span></div></div>\n            <div class="timeline-item"><div class="timeline-dot"></div><div><strong>Senior Resident</strong><span>Major Govt Hospital, Delhi</span></div></div>\n            <div class="timeline-item"><div class="timeline-dot"></div><div><strong>Cardio-Physician</strong><span>Multi-specialty Hospital, Meerut</span></div></div>\n            <div class="timeline-item"><div class="timeline-dot"></div><div><strong>Founder \u2014 Gill Heart Clinic</strong><span>Serving since 2010+</span></div></div>\n          </div>'

new = '<h3 class="awards-subtitle"><i class="fas fa-graduation-cap"></i> Qualifications</h3>\n          <div class="timeline">\n            <div class="timeline-item"><div class="timeline-dot"></div><div><strong>MBBS</strong><span>Govt Medical College MPSMC \u2014 All India PMT</span></div></div>\n            <div class="timeline-item"><div class="timeline-dot"></div><div><strong>Diploma in Cardiology</strong><span>UN Mehta Institute of Cardiology, Ahmedabad, Gujarat</span></div></div>\n            <div class="timeline-item"><div class="timeline-dot"></div><div><strong>PGDCCP (NI)</strong><span>Post Graduate Diploma in Clinical Cardiology & Critical Care</span></div></div>\n            <div class="timeline-item"><div class="timeline-dot"></div><div><strong>AI in Healthcare</strong><span>Professional Certificate \u2014 IIT Kanpur (2026)</span></div></div>\n            <div class="timeline-item"><div class="timeline-dot"></div><div><strong>Associate Consultant, Cardiology</strong><span>Yashoda Superspeciality Hospital, Ghaziabad \u2014 Since 2015</span></div></div>\n            <div class="timeline-item"><div class="timeline-dot"></div><div><strong>Founder \u2014 Gill Heart Clinic</strong><span>Cardiac & Diabetic Care Center, Meerut \u2014 Since 2015</span></div></div>\n            <div class="timeline-item"><div class="timeline-dot"></div><div><strong>Founder \u2014 McGill Healthcare</strong><span>Healthcare Innovation Initiative</span></div></div>\n          </div>'

if old in main:
    main = main.replace(old, new)
    changes += 1
    print("✅ Timeline updated")
else:
    print("❌ Timeline NOT found")
    # Debug: find what's around that area
    idx = main.find('Qualifications')
    if idx > -1:
        print("Found at:", idx)
        print(repr(main[idx:idx+600]))

# 4. Awards section
old = '<h3 class="awards-subtitle"><i class="fas fa-award"></i> Awards & Recognition</h3>\n          <div class="awards-grid">\n            <div class="award-card"><i class="fas fa-graduation-cap"></i><h4>MBBS</h4><p>Bachelor of Medicine, Bachelor of Surgery</p></div>\n            <div class="award-card"><i class="fas fa-heartbeat"></i><h4>PGDCCCP (NI)</h4><p>Diploma in Clinical Cardiology & Critical Care</p></div>\n            <div class="award-card"><i class="fas fa-heart"></i><h4>Community Service</h4><p>Free Heart Checkup Camps \u2014 5000+ screened</p></div>\n            <div class="award-card"><i class="fas fa-trophy"></i><h4>Excellence in Cardiology</h4><p>Affordable Cardiac Care Initiative</p></div>\n          </div>'

new = '<h3 class="awards-subtitle"><i class="fas fa-award"></i> Professional Profile</h3>\n          <div class="awards-grid">\n            <div class="award-card"><i class="fas fa-university"></i><h4>MBBS</h4><p>Govt Medical College MPSMC \u2014 All India PMT</p></div>\n            <div class="award-card"><i class="fas fa-heartbeat"></i><h4>Diploma Cardiology</h4><p>UN Mehta Institute of Cardiology, Ahmedabad</p></div>\n            <div class="award-card"><i class="fas fa-certificate"></i><h4>PGDCCP (NI)</h4><p>Clinical Cardiology & Critical Care</p></div>\n            <div class="award-card"><i class="fas fa-robot"></i><h4>AI in Healthcare</h4><p>IIT Kanpur \u2014 Professional Certificate 2026</p></div>\n            <div class="award-card"><i class="fas fa-hospital"></i><h4>Associate Consultant</h4><p>Yashoda Superspeciality Hospital, Ghaziabad</p></div>\n            <div class="award-card"><i class="fas fa-heart"></i><h4>Community Service</h4><p>Low-Cost Evening OPD for Underserved Patients</p></div>\n          </div>'

if old in main:
    main = main.replace(old, new)
    changes += 1
    print("✅ Awards section updated")
else:
    print("❌ Awards section NOT found")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(main)

print(f"\n✅ Total: {changes} large block replacements done!")
