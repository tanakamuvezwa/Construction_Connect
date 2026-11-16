/**
 * Construction Connect (Zimbo-Connect) - Main Application Controller
 * Handles Navigation, Rendering, Catalog, Cart, Checkout, Custom Designs,
 * and Formspree AJAX Integrations.
 */

// Global State
let currentCategory = 'All';
let currentSearch = '';
let activeAuthRole = 'admin'; // 'admin' (manufacturer) or 'retailer' (customer)
let activeAuthMode = 'signup'; // 'signup' or 'login'

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  initTicker();
  renderCategoryFilters();
  renderHomeProducts();
  renderTrustedManufacturers();
  renderManufacturersList();
  renderDesignsList();
  updateCartBadge();
  updateNavUserStatus();

  // Listen for hash changes if any
  window.addEventListener('hashchange', handleHash);
  if (window.location.hash) {
    handleHash();
  }
}

function handleHash() {
  const hash = window.location.hash.replace('#', '');
  if (['home', 'manufacturers', 'designs', 'admin', 'retailer'].includes(hash)) {
    showPage(hash);
  }
}

// ═══════════════════════════════════════════════════════════════
// NAVIGATION & PAGE ROUTING
// ═══════════════════════════════════════════════════════════════
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + pageId);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Update Nav Buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-page') === pageId);
  });

  // Toggle CTA banner visibility (hide on dashboards and auth)
  const cta = document.getElementById('ctaBanner');
  if (cta) {
    cta.style.display = ['admin', 'retailer', 'auth'].includes(pageId) ? 'none' : 'block';
  }

  // Dynamic Page Initializations
  if (pageId === 'admin') {
    renderAdminDashboard();
  } else if (pageId === 'retailer') {
    renderRetailerDashboard();
  } else if (pageId === 'manufacturers') {
    renderManufacturersList();
  } else if (pageId === 'designs') {
    renderDesignsList();
  }
}

function handleNavAdmin() {
  const user = ZimboData.getCurrentUser();
  if (user && user.role === 'manufacturer') {
    showPage('admin');
  } else {
    showAuth('admin', 'login');
  }
}

function handleNavRetailer() {
  const user = ZimboData.getCurrentUser();
  if (user && user.role === 'retailer') {
    showPage('retailer');
  } else {
    showAuth('retailer', 'login');
  }
}

function updateNavUserStatus() {
  const user = ZimboData.getCurrentUser();
  const regBtn = document.getElementById('regBtn');
  if (!regBtn) return;

  if (user) {
    regBtn.textContent = `👤 ${user.name.split(' ')[0]} (${user.role === 'manufacturer' ? 'Mfr' : 'Client'})`;
    regBtn.onclick = () => {
      if (user.role === 'manufacturer') showPage('admin');
      else showPage('retailer');
    };
  } else {
    regBtn.textContent = 'Register Company';
    regBtn.onclick = () => showAuth('admin', 'signup');
  }
}

// ═══════════════════════════════════════════════════════════════
// BANNER TICKER
// ═══════════════════════════════════════════════════════════════
function initTicker() {
  const track = document.getElementById('bannerTrack');
  if (!track) return;
  const items = [
    'Beta Bricks: 185,000 load-bearing common bricks ready for dispatch',
    'Turnall Holdings: SAZ certified Endurite fiber-cement roofing ex-factory',
    'Cafca Cables: 100% pure copper house wiring & armored cabling in stock',
    'Steelmakers Zimbabwe: Deformed high-tensile Y12 & Y16 rebar available',
    'Zimtile: 50-year warranty concrete double roman tiles in slate grey & terracotta',
    'Direct Factory Orders: Zero middleman markups across Zimbabwe',
    'EcoCash USD & Nostro Bank Transfer accepted'
  ];
  track.innerHTML = items.map(txt => `<span>${txt}</span>`).join('') + items.map(txt => `<span>${txt}</span>`).join('');
}

// ═══════════════════════════════════════════════════════════════
// CATALOG & PRODUCTS
// ═══════════════════════════════════════════════════════════════
const CATEGORIES = [
  'All',
  'Roofing & Pipes',
  'Bricks & Masonry',
  'Timber & Boards',
  'Electrical & Cabling',
  'Steel & Structural'
];

function renderCategoryFilters() {
  const container = document.getElementById('homeCatFilters');
  if (!container) return;
  container.innerHTML = CATEGORIES.map(cat => `
    <button class="cat-pill ${cat === currentCategory ? 'active' : ''}" onclick="filterCategory('${cat}')">
      ${cat}
    </button>
  `).join('');
}

function filterCategory(cat) {
  currentCategory = cat;
  renderCategoryFilters();
  renderHomeProducts();
}

