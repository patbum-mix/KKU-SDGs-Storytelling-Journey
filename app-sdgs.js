/* ══════════════════════════════════════════
   SDGs Storytelling Journey – KKU SDG Template
   app-sdgs.js — SDGs Version
   ══════════════════════════════════════════ */

// ── SDG Data ──
const sdgColors = {
  1:'#e5243b',2:'#dda63a',3:'#4c9f38',4:'#c5192d',5:'#ff3a21',6:'#26bde2',
  7:'#fcc30b',8:'#a21942',9:'#fd6925',10:'#dd1367',11:'#fd9d24',12:'#bf8b2e',
  13:'#3f7e44',14:'#0a97d9',15:'#56c02b',16:'#00689d',17:'#19486a'
};
const sdgNames = {
  1:'No Poverty',2:'Zero Hunger',3:'Good Health',4:'Quality Education',
  5:'Gender Equality',6:'Clean Water',7:'Clean Energy',8:'Decent Work',9:'Innovation',
  10:'Reduced Inequalities',11:'Sustainable Cities',12:'Responsible Consumption',
  13:'Climate Action',14:'Life Below Water',15:'Life on Land',16:'Peace & Justice',17:'Partnerships'
};

// ══════════════════════════════════════════════════════════
// ⚠️ ใส่ URL จาก Google Apps Script Web App ตรงนี้
// ══════════════════════════════════════════════════════════
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz3GW1VJu64Km4n9rypJGkpVUV67hJTUNVjgd6P4mC_xLfkzTocqQq1fVTcHf-sWgGz/exec';

let selectedSdgs = [];
let activityCounter = 0;
let editMode = false;
let editSdgId = null;

// ── LOGIN CHECK ──
const currentUser = JSON.parse(sessionStorage.getItem('sdg_user') || 'null');
if (!currentUser) {
  window.location.href = 'index.html';
}

// ── TOAST NOTIFICATION ──
function showToast(message, type = 'success') {
  // Remove existing toast
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span> ${message}`;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ── TOGGLE SECTION ──
function toggleSection(id) {
  const body = document.getElementById(id);
  const btn = document.getElementById('toggle-' + id);
  body.classList.toggle('open');
  btn.classList.toggle('open');
}

// ══════════════════════════════════════
// STORY LINKS & IMAGES (multi-field)
// ══════════════════════════════════════
function isImageUrl(url) {
  return /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i.test(url.trim());
}

// ── Split messy old data into separate URLs (by http / | / whitespace / newline) ──
function splitUrls(raw) {
  if (!raw) return [];
  var str = raw.toString().trim();
  if (!str) return [];
  // ถ้ามี | ให้แยกด้วย | ก่อน
  var parts;
  if (str.indexOf('|') !== -1) {
    parts = str.split('|');
  } else {
    // แยกโดยหาตำแหน่ง http (รองรับข้อมูลเก่าที่วางปนกัน)
    parts = str.split(/\s+/).join(' ').replace(/(https?:\/\/)/g, '\n$1').split('\n');
  }
  return parts.map(function(s){return s.trim();}).filter(function(s){return s.length>0;});
}

// ── STORY LINKS ──
function addStoryLink(value) {
  var list = document.getElementById('storyLinksList');
  var row = document.createElement('div');
  row.className = 'story-row';
  row.innerHTML =
    '<div class="story-input-wrap">' +
      '<input type="url" class="story-link-input" placeholder="https://ตัวอย่างข่าว.com/..." value="' + (value ? value.replace(/"/g,'&quot;') : '') + '">' +
    '</div>' +
    '<button type="button" class="story-remove-btn" onclick="this.closest(\'.story-row\').remove()" title="ลบลิงก์นี้">✕</button>';
  list.appendChild(row);
}

// ── STORY IMAGES (with validation + preview) ──
function addStoryImage(value) {
  var list = document.getElementById('storyImagesList');
  var row = document.createElement('div');
  row.className = 'story-row';
  row.innerHTML =
    '<div class="story-input-wrap">' +
      '<input type="url" class="story-img-input" placeholder="https://ตัวอย่างรูป.com/photo.jpg" oninput="checkStoryImage(this)">' +
      '<div class="img-status"></div>' +
      '<img class="img-thumb" alt="preview">' +
    '</div>' +
    '<button type="button" class="story-remove-btn" onclick="this.closest(\'.story-row\').remove()" title="ลบรูปนี้">✕</button>';
  list.appendChild(row);
  if (value) {
    var inp = row.querySelector('.story-img-input');
    inp.value = value;
    checkStoryImage(inp);
  }
}

function checkStoryImage(input) {
  var url = input.value.trim();
  var wrap = input.closest('.story-input-wrap');
  var status = wrap.querySelector('.img-status');
  var thumb = wrap.querySelector('.img-thumb');

  if (!url) {
    status.className = 'img-status';
    status.textContent = '';
    thumb.className = 'img-thumb';
    return;
  }

  if (!isImageUrl(url)) {
    status.className = 'img-status err';
    status.textContent = '⚠️ URL นี้ไม่ใช่ไฟล์รูปภาพ — ต้องลงท้ายด้วย .jpg .png .gif .webp';
    thumb.className = 'img-thumb';
    return;
  }

  // ลองโหลดรูปเพื่อตรวจว่าเปิดดูได้จริง
  status.className = 'img-status';
  status.textContent = '⏳ กำลังตรวจสอบรูป...';
  status.style.display = 'block';
  status.style.color = '#6b7c93';

  var testImg = new Image();
  testImg.onload = function() {
    status.className = 'img-status ok';
    status.textContent = '✅ รูปภาพใช้ได้ เปิดดูได้';
    thumb.src = url;
    thumb.className = 'img-thumb show';
  };
  testImg.onerror = function() {
    status.className = 'img-status err';
    status.textContent = '❌ เปิดรูปไม่ได้ — ลิงก์อาจเสียหรือไม่ใช่รูปภาพที่เข้าถึงได้';
    thumb.className = 'img-thumb';
  };
  testImg.src = url;
}

// ── เก็บค่าจากหลายช่อง → string คั่นด้วย | ──
function collectStoryLinks() {
  var inputs = document.querySelectorAll('.story-link-input');
  var arr = [];
  inputs.forEach(function(i){ if(i.value.trim()) arr.push(i.value.trim()); });
  return arr.join('|');
}
function collectStoryImages() {
  var inputs = document.querySelectorAll('.story-img-input');
  var arr = [];
  inputs.forEach(function(i){ if(i.value.trim()) arr.push(i.value.trim()); });
  return arr.join('|');
}

// ── ACTIVITIES ──
function addActivity() {
  activityCounter++;
  const phaseOptions = ['ก่อนเริ่มโครงการ (Pre-Project)','ปีที่ 1','ปีที่ 2','ปีที่ 3','ต่อยอดใหม่']
    .map(o => `<option>${o}</option>`).join('');
  const typeOptions = ['การเรียนการสอน','การวิจัย','การบริการวิชาการ','การฝึกงาน/Internship','การพัฒนาหลักสูตร','การแลกเปลี่ยนบุคลากร','โครงการชุมชน','กิจกรรมนักศึกษา','อื่นๆ']
    .map(o => `<option>${o}</option>`).join('');

  const li = document.createElement('li');
  li.className = 'activity-item';
  li.dataset.actId = activityCounter;
  li.innerHTML = `
    <div class="activity-dot"></div>
    <div class="activity-content">
      <div class="activity-fields">
        <div class="field-row" style="grid-template-columns:2fr 1fr 1fr">
          <div class="field-group" style="margin-bottom:10px">
            <label style="font-size:10px">ชื่อกิจกรรม<span class="req">*</span></label>
            <input type="text" placeholder="เช่น เปิดตัวโครงการ / อบรม AI Literacy / ติดตั้งอุปกรณ์" oninput="updateActivityPreview(); updateProgressSteps();">
          </div>
          <div class="field-group" style="margin-bottom:10px">
            <label style="font-size:10px">ระยะ</label>
            <select>${phaseOptions}</select>
          </div>
          <div class="field-group" style="margin-bottom:10px">
            <label style="font-size:10px">ปี (พ.ศ.)</label>
            <input type="text" placeholder="2568">
          </div>
        </div>
        <div class="field-group" style="margin-bottom:0">
          <label style="font-size:10px">ผู้เกี่ยวข้อง & ผลลัพธ์</label>
          <input type="text" placeholder="เช่น อาจารย์ 5 คน นักศึกษา 120 คน → ได้รับ Certificate" oninput="updateActivityPreview()">
        </div>
        <div style="margin-top:10px">
          <label style="font-size:10px">ประเภทกิจกรรม</label>
          <select>${typeOptions}</select>
        </div>
      </div>
    </div>
    <button class="remove-btn" onclick="removeActivity(this)" title="ลบกิจกรรมนี้">✕</button>
  `;
  document.getElementById('activitiesList').appendChild(li);
  renumberActivities();
  updateActivityPreview();
  updateProgressSteps();
}

function removeActivity(btn) {
  btn.closest('.activity-item').remove();
  renumberActivities();
  updateActivityPreview();
  updateProgressSteps();
}

function renumberActivities() {
  const items = document.querySelectorAll('#activitiesList .activity-item');
  items.forEach((item, index) => {
    item.querySelector('.activity-dot').textContent = index + 1;
  });
}

function updateActivityPreview() {
  const acts = document.querySelectorAll('#activitiesList .activity-item');
  if (acts.length > 0) {
    const firstInput = acts[0].querySelector('input[type="text"]');
    if (firstInput && firstInput.value) {
      document.getElementById('preAct').textContent = firstInput.value;
    } else {
      document.getElementById('preAct').textContent = 'กิจกรรม...';
    }
  } else {
    document.getElementById('preAct').textContent = 'กิจกรรม...';
  }
}

// ── SDG TOGGLE ──
function toggleSdg(n, btn) {
  const idx = selectedSdgs.indexOf(n);
  if (idx === -1) {
    selectedSdgs.push(n);
    btn.classList.add('selected');
  } else {
    selectedSdgs.splice(idx, 1);
    btn.classList.remove('selected');
  }
  updateSdgPreview();
  updateProgressSteps();
}

function updateSdgPreview() {
  const container = document.getElementById('previewSdgTags');
  if (selectedSdgs.length === 0) {
    container.innerHTML = '<span style="font-size:11px;color:rgba(255,255,255,0.4);">เลือก SDGs ด้านล่างเพื่อแสดงที่นี่</span>';
    return;
  }
  const sorted = [...selectedSdgs].sort((a, b) => a - b);
  container.innerHTML = sorted.map(n =>
    `<span class="sdg-display-tag" style="background:${sdgColors[n]};color:${n===7||n===11?'#333':'white'}">${n} ${sdgNames[n]}</span>`
  ).join('');
}

// ── LIVE PREVIEW UPDATE ──
function updatePreview() {
  const who = document.getElementById('kku_unit').value || 'คณะ / หน่วยงาน มข.';
  const partnerFields = ['partner_gov','partner_private','partner_edu','partner_intl','partner_ngo','partner_community'];
  const partners = partnerFields.map(id => document.getElementById(id).value).filter(v => v.trim());
  const withWho = partners.length > 0 ? partners.join(', ') : 'พันธมิตร';
  const result = document.getElementById('key_achievement').value || 'ผลที่เกิดขึ้น...';
  document.getElementById('preWho').textContent = who;
  document.getElementById('preWith').textContent = withWho;
  document.getElementById('preResult').textContent = result.length > 60 ? result.slice(0, 57) + '...' : result;
  updateProgressSteps();
}

// ── PROGRESS STEPS ──
function updateProgressSteps() {
  const steps = [
    {
      id: 'step1',
      sectionId: 'sec1',
      check: () => {
        return !!(
          document.getElementById('mou_title').value.trim() &&
          document.getElementById('kku_unit').value.trim()
        );
      }
    },
    {
      id: 'step2',
      sectionId: 'sec2',
      check: () => {
        const acts = document.querySelectorAll('#activitiesList .activity-item');
        if (acts.length === 0) return false;
        const firstInput = acts[0].querySelector('input[type="text"]');
        return !!(firstInput && firstInput.value.trim());
      }
    },
    {
      id: 'step3',
      sectionId: 'sec3',
      check: () => {
        return !!(document.getElementById('key_achievement').value.trim());
      }
    },
    {
      id: 'step4',
      sectionId: 'sec4',
      check: () => {
        return selectedSdgs.length > 0;
      }
    },
    {
      id: 'step5',
      sectionId: 'sec5',
      check: () => {
        return !!(
          document.getElementById('story_title').value.trim() &&
          document.getElementById('story_problem').value.trim()
        );
      }
    }
  ];

  let lastDone = -1;
  steps.forEach((step, index) => {
    const el = document.getElementById(step.id);
    el.classList.remove('active', 'done');
    if (step.check()) {
      el.classList.add('done');
      lastDone = index;
    }
  });

  // The "active" step is the first one that is NOT done
  const activeIndex = lastDone + 1;
  if (activeIndex < steps.length) {
    document.getElementById(steps[activeIndex].id).classList.add('active');
  }

  // Click to jump to section
  steps.forEach((step) => {
    const el = document.getElementById(step.id);
    el.onclick = () => {
      const section = document.getElementById(step.sectionId);
      const toggle = document.getElementById('toggle-' + step.sectionId);
      if (!section.classList.contains('open')) {
        section.classList.add('open');
        toggle.classList.add('open');
      }
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
  });
}

// ── VALIDATION ──
function validateForm() {
  let isValid = true;
  const requiredFields = [
    { id: 'mou_title', name: 'ชื่อโครงการ' },
    { id: 'kku_unit', name: 'คณะ/หน่วยงาน มข.' },
    { id: 'lead_person', name: 'ผู้รับผิดชอบโครงการ' },
    { id: 'mou_objective', name: 'วัตถุประสงค์หลัก' },
    { id: 'key_achievement', name: 'ผลลัพธ์สำคัญ' }
  ];

  // Clear previous errors
  document.querySelectorAll('.field-error').forEach(el => el.classList.remove('field-error'));

  const missingFields = [];

  requiredFields.forEach(field => {
    const el = document.getElementById(field.id);
    if (!el.value.trim()) {
      isValid = false;
      el.closest('.field-group').classList.add('field-error');
      missingFields.push(field.name);
    }
  });

  // Check at least 1 activity
  const acts = document.querySelectorAll('#activitiesList .activity-item');
  if (acts.length === 0) {
    isValid = false;
    missingFields.push('กิจกรรมอย่างน้อย 1 รายการ');
  } else {
    const firstInput = acts[0].querySelector('input[type="text"]');
    if (!firstInput || !firstInput.value.trim()) {
      isValid = false;
      missingFields.push('ชื่อกิจกรรมแรก');
    }
  }

  // Check at least 1 article link
  const linksGroup = document.getElementById('storyLinksGroup');
  const linkInputs = document.querySelectorAll('.story-link-input');
  let hasLink = false;
  linkInputs.forEach(i => { if (i.value.trim()) hasLink = true; });
  if (!hasLink) {
    isValid = false;
    if (linksGroup) linksGroup.classList.add('field-error');
    missingFields.push('ลิงก์บทความ/ข่าว อย่างน้อย 1 ลิงก์');
  } else {
    if (linksGroup) linksGroup.classList.remove('field-error');
  }

  if (!isValid) {
    showToast(`กรุณากรอกข้อมูลที่จำเป็น: ${missingFields.slice(0, 3).join(', ')}${missingFields.length > 3 ? ' และอื่นๆ' : ''}`, 'error');

    // Scroll to first error
    const firstError = document.querySelector('.field-error');
    if (firstError) {
      // Open parent section if collapsed
      const sectionBody = firstError.closest('.section-body');
      if (sectionBody && !sectionBody.classList.contains('open')) {
        const sectionId = sectionBody.id;
        sectionBody.classList.add('open');
        document.getElementById('toggle-' + sectionId).classList.add('open');
      }
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  return isValid;
}

// ── GENERATE OUTPUT (ALL FIELDS) ──
function generateOutput() {
  if (!validateForm()) return;

  // Basic info
  const title = document.getElementById('mou_title').value || '(ยังไม่ได้ระบุชื่อโครงการ)';
  const kku = document.getElementById('kku_unit').value || 'มหาวิทยาลัยขอนแก่น';
  const leadPerson = document.getElementById('lead_person').value;
  const partnerGov = document.getElementById('partner_gov').value;
  const partnerPrivate = document.getElementById('partner_private').value;
  const partnerEdu = document.getElementById('partner_edu').value;
  const partnerIntl = document.getElementById('partner_intl').value;
  const partnerNgo = document.getElementById('partner_ngo').value;
  const partnerCommunity = document.getElementById('partner_community').value;
  const allPartners = [partnerGov, partnerPrivate, partnerEdu, partnerIntl, partnerNgo, partnerCommunity].filter(v => v.trim());
  const partnerLevel = document.getElementById('partner_level').value;
  const mouDate = document.getElementById('mou_date').value;
  const mouDuration = document.getElementById('mou_duration').value;
  const mouObjective = document.getElementById('mou_objective').value;

  // Outcomes
  const achievement = document.getElementById('key_achievement').value;
  const spillover = document.getElementById('spillover').value;
  const quote = document.getElementById('quote_text').value;
  const quoteAttr = document.getElementById('quote_attr').value;

  // SDG explanation
  const sdgExplanation = document.getElementById('sdg_explanation').value;

  // Story
  const storyTitle = document.getElementById('story_title').value;
  const storyProblem = document.getElementById('story_problem').value;
  const storyAction = document.getElementById('story_action').value;
  const storyResult = document.getElementById('story_result').value;
  const storyLink = collectStoryLinks();
  const storyImg = collectStoryImages();

  // ── Render Title ──
  document.getElementById('op_title').textContent = title;
  document.getElementById('op_partners').innerHTML =
    `<strong>${kku}</strong> ${allPartners.length > 0 ? '× ' + allPartners.join(', ') : ''}`;

  // ── Year ──
  if (mouDate) {
    document.getElementById('op_year').textContent = parseInt(mouDate.split('-')[0]) + 543;
  }
  document.getElementById('op_date_footer').textContent = 'รายงาน ณ วันที่ ' +
    new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });

  // ── Info Grid (NEW: shows all basic fields) ──
  const infoGrid = document.getElementById('op_info_grid');
  let infoHTML = '';
  if (leadPerson) {
    infoHTML += `<div class="op-info-item"><div class="op-info-label">👤 ผู้รับผิดชอบ</div>${leadPerson}</div>`;
  }
  if (partnerLevel) {
    infoHTML += `<div class="op-info-item"><div class="op-info-label">🌏 ระดับความร่วมมือ</div>${partnerLevel}</div>`;
  }
  if (mouDate) {
    const d = new Date(mouDate);
    const thaiDate = d.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
    infoHTML += `<div class="op-info-item"><div class="op-info-label">📅 วันที่ลงนาม</div>${thaiDate}</div>`;
  }
  if (mouDuration) {
    infoHTML += `<div class="op-info-item"><div class="op-info-label">⏱️ ระยะเวลา</div>${mouDuration}</div>`;
  }
  if (infoHTML) {
    infoGrid.innerHTML = infoHTML;
    infoGrid.style.display = 'grid';
  } else {
    infoGrid.style.display = 'none';
  }

  // ── Objective (NEW) ──
  const objDiv = document.getElementById('op_objective');
  if (mouObjective) {
    objDiv.querySelector('.op-objective-text').textContent = mouObjective;
    objDiv.style.display = 'block';
  } else {
    objDiv.style.display = 'none';
  }

  // ── SDG bar ──
  const sdgBar = document.getElementById('op_sdg_bar');
  if (selectedSdgs.length > 0) {
    sdgBar.innerHTML = selectedSdgs.sort((a, b) => a - b).map(n =>
      `<span class="sdg-display-tag" style="background:${sdgColors[n]};color:${n===7||n===11?'#333':'white'}">${n} ${sdgNames[n]}</span>`
    ).join('');
  } else {
    sdgBar.innerHTML = '<span style="color:#b0bec5;font-size:12px;">ยังไม่ได้เลือก SDGs</span>';
  }

  // ── SDG Explanation (NEW) ──
  const sdgExpDiv = document.getElementById('op_sdg_explain');
  if (sdgExplanation) {
    sdgExpDiv.querySelector('.op-sdg-explain-text').textContent = sdgExplanation;
    sdgExpDiv.style.display = 'block';
  } else {
    sdgExpDiv.style.display = 'none';
  }

  // ── Timeline from activities ──
  const acts = document.querySelectorAll('#activitiesList .activity-item');
  const tl = document.getElementById('op_timeline');
  if (acts.length === 0) {
    tl.innerHTML = '<div style="color:#b0bec5;font-size:13px;">ยังไม่ได้ระบุกิจกรรม</div>';
  } else {
    tl.innerHTML = [...acts].map(li => {
      const inputs = li.querySelectorAll('input[type="text"]');
      const selects = li.querySelectorAll('select');
      const actName = inputs[0]?.value || '—';
      const phase = selects[0]?.value || '';
      const year = inputs[1]?.value || '';
      const desc = inputs[2]?.value || '';
      const type = selects[1]?.value || '';
      return `<div class="op-tl-item">
        <div class="op-tl-dot"></div>
        <div class="op-tl-phase">${phase} ${year ? '(' + year + ')' : ''} ${type ? '· ' + type : ''}</div>
        <div class="op-tl-act">${actName}</div>
        ${desc ? `<div class="op-tl-desc">${desc}</div>` : ''}
      </div>`;
    }).join('');
  }

  // ── Metrics ──
  const metrics = [
    { id: 'oc_beneficiary', icon: '👥', lbl: 'ผู้รับประโยชน์', unit: 'คน' },
    { id: 'oc_student', icon: '🎓', lbl: 'นักศึกษา', unit: 'คน' },
    { id: 'oc_research', icon: '🔬', lbl: 'งานวิจัย/นวัตกรรม', unit: 'ชิ้น' },
    { id: 'oc_value', icon: '💰', lbl: 'มูลค่าทางเศรษฐกิจ', unit: 'บาท' },
    { id: 'oc_env', icon: '🌿', lbl: 'ผลด้านสิ่งแวดล้อม', unit: '' },
    { id: 'oc_extend', icon: '🤝', lbl: 'โครงการต่อยอด', unit: 'โครงการ' },
  ].filter(m => document.getElementById(m.id)?.value);

  document.getElementById('op_metrics').innerHTML = metrics.length > 0
    ? metrics.map(m =>
      `<div class="op-metric"><div class="val">${document.getElementById(m.id).value}</div><div class="lbl">${m.icon} ${m.lbl} ${m.unit ? '(' + m.unit + ')' : ''}</div></div>`
    ).join('')
    : '<div style="color:#b0bec5;grid-column:1/-1;font-size:13px;text-align:center">ยังไม่ได้ระบุตัวเลขผลลัพธ์</div>';

  // ── Achievement ──
  const achieveDiv = document.getElementById('op_achievement');
  if (achievement) {
    achieveDiv.innerHTML = `
      <div style="font-size:11px;font-weight:700;color:#2980b9;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">🏆 Key Achievement</div>
      <div style="font-size:14px;color:#1e2d4a;line-height:1.6">${achievement}</div>`;
    achieveDiv.style.display = 'block';
  } else {
    achieveDiv.style.display = 'none';
  }

  // ── Spillover (NEW) ──
  const spillDiv = document.getElementById('op_spillover');
  if (spillover) {
    spillDiv.querySelector('.op-spillover-text').textContent = spillover;
    spillDiv.style.display = 'block';
  } else {
    spillDiv.style.display = 'none';
  }

  // ── Quote ──
  const quoteDiv = document.getElementById('op_quote');
  if (quote) {
    quoteDiv.innerHTML = `<div class="op-quote">"${quote}"<div class="op-quote-attr">— ${quoteAttr || 'ผู้กล่าว'}</div></div>`;
  } else {
    quoteDiv.innerHTML = '';
  }

  // ── Story block (with image GALLERY) ──
  const sb = document.getElementById('op_story_block');
  const imgUrls = storyImg ? storyImg.split('|').map(u => u.trim()).filter(u => u) : [];
  let galleryHTML = '';
  if (imgUrls.length > 0) {
    galleryHTML = '<div style="margin-top:14px;display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px;">' +
      imgUrls.map(u =>
        `<img src="${u}" alt="Story Image" style="width:100%;height:130px;object-fit:cover;border-radius:10px;border:1px solid #dde4f0;" onerror="this.style.display='none'">`
      ).join('') +
      '</div>';
  }
  if (storyTitle || storyProblem || storyAction || storyResult || galleryHTML) {
    sb.innerHTML = `
      <div style="font-size:11px;font-weight:700;color:var(--kku-gold);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">✨ Success Story</div>
      ${storyTitle ? `<div style="font-size:16px;font-weight:700;color:var(--kku-navy);margin-bottom:12px;">${storyTitle}</div>` : ''}
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;">
        ${storyProblem ? `<div><div style="font-size:10px;font-weight:700;color:#e74c3c;text-transform:uppercase;margin-bottom:4px;">❓ ปัญหา</div><div style="font-size:12px;line-height:1.5;color:#555">${storyProblem}</div></div>` : ''}
        ${storyAction ? `<div><div style="font-size:10px;font-weight:700;color:var(--kku-teal);text-transform:uppercase;margin-bottom:4px;">⚡ การดำเนินการ</div><div style="font-size:12px;line-height:1.5;color:#555">${storyAction}</div></div>` : ''}
        ${storyResult ? `<div><div style="font-size:10px;font-weight:700;color:#27ae60;text-transform:uppercase;margin-bottom:4px;">🎯 ผล</div><div style="font-size:12px;line-height:1.5;color:#555">${storyResult}</div></div>` : ''}
      </div>
      ${galleryHTML}`;
    sb.style.display = 'block';
  } else {
    sb.style.display = 'none';
  }

  // ── Links (multiple) ──
  const linksDiv = document.getElementById('op_links');
  const linkUrls = storyLink ? storyLink.split('|').map(u => u.trim()).filter(u => u) : [];
  let linksHTML = '';
  linkUrls.forEach((u, i) => {
    linksHTML += `<a href="${u}" target="_blank" class="op-link-item">📰 บทความ/ข่าว ${linkUrls.length > 1 ? (i+1) : ''}</a>`;
  });
  if (linksHTML) {
    linksDiv.innerHTML = linksHTML;
    linksDiv.style.display = 'flex';
  } else {
    linksDiv.style.display = 'none';
  }

  // Show panel
  const panel = document.getElementById('outputPreview');
  panel.classList.add('show');
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  showToast('สร้าง Story Card สำเร็จ!');
}

// ── COLLECT ALL DATA (for future Google Sheets integration) ──
function collectAllData() {
  const acts = document.querySelectorAll('#activitiesList .activity-item');
  const activities = [...acts].map((li, idx) => {
    const inputs = li.querySelectorAll('input[type="text"]');
    const selects = li.querySelectorAll('select');
    return {
      number: idx + 1,
      name: inputs[0]?.value || '',
      phase: selects[0]?.value || '',
      year: inputs[1]?.value || '',
      participants_result: inputs[2]?.value || '',
      type: selects[1]?.value || ''
    };
  });

  return {
    // Auth & Edit
    username: currentUser ? currentUser.username : '',
    action: editMode ? 'update' : 'save',
    sdg_id: editSdgId || '',

    // Section 1: Basic Info
    mou_title: document.getElementById('mou_title').value,
    kku_unit: document.getElementById('kku_unit').value,
    lead_person: document.getElementById('lead_person').value,
    partner_gov: document.getElementById('partner_gov').value,
    partner_private: document.getElementById('partner_private').value,
    partner_edu: document.getElementById('partner_edu').value,
    partner_intl: document.getElementById('partner_intl').value,
    partner_ngo: document.getElementById('partner_ngo').value,
    partner_community: document.getElementById('partner_community').value,
    partner_level: document.getElementById('partner_level').value,
    mou_date: document.getElementById('mou_date').value,
    mou_duration: document.getElementById('mou_duration').value,
    mou_objective: document.getElementById('mou_objective').value,

    // Section 2: Activities
    activities: activities,

    // Section 3: Outcomes
    oc_beneficiary: document.getElementById('oc_beneficiary').value,
    oc_student: document.getElementById('oc_student').value,
    oc_research: document.getElementById('oc_research').value,
    oc_value: document.getElementById('oc_value').value,
    oc_env: document.getElementById('oc_env').value,
    oc_extend: document.getElementById('oc_extend').value,
    key_achievement: document.getElementById('key_achievement').value,
    spillover: document.getElementById('spillover').value,
    quote_text: document.getElementById('quote_text').value,
    quote_attr: document.getElementById('quote_attr').value,

    // Section 4: SDGs
    selected_sdgs: [...selectedSdgs].sort((a, b) => a - b),
    sdg_explanation: document.getElementById('sdg_explanation').value,

    // Section 5: Success Story
    story_title: document.getElementById('story_title').value,
    story_problem: document.getElementById('story_problem').value,
    story_action: document.getElementById('story_action').value,
    story_result: document.getElementById('story_result').value,
    story_link: collectStoryLinks(),
    story_img: collectStoryImages(),

    // Metadata
    submitted_at: new Date().toISOString()
  };
}

// ── SAVE DATA → Google Sheets ──
async function saveData() {
  if (!validateForm()) return;

  // Check if URL is configured
  if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL === 'YOUR_SDGS_SCRIPT_URL_HERE') {
    showToast('❌ ยังไม่ได้ตั้งค่า Google Script URL ใน app.js', 'error');
    return;
  }

  const data = collectAllData();

  // Show loading
  const saveBtn = document.querySelector('.btn-save');
  const originalText = saveBtn.innerHTML;
  saveBtn.innerHTML = '⏳ กำลังบันทึก...';
  saveBtn.disabled = true;
  saveBtn.style.opacity = '0.6';

  try {
    // ใช้ Content-Type: text/plain → "simple request" (ไม่มี CORS preflight)
    // Google Apps Script จะ redirect 302 แล้วส่งกลับพร้อม CORS headers
    // ข้อมูล JSON อยู่ใน e.postData.contents ฝั่ง GAS
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(data),
      redirect: 'follow'
    });

    // อ่านผลลัพธ์จาก Apps Script
    const result = await response.json();

    if (result.status === 'success') {
      showToast('✅ ' + result.message, 'success');
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        if (confirm('ไปหน้า Dashboard?')) {
          window.location.href = 'dashboard.html';
        }
      }, 1500);
    } else {
      showToast('❌ ' + (result.message || 'เกิดข้อผิดพลาด'), 'error');
      console.error('Save response:', result);
    }

  } catch (error) {
    console.error('Save error:', error);
    showToast('❌ เกิดข้อผิดพลาด: ' + error.message, 'error');
  } finally {
    saveBtn.innerHTML = originalText;
    saveBtn.disabled = false;
    saveBtn.style.opacity = '1';
  }
}

// ── LOAD EXAMPLE ──
function loadExample() {
  document.getElementById('mou_title').value = 'โครงการพัฒนาระบบสุขภาพชุมชนอัจฉริยะ Smart Health Community อีสาน';
  document.getElementById('kku_unit').value = 'คณะแพทยศาสตร์ มหาวิทยาลัยขอนแก่น';
  document.getElementById('lead_person').value = 'ศ.ดร.นพ.สมศักดิ์ ตัวอย่าง (คณบดี)';
  document.getElementById('partner_gov').value = 'สำนักงานสาธารณสุขจังหวัดขอนแก่น';
  document.getElementById('partner_private').value = '';
  document.getElementById('partner_edu').value = '';
  document.getElementById('partner_intl').value = 'WHO ประจำประเทศไทย';
  document.getElementById('partner_ngo').value = '';
  document.getElementById('partner_community').value = 'อสม. เครือข่ายตำบลบ้านค้อ';
  document.getElementById('partner_level').value = 'ระดับภูมิภาค (อีสาน)';
  document.getElementById('mou_date').value = '2025-06-15';
  document.getElementById('mou_duration').value = '3 ปี';
  document.getElementById('mou_objective').value = 'เพื่อพัฒนาระบบสุขภาพชุมชนอัจฉริยะโดยใช้เทคโนโลยี AI และ Telemedicine เชื่อมต่อ รพ.สต. 50 แห่ง ลดความเหลื่อมล้ำด้านสุขภาพในพื้นที่ห่างไกล';

  // Clear & add activities
  document.getElementById('activitiesList').innerHTML = '';
  activityCounter = 0;

  addActivity();
  const item1 = document.querySelectorAll('#activitiesList .activity-item')[0];
  const inputs1 = item1.querySelectorAll('input[type="text"]');
  inputs1[0].value = 'สำรวจข้อมูลสุขภาพชุมชน 5 อำเภอ';
  inputs1[1].value = '2568';
  inputs1[2].value = 'นักศึกษาแพทย์ 30 คน + อสม. 200 คน → ฐานข้อมูลสุขภาพ';
  item1.querySelector('select').value = 'ปีที่ 1';

  addActivity();
  const item2 = document.querySelectorAll('#activitiesList .activity-item')[1];
  const inputs2 = item2.querySelectorAll('input[type="text"]');
  inputs2[0].value = 'ติดตั้งระบบ Telemedicine ใน รพ.สต. 50 แห่ง';
  inputs2[1].value = '2569';
  inputs2[2].value = 'วิศวกร IT 8 คน + บุคลากรสาธารณสุข 100 คน → ระบบออนไลน์';
  item2.querySelectorAll('select')[0].value = 'ปีที่ 2';

  addActivity();
  const item3 = document.querySelectorAll('#activitiesList .activity-item')[2];
  const inputs3 = item3.querySelectorAll('input[type="text"]');
  inputs3[0].value = 'เปิดคลินิก AI คัดกรองโรคเบาหวานและความดันโลหิต';
  inputs3[1].value = '2569';
  inputs3[2].value = 'ผู้ป่วย 5,000 คนได้รับการคัดกรอง → ลดค่าใช้จ่ายเดินทาง';
  item3.querySelectorAll('select')[0].value = 'ปีที่ 2';

  addActivity();
  const item4 = document.querySelectorAll('#activitiesList .activity-item')[3];
  const inputs4 = item4.querySelectorAll('input[type="text"]');
  inputs4[0].value = 'อบรม อสม.ดิจิทัล & หลักสูตร Health Tech';
  inputs4[1].value = '2570';
  inputs4[2].value = 'อสม. 500 คน + นักศึกษา 150 คน/ปี';
  item4.querySelectorAll('select')[0].value = 'ปีที่ 3';

  document.getElementById('oc_beneficiary').value = '30,000+';
  document.getElementById('oc_student').value = '150';
  document.getElementById('oc_research').value = '5';
  document.getElementById('oc_value').value = '45 ล้าน';
  document.getElementById('oc_env').value = 'ลดการเดินทางไป รพ. 60%';
  document.getElementById('oc_extend').value = '3';
  document.getElementById('key_achievement').value = 'ประชาชน 30,000 คนในพื้นที่ห่างไกลเข้าถึงบริการสุขภาพผ่าน Telemedicine ลดค่าเดินทาง 45 ล้านบาท/ปี และเป็นต้นแบบ Smart Health Community ระดับอาเซียน';
  document.getElementById('spillover').value = 'เกิดหลักสูตร "Digital Health" ใหม่, Startup ด้าน HealthTech 2 ราย, ขยายไปยังจังหวัดมหาสารคามและกาฬสินธุ์';
  document.getElementById('quote_text').value = 'ตอนนี้ไม่ต้องนั่งรถ 3 ชั่วโมงไปโรงพยาบาลจังหวัดแล้ว หมอตรวจให้ผ่านจอที่ รพ.สต. ได้เลย';
  document.getElementById('quote_attr').value = 'ป้าสมหมาย ชาวบ้านตำบลบ้านค้อ อ.เมือง จ.ขอนแก่น';

  document.getElementById('sdg_explanation').value = 'ระบบ Telemedicine ช่วยสร้างสุขภาพดีถ้วนหน้า (SDG 3) ลดความเหลื่อมล้ำในการเข้าถึงบริการ (SDG 10) สร้างนวัตกรรม HealthTech (SDG 9) และเป็นความร่วมมือข้ามหน่วยงาน (SDG 17)';

  document.getElementById('story_title').value = 'จาก รพ.สต. สู่ Smart Health: มข. สร้างต้นแบบสุขภาพชุมชนอัจฉริยะแห่งแรกในอีสาน';
  document.getElementById('story_problem').value = 'ชุมชนห่างไกลในภาคอีสานต้องเดินทาง 2-3 ชั่วโมงเพื่อพบแพทย์ ผู้สูงอายุและผู้ป่วยเรื้อรังขาดการติดตามอาการ ทำให้เกิดภาวะแทรกซ้อนและค่าใช้จ่ายสูง';
  document.getElementById('story_action').value = 'คณะแพทยศาสตร์ มข. ร่วมกับ สสจ. พัฒนาระบบ Telemedicine + AI คัดกรอง ติดตั้งใน รพ.สต. 50 แห่ง อบรม อสม. 500 คน สร้างหลักสูตร Health Tech';
  document.getElementById('story_result').value = 'ประชาชน 30,000 คนเข้าถึงบริการ ลดค่าเดินทาง 45 ล้านบาท/ปี คัดกรองเบาหวาน-ความดันเร็วขึ้น 70% นักศึกษา 150 คน/ปีเรียนรู้จริง มข.ติด Top 50 THE SDG 3';

  // story links & images (multi)
  document.getElementById('storyLinksList').innerHTML = '';
  document.getElementById('storyImagesList').innerHTML = '';
  addStoryLink('https://sdg.kku.ac.th/news/smart-health-community');
  addStoryLink('https://www.kku.ac.th/news/telemedicine');
  addStoryImage('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d.jpg');
  addStoryImage('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d.jpg');

  selectedSdgs = [];
  document.querySelectorAll('.sdg-pick-btn').forEach(b => b.classList.remove('selected'));
  [3, 9, 10, 17].forEach(n => {
    selectedSdgs.push(n);
    document.querySelector(`.sdg-${n}`).classList.add('selected');
  });

  updatePreview();
  updateSdgPreview();
  updateProgressSteps();

  ['sec1', 'sec2', 'sec3', 'sec4', 'sec5'].forEach(id => {
    document.getElementById(id).classList.add('open');
    document.getElementById('toggle-' + id).classList.add('open');
  });

  showToast('โหลดข้อมูลตัวอย่างสำเร็จ! เลื่อนดูข้อมูลแล้วกด "สร้าง Story Card"');
}

// ── CLEAR ──
function clearAll() {
  if (!confirm('ต้องการล้างข้อมูลทั้งหมด?')) return;
  document.querySelectorAll('input[type="text"],input[type="date"],input[type="url"],textarea,select').forEach(el => el.value = '');
  document.getElementById('activitiesList').innerHTML = '';
  activityCounter = 0;
  // reset story link/image rows to 1 empty each
  document.getElementById('storyLinksList').innerHTML = '';
  document.getElementById('storyImagesList').innerHTML = '';
  addStoryLink();
  addStoryImage();
  selectedSdgs = [];
  document.querySelectorAll('.sdg-pick-btn').forEach(b => b.classList.remove('selected'));
  document.querySelectorAll('.field-error').forEach(el => el.classList.remove('field-error'));
  document.getElementById('outputPreview').classList.remove('show');
  updatePreview();
  updateSdgPreview();
  updateProgressSteps();
  showToast('ล้างข้อมูลเรียบร้อย');
}

// ── LOAD PROJECT FOR EDITING ──
async function loadProjectForEdit(sdgId) {
  try {
    const url = GOOGLE_SCRIPT_URL + '?action=getProject&sdg_id=' + encodeURIComponent(sdgId);
    const res = await fetch(url);
    const result = await res.json();

    if (result.status !== 'success' || !result.project) {
      showToast('❌ โหลดโครงการไม่สำเร็จ', 'error');
      return;
    }

    const p = result.project;

    // Fill form fields
    document.getElementById('mou_title').value = p.mou_title || '';
    document.getElementById('kku_unit').value = p.kku_unit || '';
    document.getElementById('lead_person').value = p.lead_person || '';
    document.getElementById('partner_gov').value = p.partner_gov || '';
    document.getElementById('partner_private').value = p.partner_private || '';
    document.getElementById('partner_edu').value = p.partner_edu || '';
    document.getElementById('partner_intl').value = p.partner_intl || '';
    document.getElementById('partner_ngo').value = p.partner_ngo || '';
    document.getElementById('partner_community').value = p.partner_community || '';
    document.getElementById('partner_level').value = p.partner_level || '';
    document.getElementById('mou_date').value = p.mou_date || '';
    document.getElementById('mou_duration').value = p.mou_duration || '';
    document.getElementById('mou_objective').value = p.mou_objective || '';
    document.getElementById('oc_beneficiary').value = p.oc_beneficiary || '';
    document.getElementById('oc_student').value = p.oc_student || '';
    document.getElementById('oc_research').value = p.oc_research || '';
    document.getElementById('oc_value').value = p.oc_value || '';
    document.getElementById('oc_env').value = p.oc_env || '';
    document.getElementById('oc_extend').value = p.oc_extend || '';
    document.getElementById('key_achievement').value = p.key_achievement || '';
    document.getElementById('spillover').value = p.spillover || '';
    document.getElementById('quote_text').value = p.quote_text || '';
    document.getElementById('quote_attr').value = p.quote_attr || '';
    document.getElementById('sdg_explanation').value = p.sdg_explanation || '';
    document.getElementById('story_title').value = p.story_title || '';
    document.getElementById('story_problem').value = p.story_problem || '';
    document.getElementById('story_action').value = p.story_action || '';
    document.getElementById('story_result').value = p.story_result || '';
    // Story links & images — split back into multiple fields
    document.getElementById('storyLinksList').innerHTML = '';
    document.getElementById('storyImagesList').innerHTML = '';
    var linkArr = splitUrls(p.story_link);
    var imgArr = splitUrls(p.story_img);
    if (linkArr.length > 0) { linkArr.forEach(function(u){ addStoryLink(u); }); }
    else { addStoryLink(); }
    if (imgArr.length > 0) { imgArr.forEach(function(u){ addStoryImage(u); }); }
    else { addStoryImage(); }

    // SDGs
    selectedSdgs = [];
    document.querySelectorAll('.sdg-pick-btn').forEach(b => b.classList.remove('selected'));
    if (p.selected_sdgs && p.selected_sdgs.length > 0) {
      p.selected_sdgs.forEach(n => {
        selectedSdgs.push(n);
        const btn = document.querySelector('.sdg-' + n);
        if (btn) btn.classList.add('selected');
      });
    }

    // Activities
    document.getElementById('activitiesList').innerHTML = '';
    activityCounter = 0;
    if (p.activities && p.activities.length > 0) {
      p.activities.forEach(act => {
        addActivity();
        const items = document.querySelectorAll('#activitiesList .activity-item');
        const lastItem = items[items.length - 1];
        const inputs = lastItem.querySelectorAll('input[type="text"]');
        const selects = lastItem.querySelectorAll('select');
        if (inputs[0]) inputs[0].value = act.name || '';
        if (inputs[1]) inputs[1].value = act.year || '';
        if (inputs[2]) inputs[2].value = act.participants_result || '';
        if (selects[0]) selects[0].value = act.phase || '';
        if (selects[1]) selects[1].value = act.type || '';
      });
    } else {
      addActivity();
    }

    updatePreview();
    updateSdgPreview();
    updateProgressSteps();

    // Open all sections
    ['sec1','sec2','sec3','sec4','sec5'].forEach(id => {
      document.getElementById(id).classList.add('open');
      document.getElementById('toggle-' + id).classList.add('open');
    });

    showToast('📂 โหลดข้อมูลโครงการ ' + sdgId + ' สำเร็จ');

  } catch (error) {
    console.error('Load error:', error);
    showToast('❌ โหลดข้อมูลไม่สำเร็จ: ' + error.message, 'error');
  }
}

// ── INIT ──
window.onload = function () {
  // Check URL params for edit/view mode
  const params = new URLSearchParams(window.location.search);
  const editId = params.get('edit');
  const viewId = params.get('view');

  if (editId) {
    editMode = true;
    editSdgId = editId;
    // Change save button text
    const saveBtn = document.querySelector('.btn-save');
    if (saveBtn) saveBtn.innerHTML = '💾 บันทึกการแก้ไข';
    // Change header title to show edit mode
    const headerTitle = document.querySelector('.header-title');
    if (headerTitle) headerTitle.innerHTML = '✏️ แก้ไขโครงการ<br><span>' + editId + '</span>';
    // Load project data
    loadProjectForEdit(editId);
  } else if (viewId) {
    editMode = false;
    loadProjectForEdit(viewId).then(() => {
      setTimeout(() => generateOutput(), 1000);
    });
  } else {
    // Normal mode — add default activities
    addActivity();
    addActivity();
    // add 1 empty row each for links & images
    addStoryLink();
    addStoryImage();
  }

  // Open section 1 by default
  document.getElementById('sec1').classList.add('open');
  document.getElementById('toggle-sec1').classList.add('open');
  updateProgressSteps();
};