function renderHomeProducts() {
  const grid = document.getElementById('homeProductGrid');
  if (!grid) return;

  const searchInput = document.getElementById('homeSearch');
  currentSearch = (searchInput ? searchInput.value : '').toLowerCase().trim();

  let products = ZimboData.getProducts();

  if (currentCategory !== 'All') {
    products = products.filter(p => p.category === currentCategory);
  }

  if (currentSearch) {
    products = products.filter(p =>
      p.name.toLowerCase().includes(currentSearch) ||
      p.mfrName.toLowerCase().includes(currentSearch) ||
      p.specs.toLowerCase().includes(currentSearch)
    );
  }

  if (products.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 48px; background: #fff; border-radius: 12px; border: 1px solid var(--border);">
        <div style="font-size: 40px; margin-bottom: 12px;">🔍</div>
        <h3>No matching products found</h3>
        <p style="color: var(--text-muted); margin-top: 6px;">Try adjusting your search terms or category filter.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = products.map(p => {
    const iconChar = getProductEmoji(p.category);
    return `
      <div class="product-card">
        <div class="product-thumb">
          <span class="product-badge-pill">${escapeHtml(p.badge || 'Verified Manufacturer')}</span>
          <div class="product-icon-art">${iconChar}</div>
        </div>
        <div class="product-body">
          <div class="product-mfr">${escapeHtml(p.mfrName)}</div>
          <h3 class="product-title">${escapeHtml(p.name)}</h3>
          <div class="product-specs">${escapeHtml(p.specs)}</div>
          <div class="product-price-row">
            <div>
              <div class="product-price">$${Number(p.price).toFixed(2)}</div>
              <span class="product-unit">${escapeHtml(p.unit)}</span>
            </div>
            <div class="product-moq">MOQ: ${p.moq}</div>
          </div>
          <div class="product-actions">
            <button class="btn btn-outline btn-sm" onclick="openOrderModal('${p.id}')">Request Quote</button>
            <button class="btn btn-primary btn-sm" onclick="quickAddToCart('${p.id}')">🛒 Add to Cart</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Update statistics
  const statProd = document.getElementById('statProd');
  if (statProd) statProd.textContent = ZimboData.getProducts().length;
  const statMfr = document.getElementById('statMfr');
  if (statMfr) statMfr.textContent = ZimboData.getManufacturers().length;
}

function getProductEmoji(category) {
  switch (category) {
    case 'Roofing & Pipes': return '🏠';
    case 'Bricks & Masonry': return '🧱';
    case 'Timber & Boards': return '🪵';
    case 'Electrical & Cabling': return '⚡';
    case 'Steel & Structural': return '🏗️';
    default: return '📦';
  }
}

// ═══════════════════════════════════════════════════════════════
// TRUSTED MANUFACTURERS & DIRECTORY
// ═══════════════════════════════════════════════════════════════
function renderTrustedManufacturers() {
  const grid = document.getElementById('trustedGrid');
  if (!grid) return;
  const list = ZimboData.getManufacturers();
  grid.innerHTML = list.map(m => `
    <div class="trusted-card" onclick="openMfrDetail('${m.id}')">
      <div class="trusted-logo-init">${m.logoText || 'ZC'}</div>
      <h4>${escapeHtml(m.name)}</h4>
      <span>${escapeHtml(m.category)}</span>
      <div style="font-size: 11px; color: var(--accent-green); margin-top: 6px; font-weight: 600;">
        ★ ${m.rating} (${m.reviewsCount} verified orders)
      </div>
    </div>
  `).join('');
}

function renderManufacturersList() {
  const grid = document.getElementById('mfrGrid');
  if (!grid) return;
  const list = ZimboData.getManufacturers();
  grid.innerHTML = list.map(m => {
    const certPills = (m.certifications || []).map(c => `<span class="mfr-pill">${escapeHtml(c)}</span>`).join('');
    return `
      <div class="mfr-card">
        <div class="mfr-header">
          <div class="mfr-logo-box">${m.logoText || 'ZC'}</div>
          <div class="mfr-title-box">
            <h3>${escapeHtml(m.name)}</h3>
            <div class="mfr-tagline">${escapeHtml(m.tagline || m.category)}</div>
          </div>
        </div>
        <div class="mfr-meta">
          <span>📍 ${escapeHtml(m.location)}</span>
          <span>•</span>
          <span class="mfr-rating">★ ${m.rating} (${m.reviewsCount})</span>
          <span>•</span>
          <span>Est. ${m.established || '1980'}</span>
        </div>
        <p class="mfr-desc">${escapeHtml(m.about)}</p>
        <div class="mfr-badges">
          <span class="mfr-pill verified">✓ SAZ / ZimTrade Verified</span>
          ${certPills}
        </div>
        <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 14px;">
          ⏱️ <strong>Lead Time:</strong> ${escapeHtml(m.leadTime || '2-4 business days')}<br>
          💳 <strong>Accepted:</strong> ${(m.paymentMethods || ['EcoCash', 'Bank Transfer']).slice(0, 3).join(', ')}
        </div>
        <div class="mfr-actions">
          <button class="btn btn-outline btn-sm" onclick="openMfrDetail('${m.id}')">View Full Profile</button>
          <button class="btn btn-primary btn-sm" onclick="openMfrInquiry('${m.id}')">Direct Factory Inquiry</button>
        </div>
      </div>
    `;
  }).join('');
}

function openMfrDetail(mfrId) {
  const m = ZimboData.getManufacturerById(mfrId);
  if (!m) return;
  const header = document.getElementById('mfrModalHeader');
  const body = document.getElementById('mfrModalBody');

  header.innerHTML = `
    <div style="display: flex; align-items: center; gap: 14px;">
      <div class="mfr-logo-box" style="width: 44px; height: 44px; font-size: 16px;">${m.logoText || 'ZC'}</div>
      <div>
        <h2 style="font-size: 20px; line-height: 1.2;">${escapeHtml(m.name)}</h2>
        <small style="color: var(--accent-green); font-weight: 600;">✓ Verified Zimbabwean Manufacturer</small>
      </div>
    </div>
    <button class="modal-close" onclick="closeModal('mfrModal')">✕</button>
  `;

  // Get products of this manufacturer
  const prods = ZimboData.getProducts().filter(p => p.mfrId === mfrId);
  const prodItems = prods.map(p => `
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #F8FAFC; border: 1px solid var(--border); border-radius: 8px; margin-bottom: 8px;">
      <div>
        <strong>${escapeHtml(p.name)}</strong>
        <div style="font-size: 12px; color: var(--text-muted);">${escapeHtml(p.specs)}</div>
      </div>
      <div style="text-align: right;">
        <div style="font-weight: 800; color: var(--primary); font-size: 16px;">$${Number(p.price).toFixed(2)}</div>
        <button class="btn btn-primary btn-sm" style="margin-top: 4px;" onclick="closeModal('mfrModal'); quickAddToCart('${p.id}')">🛒 Order</button>
      </div>
    </div>
  `).join('') || '<p style="color: var(--text-muted);">No products currently listed.</p>';

  body.innerHTML = `
    <div style="margin-bottom: 20px;">
      <h4 style="margin-bottom: 6px;">About Factory & Operations</h4>
      <p style="font-size: 14px; color: var(--text-main);">${escapeHtml(m.about)}</p>
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: #F1F5F9; padding: 14px; border-radius: 8px; margin-bottom: 20px; font-size: 13px;">
      <div>📍 <strong>Address:</strong> ${escapeHtml(m.address || m.location)}</div>
      <div>📞 <strong>Phone:</strong> ${escapeHtml(m.phone || 'Direct line')}</div>
      <div>✉️ <strong>Sales Desk:</strong> ${escapeHtml(m.email || 'sales@zimbo-connect.co.zw')}</div>
      <div>⏱️ <strong>Lead Time:</strong> ${escapeHtml(m.leadTime || 'Fast track')}</div>
    </div>
    <h4 style="margin-bottom: 12px;">Factory Product Lines (${prods.length})</h4>
    <div style="margin-bottom: 24px;">
      ${prodItems}
    </div>
    <div style="background: #FFFBEB; border: 1px solid #FDE68A; padding: 16px; border-radius: 8px;">
      <h4 style="color: #92400E; margin-bottom: 6px;">Send Inquiry Directly to Factory via Formspree</h4>
      <p style="font-size: 13px; color: #78350F; margin-bottom: 12px;">This message will be dispatched via Formspree endpoint and recorded in the system.</p>
      <button class="btn btn-primary btn-sm" onclick="closeModal('mfrModal'); openMfrInquiry('${m.id}')">Open Factory Inquiry Form</button>
    </div>
  `;

  openModal('mfrModal');
}

function openMfrInquiry(mfrId) {
  const m = ZimboData.getManufacturerById(mfrId);
  if (!m) return;
  const header = document.getElementById('orderModal').querySelector('.modal-header h2');
  const body = document.getElementById('orderModalBody');

  header.textContent = `Direct Factory Inquiry: ${m.name}`;
  body.innerHTML = `
    <!-- Formspree Vanilla JS (Ajax) Integration Container -->
    <div data-fs-success style="display:none;"></div>
    <div data-fs-error style="display:none;"></div>

    <form id="mfrInquiryForm" onsubmit="handleMfrInquirySubmit(event, '${m.id}')">
      <input type="hidden" name="targetManufacturer" value="${escapeHtml(m.name)}">
      <input type="hidden" name="manufacturerId" value="${m.id}">

      <div class="form-group">
        <label class="form-label" for="inq_name">Your Name / Company Name</label>
        <input type="text" id="inq_name" name="senderName" class="form-input" required data-fs-field placeholder="e.g. Tendai Chikwanha (Highlands Projects)">
        <span data-fs-error="senderName"></span>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="inq_email">Your Email Address</label>
          <input type="email" id="inq_email" name="email" class="form-input" required data-fs-field placeholder="name@company.co.zw">
          <span data-fs-error="email"></span>
        </div>
        <div class="form-group">
          <label class="form-label" for="inq_phone">Phone / WhatsApp Number</label>
          <input type="tel" id="inq_phone" name="phone" class="form-input" required data-fs-field placeholder="+263 77 ...">
          <span data-fs-error="phone"></span>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="inq_msg">Inquiry Details & Bill of Quantities</label>
        <textarea id="inq_msg" name="message" class="form-textarea" rows="4" required data-fs-field placeholder="State the quantities, delivery location, project timeline, or specific grades you require from ${escapeHtml(m.name)}..."></textarea>
        <span data-fs-error="message"></span>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
        <button type="button" class="btn btn-outline" onclick="closeModal('orderModal')">Cancel</button>
        <button type="submit" class="btn btn-primary" data-fs-submit-btn>Send Factory Inquiry</button>
      </div>
    </form>
  `;

  openModal('orderModal');
}

async function handleMfrInquirySubmit(e, mfrId) {
  e.preventDefault();
  const form = e.target;
  const result = await FormspreeService.submitForm(form, {
    formType: 'Manufacturer Direct Inquiry',
    mfrId: mfrId
  });

  if (result.success) {
    showToast('Inquiry successfully sent to manufacturer via Formspree!', 'success');
    setTimeout(() => closeModal('orderModal'), 2500);
  } else {
    showToast('Failed to send inquiry: ' + (result.error || 'Check details'), 'error');
  }
}

// ═══════════════════════════════════════════════════════════════
// CUSTOM DESIGNS
// ═══════════════════════════════════════════════════════════════
function renderDesignsList() {
  const list = ZimboData.getDesigns();
  const container = document.getElementById('designsList');
  if (!container) return;

  if (list.length === 0) {
    container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No custom design requests currently open.</p>`;
    return;
  }

  container.innerHTML = list.map(d => `
    <div class="ds-card">
      <span class="ds-tag">${escapeHtml(d.category)}</span>
      <h3 class="ds-title">${escapeHtml(d.title)}</h3>
      <div class="ds-info-grid">
        <div class="ds-info-item">
          <span>Client / Project</span>
          <strong>${escapeHtml(d.clientName)}</strong>
        </div>
        <div class="ds-info-item">
          <span>Budget Target</span>
          <strong>${escapeHtml(d.budget || 'Negotiable')}</strong>
        </div>
        <div class="ds-info-item">
          <span>Quantity</span>
          <strong>${escapeHtml(d.quantity || '1 unit')}</strong>
        </div>
        <div class="ds-info-item">
          <span>Delivery Site</span>
          <strong>${escapeHtml(d.location || 'Zimbabwe')}</strong>
        </div>
      </div>
      <p class="ds-desc">${escapeHtml(d.description)}</p>
      <div class="ds-bids-count">
        🔨 ${(d.bids || []).length} Manufacturer Bid${(d.bids || []).length === 1 ? '' : 's'} Submitted
      </div>
      <div style="display: flex; gap: 8px;">
        <button class="btn btn-outline btn-sm" onclick="viewDesignDetails('${d.id}')">View Details & Bids</button>
        <button class="btn btn-earth btn-sm" onclick="openPlaceBid('${d.id}')">Submit Manufacturer Bid</button>
      </div>
    </div>
  `).join('');
}

function openPostDesign() {
  const header = document.getElementById('dsTitle');
  const body = document.getElementById('dsBody');

  header.textContent = 'Post a Custom Construction Design / RFQ';
  body.innerHTML = `
    <div data-fs-success style="display:none;"></div>
    <div data-fs-error style="display:none;"></div>

    <form id="postDesignForm" onsubmit="handlePostDesignSubmit(event)">
      <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">
        Describe what you need manufactured. Zimbabwean fabricators and manufacturers will review and submit price bids.
        Your request will also be transmitted via Formspree (ID: <code>mljbjywj</code>).
      </p>

      <div class="form-group">
        <label class="form-label" for="ds_title">Project / Design Title</label>
        <input type="text" id="ds_title" name="designTitle" class="form-input" required data-fs-field placeholder="e.g. 50 Custom Galvanized Steel Roof Trusses 12m Span">
        <span data-fs-error="designTitle"></span>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="ds_client">Your Name / Organization</label>
          <input type="text" id="ds_client" name="clientName" class="form-input" required data-fs-field placeholder="e.g. Farai Sibanda (Bulawayo)">
          <span data-fs-error="clientName"></span>
        </div>
        <div class="form-group">
          <label class="form-label" for="ds_cat">Material / Category</label>
          <select id="ds_cat" name="category" class="form-select" required data-fs-field>
            <option value="Steel & Structural">Steel & Structural Fabrication</option>
            <option value="Timber & Boards">Timber & Trusses</option>
            <option value="Bricks & Masonry">Custom Precast / Bricks</option>
            <option value="Roofing & Pipes">Roofing & Architectural Drainage</option>
            <option value="Electrical & Cabling">Custom Distribution / Electrical</option>
          </select>
          <span data-fs-error="category"></span>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="ds_budget">Target Budget (USD)</label>
          <input type="text" id="ds_budget" name="budget" class="form-input" required data-fs-field placeholder="e.g. $3,500 - $5,000">
          <span data-fs-error="budget"></span>
        </div>
        <div class="form-group">
          <label class="form-label" for="ds_qty">Quantity & Units</label>
          <input type="text" id="ds_qty" name="quantity" class="form-input" required data-fs-field placeholder="e.g. 50 units or 1 complete assembly">
          <span data-fs-error="quantity"></span>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="ds_email">Contact Email</label>
          <input type="email" id="ds_email" name="email" class="form-input" required data-fs-field placeholder="your.name@gmail.com">
          <span data-fs-error="email"></span>
        </div>
        <div class="form-group">
          <label class="form-label" for="ds_loc">Site Location in Zimbabwe</label>
          <input type="text" id="ds_loc" name="location" class="form-input" required data-fs-field placeholder="e.g. Norton, Mashonaland West">
          <span data-fs-error="location"></span>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="ds_desc">Detailed Engineering Specifications & Needs</label>
        <textarea id="ds_desc" name="message" class="form-textarea" rows="4" required data-fs-field placeholder="Explain dimensions, finishes, CAD drawings status, required testing certificates, and delivery timeline..."></textarea>
        <span data-fs-error="message"></span>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
        <button type="button" class="btn btn-outline" onclick="closeModal('dsModal')">Cancel</button>
        <button type="submit" class="btn btn-primary" data-fs-submit-btn>Publish Request & Dispatch</button>
      </div>
    </form>
  `;

  openModal('dsModal');
}

async function handlePostDesignSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);

  const designObj = {
    title: formData.get('designTitle'),
    clientName: formData.get('clientName'),
    category: formData.get('category'),
    budget: formData.get('budget'),
    quantity: formData.get('quantity'),
    email: formData.get('email'),
    location: formData.get('location'),
    description: formData.get('message')
  };

  const result = await FormspreeService.submitForm(form, {
    formType: 'Custom Design RFQ',
    ...designObj
  });

  if (result.success) {
    // Add locally to the active designs list
    ZimboData.addDesign(designObj);
    renderDesignsList();
    showToast('Custom design published and sent to Formspree!', 'success');
    setTimeout(() => closeModal('dsModal'), 2500);
  } else {
    showToast('Submission error: ' + (result.error || 'Please check entries'), 'error');
  }
}

function viewDesignDetails(designId) {
  const d = ZimboData.getDesigns().find(i => i.id === designId);
  if (!d) return;

  const header = document.getElementById('dsTitle');
  const body = document.getElementById('dsBody');

  header.textContent = d.title;
  const bidsHtml = (d.bids || []).map(b => `
    <div style="background: #FFFFFF; border: 1px solid var(--border); border-radius: 8px; padding: 14px; margin-bottom: 10px;">
      <div style="display: flex; justify-content: space-between; align-items: baseline;">
        <strong style="color: var(--dark);">${escapeHtml(b.mfrName)}</strong>
        <span style="font-size: 16px; font-weight: 800; color: var(--accent-green);">$${Number(b.amount).toFixed(2)}</span>
      </div>
      <div style="font-size: 12px; color: var(--text-muted); margin: 4px 0;">Timeline: ${escapeHtml(b.timeline || 'Prompt')}</div>
      <p style="font-size: 13px; color: var(--text-main); margin-top: 6px;">${escapeHtml(b.notes)}</p>
    </div>
  `).join('') || '<p style="color: var(--text-muted);">No manufacturer bids submitted yet. Be the first to place a bid!</p>';

  body.innerHTML = `
    <div style="background: #F8FAFC; border: 1px solid var(--border); border-radius: 8px; padding: 16px; margin-bottom: 20px;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 13px;">
        <div><strong>Client:</strong> ${escapeHtml(d.clientName)}</div>
        <div><strong>Category:</strong> ${escapeHtml(d.category)}</div>
        <div><strong>Budget:</strong> ${escapeHtml(d.budget)}</div>
        <div><strong>Location:</strong> ${escapeHtml(d.location)}</div>
        <div><strong>Quantity:</strong> ${escapeHtml(d.quantity)}</div>
        <div><strong>Status:</strong> <span class="badge badge-gold">${escapeHtml(d.status)}</span></div>
      </div>
      <p style="margin-top: 14px; font-size: 14px; line-height: 1.5;">${escapeHtml(d.description)}</p>
    </div>

    <h4 style="margin-bottom: 12px;">Manufacturer Bids (${(d.bids || []).length})</h4>
    <div style="margin-bottom: 24px;">
      ${bidsHtml}
    </div>

    <button class="btn btn-primary" onclick="openPlaceBid('${d.id}')">Submit Manufacturer Bid for This Project</button>
  `;

  openModal('dsModal');
}

function openPlaceBid(designId) {
  const d = ZimboData.getDesigns().find(i => i.id === designId);
  if (!d) return;

  const mfrs = ZimboData.getManufacturers();
  const header = document.getElementById('dsTitle');
  const body = document.getElementById('dsBody');

  header.textContent = `Submit Bid: ${d.title}`;
  body.innerHTML = `
    <div data-fs-success style="display:none;"></div>
    <div data-fs-error style="display:none;"></div>

    <form id="bidForm" onsubmit="handlePlaceBidSubmit(event, '${d.id}')">
      <div class="form-group">
        <label class="form-label" for="bid_mfr">Select Your Manufacturing Company</label>
        <select id="bid_mfr" name="manufacturerName" class="form-select" required data-fs-field>
          ${mfrs.map(m => `<option value="${escapeHtml(m.name)}">${escapeHtml(m.name)} (${escapeHtml(m.location)})</option>`).join('')}
        </select>
        <span data-fs-error="manufacturerName"></span>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="bid_amount">Total Bid Amount ($ USD)</label>
          <input type="number" step="0.01" id="bid_amount" name="bidAmount" class="form-input" required data-fs-field placeholder="e.g. 4500">
          <span data-fs-error="bidAmount"></span>
        </div>
        <div class="form-group">
          <label class="form-label" for="bid_time">Production & Delivery Timeline</label>
          <input type="text" id="bid_time" name="timeline" class="form-input" required data-fs-field placeholder="e.g. 10 business days">
          <span data-fs-error="timeline"></span>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="bid_notes">Bid Notes & Technical Compliance</label>
        <textarea id="bid_notes" name="message" class="form-textarea" rows="3" required data-fs-field placeholder="Explain steel grades, testing certs, delivery vehicle availability..."></textarea>
        <span data-fs-error="message"></span>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
        <button type="button" class="btn btn-outline" onclick="closeModal('dsModal')">Cancel</button>
        <button type="submit" class="btn btn-earth" data-fs-submit-btn>Submit Binding Bid via Formspree</button>
      </div>
    </form>
  `;

  openModal('dsModal');
}

async function handlePlaceBidSubmit(e, designId) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);

  const bidData = {
    mfrName: formData.get('manufacturerName'),
    amount: parseFloat(formData.get('bidAmount')) || 0,
    timeline: formData.get('timeline'),
    notes: formData.get('message')
  };

  const result = await FormspreeService.submitForm(form, {
    formType: 'Manufacturer Design Bid',
    designId: designId,
    ...bidData
  });

  if (result.success) {
    ZimboData.addBidToDesign(designId, bidData);
    renderDesignsList();
    showToast('Bid registered and forwarded to project owner!', 'success');
    setTimeout(() => closeModal('dsModal'), 2000);
  } else {
    showToast('Failed to submit bid: ' + (result.error || 'Check fields'), 'error');
  }
}

// ═══════════════════════════════════════════════════════════════
// CART & DIRECT ORDERS
// ═══════════════════════════════════════════════════════════════
function quickAddToCart(productId) {
  const prod = ZimboData.getProductById(productId);
  if (!prod) return;
  ZimboData.addToCart(prod, prod.moq || 1);
  updateCartBadge();
  showToast(`Added ${prod.moq} ${prod.unit} of ${prod.name} to Cart`, 'success');
}

function updateCartBadge() {
  const badge = document.getElementById('cartCount');
  if (!badge) return;
  const cart = ZimboData.getCart();
  const totalItems = cart.reduce((acc, i) => acc + i.quantity, 0);
  if (totalItems > 0) {
    badge.textContent = totalItems;
    badge.style.display = 'inline-block';
  } else {
    badge.style.display = 'none';
  }
}

function openCartModal() {
  renderCart();
  openModal('cartModal');
}

function renderCart() {
  const cart = ZimboData.getCart();
  const body = document.getElementById('cartModalBody');
  const title = document.getElementById('cartModalTitle');

  title.textContent = `Your Wholesale Cart (${cart.length} Product${cart.length === 1 ? '' : 's'})`;

  if (cart.length === 0) {
    body.innerHTML = `
      <div style="text-align: center; padding: 36px 0;">
        <div style="font-size: 48px; margin-bottom: 12px;">🛒</div>
        <h3>Your wholesale cart is empty</h3>
        <p style="color: var(--text-muted); margin-top: 6px;">Browse Zimbabwean manufacturers to add direct factory building supplies.</p>
        <button class="btn btn-primary" style="margin-top: 18px;" onclick="closeModal('cartModal'); showPage('home')">Start Shopping</button>
      </div>
    `;
    return;
  }

  let grandTotal = 0;
  const itemsHtml = cart.map(item => {
    const subtotal = item.quantity * item.price;
    grandTotal += subtotal;
    return `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px; border-bottom: 1px solid var(--border); gap: 12px;">
        <div style="flex: 1;">
          <div style="font-size: 11px; font-weight: 700; color: var(--accent-green); text-transform: uppercase;">${escapeHtml(item.mfrName)}</div>
          <strong style="font-size: 14px; color: var(--dark);">${escapeHtml(item.name)}</strong>
          <div style="font-size: 12px; color: var(--text-muted);">$${Number(item.price).toFixed(2)} ${escapeHtml(item.unit)} (MOQ: ${item.moq})</div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <input type="number" min="${item.moq}" step="1" value="${item.quantity}" 
            onchange="handleCartQtyChange('${item.id}', this.value)"
            style="width: 70px; padding: 6px; border: 1px solid var(--border); border-radius: 4px; text-align: center; font-weight: 600;">
          <button onclick="handleCartRemove('${item.id}')" style="background: transparent; border: none; color: #DC2626; cursor: pointer; padding: 4px;" title="Remove">✕</button>
        </div>
        <div style="width: 90px; text-align: right; font-weight: 800; color: var(--primary);">
          $${subtotal.toFixed(2)}
        </div>
      </div>
    `;
  }).join('');

  body.innerHTML = `
    <div style="max-height: 260px; overflow-y: auto; margin-bottom: 16px;">
      ${itemsHtml}
    </div>

    <div style="background: #F8FAFC; border: 1px solid var(--border); border-radius: 8px; padding: 14px; margin-bottom: 20px;">
      <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 800;">
        <span>Estimated Wholesale Total:</span>
        <span style="color: var(--primary); font-size: 20px;">$${grandTotal.toFixed(2)} USD</span>
      </div>
      <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
        * Zero retail markup. Subject to factory confirmation and site delivery address.
      </div>
    </div>

    <div style="display: flex; justify-content: space-between; gap: 12px;">
      <button class="btn btn-outline btn-sm" onclick="ZimboData.clearCart(); renderCart(); updateCartBadge();">Clear Cart</button>
      <button class="btn btn-primary" onclick="proceedToCheckout(${grandTotal})">Proceed to Factory Checkout →</button>
    </div>
  `;
}

function handleCartQtyChange(productId, val) {
  const num = parseInt(val, 10);
  if (isNaN(num) || num <= 0) return;
  ZimboData.updateCartQty(productId, num);
  renderCart();
  updateCartBadge();
}

function handleCartRemove(productId) {
  ZimboData.removeFromCart(productId);
  renderCart();
  updateCartBadge();
}

function proceedToCheckout(grandTotal) {
  const body = document.getElementById('cartModalBody');
  const title = document.getElementById('cartModalTitle');
  const cart = ZimboData.getCart();

  title.textContent = 'Wholesale Checkout & Delivery Details';

  body.innerHTML = `
    <div data-fs-success style="display:none;"></div>
    <div data-fs-error style="display:none;"></div>

    <form id="checkoutForm" onsubmit="handleCheckoutSubmit(event, ${grandTotal})">
      <div class="alert alert-info">
        <strong>Total Amount Payable: $${grandTotal.toFixed(2)} USD</strong> (or equivalent in ZiG at prevailing interbank rate).
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="chk_name">Full Name / Purchasing Officer</label>
          <input type="text" id="chk_name" name="customerName" class="form-input" required data-fs-field placeholder="e.g. Nyasha Makoni">
          <span data-fs-error="customerName"></span>
        </div>
        <div class="form-group">
          <label class="form-label" for="chk_company">Company / Project Name</label>
          <input type="text" id="chk_company" name="company" class="form-input" required data-fs-field placeholder="e.g. Makoni Structural Civils">
          <span data-fs-error="company"></span>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="chk_phone">Phone Number (EcoCash Enabled)</label>
          <input type="tel" id="chk_phone" name="phone" class="form-input" required data-fs-field placeholder="+263 77 ...">
          <span data-fs-error="phone"></span>
        </div>
        <div class="form-group">
          <label class="form-label" for="chk_email">Email for Invoice & Manifest</label>
          <input type="email" id="chk_email" name="email" class="form-input" required data-fs-field placeholder="orders@company.co.zw">
          <span data-fs-error="email"></span>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="chk_addr">Site Delivery Address (Zimbabwe)</label>
        <input type="text" id="chk_addr" name="deliveryAddress" class="form-input" required data-fs-field placeholder="Stand number, Street, Suburb, Town/City">
        <span data-fs-error="deliveryAddress"></span>
      </div>

      <div class="form-group">
        <label class="form-label" for="chk_pay">Preferred Payment Method</label>
        <select id="chk_pay" name="paymentMethod" class="form-select" required data-fs-field>
          <option value="EcoCash USD Nostro">EcoCash USD (Direct B2B Merchant Push)</option>
          <option value="Direct Bank Transfer (USD Nostro TT)">Direct Bank Transfer (USD Nostro TT)</option>
          <option value="Bank Transfer (RTGS / ZiG Interbank)">Bank Transfer (RTGS / ZiG Interbank)</option>
          <option value="Credit Terms 30 Days (Existing Accounts)">Credit Terms 30 Days (Existing Pre-approved Accounts)</option>
          <option value="Cash on Factory Collection">Cash on Factory Collection</option>
        </select>
        <span data-fs-error="paymentMethod"></span>
      </div>

      <div class="form-group">
        <label class="form-label" for="chk_notes">Offloading / Site Instructions</label>
        <textarea id="chk_notes" name="message" class="form-textarea" rows="2" data-fs-field placeholder="Any gate restrictions, crane requirements or preferred delivery date..."></textarea>
        <span data-fs-error="message"></span>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
        <button type="button" class="btn btn-outline" onclick="renderCart()">← Back to Items</button>
        <button type="submit" class="btn btn-primary" data-fs-submit-btn>Confirm & Transmit Order via Formspree</button>
      </div>
    </form>
  `;
}

async function handleCheckoutSubmit(e, grandTotal) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const cart = ZimboData.getCart();

  const orderData = {
    customerName: formData.get('customerName'),
    company: formData.get('company'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    deliveryAddress: formData.get('deliveryAddress'),
    paymentMethod: formData.get('paymentMethod'),
    notes: formData.get('message'),
    items: cart,
    totalAmount: grandTotal
  };

  const result = await FormspreeService.submitForm(form, {
    formType: 'Marketplace Order Checkout',
    itemsSummary: cart.map(i => `${i.quantity}x ${i.name} ($${(i.quantity * i.price).toFixed(2)})`).join('; '),
    totalAmountUSD: `$${grandTotal.toFixed(2)}`
  });

  if (result.success) {
    // Record into local database
    const createdOrder = ZimboData.addOrder(orderData);
    ZimboData.clearCart();
    updateCartBadge();
    showToast(`Order #${createdOrder.id} successfully placed!`, 'success');
    setTimeout(() => {
      closeModal('cartModal');
      showPage('retailer');
    }, 2000);
  } else {
    showToast('Order transmission error: ' + (result.error || 'Please check entries'), 'error');
  }
}

function openOrderModal(productId) {
  const prod = ZimboData.getProductById(productId);
  if (!prod) return;
  const header = document.getElementById('orderModal').querySelector('.modal-header h2');
  const body = document.getElementById('orderModalBody');

  header.textContent = `Wholesale RFQ: ${prod.name}`;
  body.innerHTML = `
    <div data-fs-success style="display:none;"></div>
    <div data-fs-error style="display:none;"></div>

    <form id="productRfqForm" onsubmit="handleProductRfqSubmit(event, '${prod.id}')">
      <div style="background: #F8FAFC; border: 1px solid var(--border); border-radius: 8px; padding: 12px; margin-bottom: 16px; font-size: 13px;">
        <strong>Manufacturer:</strong> ${escapeHtml(prod.mfrName)}<br>
        <strong>Unit Price:</strong> $${Number(prod.price).toFixed(2)} ${escapeHtml(prod.unit)}<br>
        <strong>Minimum Order Quantity (MOQ):</strong> ${prod.moq} units
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="rfq_qty">Order Quantity</label>
          <input type="number" id="rfq_qty" name="quantity" class="form-input" min="${prod.moq}" value="${prod.moq}" required data-fs-field>
          <span data-fs-error="quantity"></span>
        </div>
        <div class="form-group">
          <label class="form-label" for="rfq_phone">Contact Phone / WhatsApp</label>
          <input type="tel" id="rfq_phone" name="phone" class="form-input" required data-fs-field placeholder="+263 77 ...">
          <span data-fs-error="phone"></span>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="rfq_email">Email Address</label>
        <input type="email" id="rfq_email" name="email" class="form-input" required data-fs-field placeholder="purchasing@company.co.zw">
        <span data-fs-error="email"></span>
      </div>

      <div class="form-group">
        <label class="form-label" for="rfq_loc">Delivery Destination</label>
        <input type="text" id="rfq_loc" name="location" class="form-input" required data-fs-field placeholder="e.g. Southerton Site, Harare">
        <span data-fs-error="location"></span>
      </div>

      <div class="form-group">
        <label class="form-label" for="rfq_notes">Special Requests / Date Needed</label>
        <textarea id="rfq_notes" name="message" class="form-textarea" rows="2" data-fs-field placeholder="Specify preferred delivery schedule, certificate requirements, etc."></textarea>
        <span data-fs-error="message"></span>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
        <button type="button" class="btn btn-outline" onclick="closeModal('orderModal')">Cancel</button>
        <button type="submit" class="btn btn-primary" data-fs-submit-btn>Send RFQ to Factory</button>
      </div>
    </form>
  `;

  openModal('orderModal');
}

async function handleProductRfqSubmit(e, productId) {
  e.preventDefault();
  const form = e.target;
  const prod = ZimboData.getProductById(productId);

  const result = await FormspreeService.submitForm(form, {
    formType: 'Product Direct RFQ',
    productId: productId,
    productName: prod ? prod.name : 'Unknown Product',
    manufacturer: prod ? prod.mfrName : 'Unknown'
  });

  if (result.success) {
    showToast('Quote request dispatched to manufacturer via Formspree!', 'success');
    setTimeout(() => closeModal('orderModal'), 2500);
  } else {
    showToast('Failed to send quote request: ' + (result.error || 'Please review entries'), 'error');
  }
}

// ═══════════════════════════════════════════════════════════════
// AUTHENTICATION & REGISTRATION
// ═══════════════════════════════════════════════════════════════
function showAuth(role = 'admin', mode = 'signup') {
  activeAuthRole = role;
  activeAuthMode = mode;
  showPage('auth');
  renderAuthCard();
}

function renderAuthCard() {
  const card = document.getElementById('authCard');
  if (!card) return;

  const isMfr = activeAuthRole === 'admin';
  const isSignup = activeAuthMode === 'signup';

  card.innerHTML = `
    <div class="auth-header">
      <h2>${isMfr ? 'Manufacturer Portal' : 'Customer & Buyer Portal'}</h2>
      <p>${isSignup ? (isMfr ? 'Register your manufacturing company to list products' : 'Create an account to procure wholesale supplies') : 'Sign in to access your portal'}</p>
    </div>

    <div class="auth-tabs">
      <div class="auth-tab ${isMfr ? 'active' : ''}" onclick="switchAuthRole('admin')">🏭 Manufacturer</div>
      <div class="auth-tab ${!isMfr ? 'active' : ''}" onclick="switchAuthRole('retailer')">🛒 Customer / Buyer</div>
    </div>

    <div style="display: flex; gap: 10px; margin-bottom: 20px;">
      <button class="btn btn-sm ${isSignup ? 'btn-primary' : 'btn-outline'}" style="flex:1;" onclick="switchAuthMode('signup')">Sign Up</button>
      <button class="btn btn-sm ${!isSignup ? 'btn-primary' : 'btn-outline'}" style="flex:1;" onclick="switchAuthMode('login')">Sign In</button>
    </div>

    <div data-fs-success style="display:none;"></div>
    <div data-fs-error style="display:none;"></div>

    <form id="authForm" onsubmit="handleAuthSubmit(event)">
      <input type="hidden" name="userRole" value="${isMfr ? 'manufacturer' : 'retailer'}">
      <input type="hidden" name="actionType" value="${isSignup ? 'signup' : 'login'}">

      ${isSignup ? `
        <div class="form-group">
          <label class="form-label" for="auth_name">${isMfr ? 'Manufacturing Company Name' : 'Company or Full Name'}</label>
          <input type="text" id="auth_name" name="companyName" class="form-input" required data-fs-field placeholder="${isMfr ? 'e.g. Zimbabwe Brick & Clay Ltd' : 'e.g. Masvingo Hardware Supplies'}">
          <span data-fs-error="companyName"></span>
        </div>
      ` : ''}

      <div class="form-group">
        <label class="form-label" for="auth_email">Official Email Address</label>
        <input type="email" id="auth_email" name="email" class="form-input" required data-fs-field placeholder="name@company.co.zw">
        <span data-fs-error="email"></span>
      </div>

      <div class="form-group">
        <label class="form-label" for="auth_pass">Password</label>
        <input type="password" id="auth_pass" name="password" class="form-input" required data-fs-field placeholder="••••••••">
        <span data-fs-error="password"></span>
      </div>

      ${isSignup && isMfr ? `
        <div class="form-group">
          <label class="form-label" for="auth_cat">Primary Manufacturing Sector</label>
          <select id="auth_cat" name="category" class="form-select" data-fs-field>
            <option value="Bricks & Masonry">Bricks, Clay & Masonry</option>
            <option value="Roofing & Pipes">Roofing, Tiles & Pipes</option>
            <option value="Timber & Boards">Timber, Boards & Trusses</option>
            <option value="Steel & Structural">Steel, Rebar & Metalwork</option>
            <option value="Electrical & Cabling">Electrical Cables & Gear</option>
          </select>
          <span data-fs-error="category"></span>
        </div>
        <div class="form-group">
          <label class="form-label" for="auth_loc">Factory Location (City / Industrial Area)</label>
          <input type="text" id="auth_loc" name="location" class="form-input" required data-fs-field placeholder="e.g. Southerton, Harare or Belmont, Bulawayo">
          <span data-fs-error="location"></span>
        </div>
      ` : ''}

      <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 14px;" data-fs-submit-btn>
        ${isSignup ? 'Complete Registration via Formspree' : 'Access Portal'}
      </button>

      <div style="text-align: center; margin-top: 16px; font-size: 13px; color: var(--text-muted);">
        Looking for the Platform Super Admin? <a href="/admin" style="color: var(--primary); font-weight: 700;">Open Master Admin Panel →</a>
      </div>
    </form>
  `;
}

function switchAuthRole(role) {
  activeAuthRole = role;
  renderAuthCard();
}

function switchAuthMode(mode) {
  activeAuthMode = mode;
  renderAuthCard();
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const isMfr = activeAuthRole === 'admin';
  const isSignup = activeAuthMode === 'signup';

  if (isSignup) {
    // Send registration details to Formspree endpoint mljbjywj!
    const result = await FormspreeService.submitForm(form, {
      formType: isMfr ? 'Manufacturer Registration' : 'Retailer Registration',
      role: isMfr ? 'manufacturer' : 'retailer'
    });

    if (result.success || true) {
      // Create user session and optionally mock manufacturer
      const userName = formData.get('companyName') || formData.get('email').split('@')[0];
      const user = {
        name: userName,
        email: formData.get('email'),
        role: isMfr ? 'manufacturer' : 'retailer',
        loggedIn: true
      };
      ZimboData.setCurrentUser(user);

      if (isMfr) {
        ZimboData.addManufacturer({
          name: userName,
          tagline: 'Custom Zimbabwean Manufacturing',
          category: formData.get('category') || 'Bricks & Masonry',
          location: formData.get('location') || 'Harare',
          email: formData.get('email'),
          verified: false,
          about: 'Newly registered manufacturer on Construction Connect.'
        });
      }

      showToast('Registration successful! Welcome to Construction Connect.', 'success');
      updateNavUserStatus();
      setTimeout(() => {
        if (isMfr) showPage('admin');
        else showPage('retailer');
      }, 1500);
    }
  } else {
    // Login flow
    const email = formData.get('email');
    const user = {
      name: email.split('@')[0],
      email: email,
      role: isMfr ? 'manufacturer' : 'retailer',
      loggedIn: true
    };
    ZimboData.setCurrentUser(user);
    showToast(`Signed in successfully as ${user.name}!`, 'success');
    updateNavUserStatus();
    if (isMfr) showPage('admin');
    else showPage('retailer');
  }
}

// ═══════════════════════════════════════════════════════════════
// MANUFACTURER DASHBOARD VIEW (IN-PAGE)
// ═══════════════════════════════════════════════════════════════
function renderAdminDashboard() {
  const content = document.getElementById('adminContent');
  if (!content) return;

  const prods = ZimboData.getProducts();
  const orders = ZimboData.getOrders();
  const designs = ZimboData.getDesigns();
  const submissions = ZimboData.getSubmissions();

  content.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <div>
        <h2 style="font-family: var(--font-serif); font-size: 26px;">Manufacturer Dashboard</h2>
        <p style="color: var(--text-muted); font-size: 14px;">Manage your Zimbabwean manufacturing catalog, orders and factory profile.</p>
      </div>
      <div style="display: flex; gap: 8px;">
        <a href="/admin" class="btn btn-earth btn-sm">Platform Super Admin ↗</a>
        <button class="btn btn-outline btn-sm" onclick="handleLogout()">Sign Out</button>
      </div>
    </div>

    <!-- Quick Stats -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 28px;">
      <div style="background: #fff; padding: 18px; border-radius: 8px; border: 1px solid var(--border);">
        <span style="font-size: 12px; color: var(--text-muted); text-transform: uppercase;">Active Products</span>
        <div style="font-size: 26px; font-weight: 800; color: var(--primary);">${prods.length}</div>
      </div>
      <div style="background: #fff; padding: 18px; border-radius: 8px; border: 1px solid var(--border);">
        <span style="font-size: 12px; color: var(--text-muted); text-transform: uppercase;">Pending Orders</span>
        <div style="font-size: 26px; font-weight: 800; color: var(--accent-green);">${orders.length}</div>
      </div>
      <div style="background: #fff; padding: 18px; border-radius: 8px; border: 1px solid var(--border);">
        <span style="font-size: 12px; color: var(--text-muted); text-transform: uppercase;">Formspree Inquiries</span>
        <div style="font-size: 26px; font-weight: 800; color: #3B82F6;">${submissions.length}</div>
      </div>
      <div style="background: #fff; padding: 18px; border-radius: 8px; border: 1px solid var(--border);">
        <span style="font-size: 12px; color: var(--text-muted); text-transform: uppercase;">Open RFQ Bids</span>
        <div style="font-size: 26px; font-weight: 800; color: #F59E0B;">${designs.length}</div>
      </div>
    </div>

    <!-- Products Management -->
    <div style="background: #fff; border: 1px solid var(--border); border-radius: 8px; padding: 24px; margin-bottom: 28px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 style="font-size: 18px;">Product Catalog (${prods.length})</h3>
        <button class="btn btn-primary btn-sm" onclick="openAddProductModal()">+ Add New Product</button>
      </div>
      <div class="table-responsive">
        <table class="table" style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <thead>
            <tr style="border-bottom: 2px solid var(--border); text-align: left;">
              <th style="padding: 10px;">Product Name</th>
              <th style="padding: 10px;">Category</th>
              <th style="padding: 10px;">Wholesale Price</th>
              <th style="padding: 10px;">MOQ</th>
              <th style="padding: 10px;">Manufacturer</th>
              <th style="padding: 10px; text-align: right;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${prods.map(p => `
              <tr style="border-bottom: 1px solid var(--border);">
                <td style="padding: 12px 10px; font-weight: 600;">${escapeHtml(p.name)}</td>
                <td style="padding: 12px 10px; color: var(--text-muted);">${escapeHtml(p.category)}</td>
                <td style="padding: 12px 10px; font-weight: 700; color: var(--primary);">$${Number(p.price).toFixed(2)}</td>
                <td style="padding: 12px 10px;">${p.moq}</td>
                <td style="padding: 12px 10px; font-size: 12px;">${escapeHtml(p.mfrName)}</td>
                <td style="padding: 12px 10px; text-align: right;">
                  <button class="btn btn-outline btn-sm" onclick="handleDeleteProduct('${p.id}')" style="color: #DC2626;">Delete</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Recent Orders -->
    <div style="background: #fff; border: 1px solid var(--border); border-radius: 8px; padding: 24px;">
      <h3 style="font-size: 18px; margin-bottom: 16px;">Recent Orders</h3>
      <div class="table-responsive">
        <table class="table" style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <thead>
            <tr style="border-bottom: 2px solid var(--border); text-align: left;">
              <th style="padding: 10px;">Order #</th>
              <th style="padding: 10px;">Customer / Company</th>
              <th style="padding: 10px;">Total</th>
              <th style="padding: 10px;">Payment Method</th>
              <th style="padding: 10px;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${orders.map(o => `
              <tr style="border-bottom: 1px solid var(--border);">
                <td style="padding: 12px 10px; font-weight: 700;">${escapeHtml(o.id)}</td>
                <td style="padding: 12px 10px;">${escapeHtml(o.customerName)} (${escapeHtml(o.company || 'Direct')})</td>
                <td style="padding: 12px 10px; font-weight: 800; color: var(--primary);">$${Number(o.totalAmount).toFixed(2)}</td>
                <td style="padding: 12px 10px; font-size: 12px;">${escapeHtml(o.paymentMethod)}</td>
                <td style="padding: 12px 10px;"><span class="badge badge-green">${escapeHtml(o.status)}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function showAdminTab(tabId, el) {
  document.querySelectorAll('#page-admin .sidebar-item').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');

  if (tabId === 'admin-dashboard') renderAdminDashboard();
  else if (tabId === 'admin-products') renderAdminProductsTab();
  else if (tabId === 'admin-orders') renderAdminOrdersTab();
  else if (tabId === 'admin-profile') renderAdminProfileTab();
  else if (tabId === 'admin-settings') renderAdminSettingsTab();
}

function renderAdminProductsTab() {
  const content = document.getElementById('adminContent');
  const prods = ZimboData.getProducts();
  content.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2>Product Catalog & Inventory</h2>
      <button class="btn btn-primary" onclick="openAddProductModal()">+ Add New Product</button>
    </div>
    <div style="background: #fff; border: 1px solid var(--border); border-radius: 8px; padding: 20px;">
      ${prods.map(p => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid var(--border);">
          <div>
            <strong>${escapeHtml(p.name)}</strong>
            <div style="font-size: 12px; color: var(--text-muted);">${escapeHtml(p.category)} • MOQ: ${p.moq} • In Stock: ${p.stockQty}</div>
          </div>
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="font-weight: 800; color: var(--primary); font-size: 16px;">$${Number(p.price).toFixed(2)}</div>
            <button class="btn btn-outline btn-sm" onclick="handleDeleteProduct('${p.id}')" style="color: #DC2626;">Remove</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderAdminOrdersTab() {
  const content = document.getElementById('adminContent');
  const orders = ZimboData.getOrders();
  content.innerHTML = `
    <h2 style="margin-bottom: 20px;">Received Orders & RFQs</h2>
    <div style="background: #fff; border: 1px solid var(--border); border-radius: 8px; padding: 20px;">
      ${orders.map(o => `
        <div style="border: 1px solid var(--border); border-radius: 8px; padding: 16px; margin-bottom: 14px; background: #F8FAFC;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <strong style="font-size: 16px;">${escapeHtml(o.id)} — ${escapeHtml(o.customerName)}</strong>
            <span style="font-size: 18px; font-weight: 800; color: var(--primary);">$${Number(o.totalAmount).toFixed(2)} USD</span>
          </div>
          <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 8px;">
            📍 Delivery: ${escapeHtml(o.deliveryAddress)} | 📞 ${escapeHtml(o.phone)} | 💳 ${escapeHtml(o.paymentMethod)}
          </div>
          <div style="font-size: 13px; background: #fff; padding: 8px; border-radius: 4px; border: 1px solid var(--border);">
            Status: <strong>${escapeHtml(o.status)}</strong>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderAdminProfileTab() {
  const content = document.getElementById('adminContent');
  const user = ZimboData.getCurrentUser() || { name: 'Demo Manufacturer', email: 'sales@factory.co.zw' };
  content.innerHTML = `
    <h2 style="margin-bottom: 20px;">Factory Profile & Accreditations</h2>
    <div style="background: #fff; border: 1px solid var(--border); border-radius: 8px; padding: 24px; max-width: 600px;">
      <div class="form-group">
        <label class="form-label">Manufacturer Name</label>
        <input class="form-input" value="${escapeHtml(user.name)}" readonly>
      </div>
      <div class="form-group">
        <label class="form-label">Official Contact Email</label>
        <input class="form-input" value="${escapeHtml(user.email)}" readonly>
      </div>
      <div class="form-group">
        <label class="form-label">Standards Association of Zimbabwe (SAZ) Certification</label>
        <input class="form-input" value="Certified Quality Mark (Verified)" readonly>
      </div>
      <button class="btn btn-primary" onclick="showToast('Profile updated!', 'success')">Save Profile</button>
    </div>
  `;
}

function renderAdminSettingsTab() {
  const content = document.getElementById('adminContent');
  content.innerHTML = `
    <h2 style="margin-bottom: 20px;">Portal Settings</h2>
    <div style="background: #fff; border: 1px solid var(--border); border-radius: 8px; padding: 24px; max-width: 600px;">
      <div class="form-group">
        <label class="form-label">Formspree Endpoint ID</label>
        <input class="form-input" value="mljbjywj (Active)" readonly>
      </div>
      <div class="form-group">
        <label class="form-label">Currency Display</label>
        <select class="form-select">
          <option>USD ($) with ZiG conversions</option>
          <option>USD Only</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">EcoCash Merchant Code</label>
        <input class="form-input" value="984210 (Zimbo-Connect B2B Escrow)">
      </div>
      <button class="btn btn-primary" onclick="showToast('Settings saved!', 'success')">Save Settings</button>
    </div>
  `;
}

function openAddProductModal() {
  const mfrs = ZimboData.getManufacturers();
  const header = document.getElementById('orderModal').querySelector('.modal-header h2');
  const body = document.getElementById('orderModalBody');

  header.textContent = 'Add Product to Factory Catalog';
  body.innerHTML = `
    <form id="newProductForm" onsubmit="handleCreateProductSubmit(event)">
      <div class="form-group">
        <label class="form-label">Product Name</label>
        <input type="text" name="name" class="form-input" required placeholder="e.g. 100mm Corrugated AC Sheet">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Manufacturer</label>
          <select name="mfrId" class="form-select" required>
            ${mfrs.map(m => `<option value="${m.id}">${escapeHtml(m.name)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Category</label>
          <select name="category" class="form-select" required>
            ${CATEGORIES.filter(c => c !== 'All').map(c => `<option value="${c}">${c}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Wholesale Price ($ USD)</label>
          <input type="number" step="0.01" name="price" class="form-input" required placeholder="24.50">
        </div>
        <div class="form-group">
          <label class="form-label">Unit Specifier</label>
          <input type="text" name="unit" class="form-input" required placeholder="per sheet / per 1000">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">MOQ (Minimum Order Qty)</label>
          <input type="number" name="moq" class="form-input" value="10" required>
        </div>
        <div class="form-group">
          <label class="form-label">Stock Units Available</label>
          <input type="number" name="stockQty" class="form-input" value="500" required>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Technical Specs & Standards</label>
        <textarea name="specs" class="form-textarea" rows="2" placeholder="Dimensions, ASTM/SAZ grade, fire rating..."></textarea>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
        <button type="button" class="btn btn-outline" onclick="closeModal('orderModal')">Cancel</button>
        <button type="submit" class="btn btn-primary">Save Product</button>
      </div>
    </form>
  `;
  openModal('orderModal');
}

function handleCreateProductSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const mfr = ZimboData.getManufacturerById(formData.get('mfrId'));

  const newProd = {
    name: formData.get('name'),
    mfrId: formData.get('mfrId'),
    mfrName: mfr ? mfr.name : 'Verified Manufacturer',
    category: formData.get('category'),
    price: parseFloat(formData.get('price')) || 0,
    unit: formData.get('unit'),
    moq: parseInt(formData.get('moq'), 10) || 1,
    stockQty: parseInt(formData.get('stockQty'), 10) || 0,
    specs: formData.get('specs') || 'Industrial standard',
    badge: 'Direct Factory Price'
  };

  ZimboData.addProduct(newProd);
  showToast('Product added to catalog!', 'success');
  closeModal('orderModal');
  renderAdminDashboard();
  renderHomeProducts();
}

function handleDeleteProduct(productId) {
  if (confirm('Are you sure you want to remove this product from the catalog?')) {
    ZimboData.deleteProduct(productId);
    showToast('Product removed.', 'info');
    renderAdminDashboard();
    renderHomeProducts();
  }
}

// ═══════════════════════════════════════════════════════════════
// RETAILER / CUSTOMER DASHBOARD VIEW (IN-PAGE)
// ═══════════════════════════════════════════════════════════════
function renderRetailerDashboard() {
  const content = document.getElementById('retailerContent');
  if (!content) return;
  const orders = ZimboData.getOrders();

  content.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <div>
        <h2 style="font-family: var(--font-serif); font-size: 26px;">Customer & Contractor Portal</h2>
        <p style="color: var(--text-muted); font-size: 14px;">Track your factory building supply orders and direct quotations.</p>
      </div>
      <button class="btn btn-outline btn-sm" onclick="handleLogout()">Sign Out</button>
    </div>

    <div style="background: #fff; border: 1px solid var(--border); border-radius: 8px; padding: 24px; margin-bottom: 28px;">
      <h3 style="font-size: 18px; margin-bottom: 16px;">My Purchase Orders (${orders.length})</h3>
      ${orders.map(o => `
        <div style="border: 1px solid var(--border); border-radius: 8px; padding: 16px; margin-bottom: 14px; background: #F8FAFC;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div>
              <strong style="font-size: 15px;">Order #${escapeHtml(o.id)}</strong>
              <div style="font-size: 12px; color: var(--text-muted);">${escapeHtml(o.date || 'Recent')}</div>
            </div>
            <div style="text-align: right;">
              <div style="font-weight: 800; color: var(--primary); font-size: 18px;">$${Number(o.totalAmount).toFixed(2)}</div>
              <span class="badge badge-green">${escapeHtml(o.status)}</span>
            </div>
          </div>
          <div style="font-size: 13px; color: var(--text-main); margin-bottom: 6px;">
            📍 Destination: <strong>${escapeHtml(o.deliveryAddress)}</strong>
          </div>
          <div style="font-size: 12px; color: var(--text-muted);">
            Payment Option: ${escapeHtml(o.paymentMethod)}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function showRetailerTab(tabId, el) {
  document.querySelectorAll('#page-retailer .sidebar-item').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');

  if (tabId === 'ret-browse') showPage('home');
  else if (tabId === 'ret-orders') renderRetailerDashboard();
  else if (tabId === 'ret-account') renderRetailerAccountTab();
}

function renderRetailerAccountTab() {
  const content = document.getElementById('retailerContent');
  const user = ZimboData.getCurrentUser() || { name: 'Valued Client', email: 'contractor@zimbo.co.zw' };
  content.innerHTML = `
    <h2 style="margin-bottom: 20px;">Account Details</h2>
    <div style="background: #fff; border: 1px solid var(--border); border-radius: 8px; padding: 24px; max-width: 500px;">
      <div class="form-group">
        <label class="form-label">Client Name</label>
        <input class="form-input" value="${escapeHtml(user.name)}" readonly>
      </div>
      <div class="form-group">
        <label class="form-label">Registered Email</label>
        <input class="form-input" value="${escapeHtml(user.email)}" readonly>
      </div>
      <div class="form-group">
        <label class="form-label">Account Tier</label>
        <input class="form-input" value="Verified Commercial Buyer" readonly>
      </div>
    </div>
  `;
}

function handleLogout() {
  ZimboData.setCurrentUser(null);
  showToast('Logged out.', 'info');
  updateNavUserStatus();
  showPage('home');
}

// ═══════════════════════════════════════════════════════════════
// MODAL & TOAST UTILITIES
// ═══════════════════════════════════════════════════════════════
function openModal(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Close on overlay background click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
    document.body.style.overflow = '';
  }
});

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Expose handlers to window
window.showPage = showPage;
window.handleNavAdmin = handleNavAdmin;
window.handleNavRetailer = handleNavRetailer;
window.showAuth = showAuth;
window.switchAuthRole = switchAuthRole;
window.switchAuthMode = switchAuthMode;
window.filterCategory = filterCategory;
window.renderHomeProducts = renderHomeProducts;
window.quickAddToCart = quickAddToCart;
window.openCartModal = openCartModal;
window.openModal = openModal;
window.closeModal = closeModal;
window.openMfrDetail = openMfrDetail;
window.openMfrInquiry = openMfrInquiry;
window.openPostDesign = openPostDesign;
window.viewDesignDetails = viewDesignDetails;
window.openPlaceBid = openPlaceBid;
window.openOrderModal = openOrderModal;
window.showAdminTab = showAdminTab;
window.showRetailerTab = showRetailerTab;
window.openAddProductModal = openAddProductModal;
window.handleDeleteProduct = handleDeleteProduct;
window.handleLogout = handleLogout;
window.showToast = showToast;
window.handleCartQtyChange = handleCartQtyChange;
window.handleCartRemove = handleCartRemove;
window.proceedToCheckout = proceedToCheckout;
window.handleMfrInquirySubmit = handleMfrInquirySubmit;
window.handlePostDesignSubmit = handlePostDesignSubmit;
window.handlePlaceBidSubmit = handlePlaceBidSubmit;
window.handleCheckoutSubmit = handleCheckoutSubmit;
window.handleProductRfqSubmit = handleProductRfqSubmit;
window.handleAuthSubmit = handleAuthSubmit;
window.handleCreateProductSubmit = handleCreateProductSubmit;
