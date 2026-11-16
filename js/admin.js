/**
 * Construction Connect - Super Admin Backend Controller (admin.js)
 * Features:
 * - Real-time metrics calculation
 * - Full CRUD on Manufacturers & Products
 * - Order & RFQ status management
 * - Custom Designs & Bids inspection
 * - Formspree Submissions Log (Live & Local backup)
 * - Platform Settings & Database Export
 */

let activeAdminTab = 'tab-overview';
let productCategoryFilter = 'All';
let productSearchFilter = '';
let orderStatusFilter = 'All';

document.addEventListener('DOMContentLoaded', () => {
  initAdmin();
});

function initAdmin() {
  updateBadges();
  renderTabContent(activeAdminTab);
}

function updateBadges() {
  const mfrs = ZimboData.getManufacturers();
  const prods = ZimboData.getProducts();
  const orders = ZimboData.getOrders();
  const designs = ZimboData.getDesigns();
  const subs = ZimboData.getSubmissions();

  const bMfr = document.getElementById('badgeMfrCount');
  if (bMfr) bMfr.textContent = mfrs.length;

  const bProd = document.getElementById('badgeProdCount');
  if (bProd) bProd.textContent = prods.length;

  const bOrder = document.getElementById('badgeOrderCount');
  if (bOrder) bOrder.textContent = orders.length;

  const bDesign = document.getElementById('badgeDesignCount');
  if (bDesign) bDesign.textContent = designs.length;

  const bSub = document.getElementById('badgeSubCount');
  if (bSub) bSub.textContent = subs.length;
}

function switchAdminTab(tabId, btn) {
  activeAdminTab = tabId;
  document.querySelectorAll('.admin-nav-item').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const titles = {
    'tab-overview': 'Dashboard Overview',
    'tab-mfrs': 'Manufacturers Management',
    'tab-products': 'Product Catalog & Inventory',
    'tab-orders': 'Orders & RFQ Pipeline',
    'tab-designs': 'Custom Designs & Fabricator Bids',
    'tab-formspree': 'Formspree Inquiries & Submissions Log',
    'tab-settings': 'Platform & Currency Configuration'
  };

  const titleEl = document.getElementById('topbarTitle');
  if (titleEl) titleEl.textContent = titles[tabId] || 'Admin Dashboard';

  renderTabContent(tabId);
}

function renderTabContent(tabId) {
  const container = document.getElementById('adminContentContainer');
  if (!container) return;
  updateBadges();

  switch (tabId) {
    case 'tab-overview':
      renderOverviewTab(container);
      break;
    case 'tab-mfrs':
      renderManufacturersTab(container);
      break;
    case 'tab-products':
      renderProductsTab(container);
      break;
    case 'tab-orders':
      renderOrdersTab(container);
      break;
    case 'tab-designs':
      renderDesignsTab(container);
      break;
    case 'tab-formspree':
      renderFormspreeTab(container);
      break;
    case 'tab-settings':
      renderSettingsTab(container);
      break;
    default:
      renderOverviewTab(container);
  }
}

// ═══════════════════════════════════════════════════════════════
// 1. OVERVIEW TAB
// ═══════════════════════════════════════════════════════════════
function renderOverviewTab(container) {
  const mfrs = ZimboData.getManufacturers();
  const prods = ZimboData.getProducts();
  const orders = ZimboData.getOrders();
  const designs = ZimboData.getDesigns();
  const subs = ZimboData.getSubmissions();

  const totalVolume = orders.reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0);

  container.innerHTML = `
    <!-- Top Metrics -->
    <div class="metrics-row">
      <div class="metric-card">
        <div class="metric-data">
          <h3>Active Manufacturers</h3>
          <div class="metric-value">${mfrs.length}</div>
          <span class="metric-growth">✓ 100% Verified Zim plants</span>
        </div>
        <div class="metric-icon-box metric-icon-amber">🏭</div>
      </div>

      <div class="metric-card">
        <div class="metric-data">
          <h3>Listed Product Lines</h3>
          <div class="metric-value">${prods.length}</div>
          <span class="metric-growth">Across 5 major sectors</span>
        </div>
        <div class="metric-icon-box metric-icon-emerald">📦</div>
      </div>

      <div class="metric-card">
        <div class="metric-data">
          <h3>Direct Orders Volume</h3>
          <div class="metric-value">$${totalVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <span class="metric-growth">USD Nostro & EcoCash</span>
        </div>
        <div class="metric-icon-box metric-icon-blue">💰</div>
      </div>

      <div class="metric-card">
        <div class="metric-data">
          <h3>Formspree Submissions</h3>
          <div class="metric-value">${subs.length}</div>
          <span class="metric-growth">Endpoint: mljbjywj</span>
        </div>
        <div class="metric-icon-box metric-icon-purple">✉️</div>
      </div>
    </div>

    <!-- Quick Action Banner -->
    <div style="background: linear-gradient(135deg, #1E293B, #0F172A); color: #fff; padding: 22px 28px; border-radius: 12px; margin-bottom: 28px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
      <div>
        <h3 style="font-size: 18px; margin-bottom: 4px;">🚀 Formspree AJAX Endpoint is Active</h3>
        <p style="font-size: 14px; color: #CBD5E1;">All marketplace registration, design requests, and product quotes route through <code>https://formspree.io/f/mljbjywj</code> and sync locally.</p>
      </div>
      <div style="display: flex; gap: 10px;">
        <button class="btn-admin btn-admin-primary" onclick="switchAdminTab('tab-formspree')">View Submissions</button>
        <button class="btn-admin btn-admin-outline" style="color: #fff; border-color: rgba(255,255,255,0.3);" onclick="openNewProductModal()">+ Add Product</button>
      </div>
    </div>

    <!-- Recent Orders Table -->
    <div class="admin-card">
      <div class="card-header-flex">
        <h2>Recent Purchase Orders</h2>
        <button class="btn-admin btn-admin-outline" onclick="switchAdminTab('tab-orders')">View All Orders →</button>
      </div>
      <div class="table-responsive">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Destination</th>
              <th>Amount</th>
              <th>Payment Method</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${orders.slice(0, 5).map(o => `
              <tr>
                <td><strong>${escapeHtml(o.id)}</strong></td>
                <td>${escapeHtml(o.customerName)} <small style="color:var(--admin-muted);">(${escapeHtml(o.company || 'Direct')})</small></td>
                <td>${escapeHtml(o.deliveryAddress)}</td>
                <td style="font-weight:700; color:var(--admin-primary);">$${Number(o.totalAmount).toFixed(2)}</td>
                <td>${escapeHtml(o.paymentMethod)}</td>
                <td><span class="badge-status badge-active">${escapeHtml(o.status)}</span></td>
                <td>
                  <button class="btn-admin btn-admin-outline" style="padding: 4px 10px; font-size: 12px;" onclick="viewOrderModal('${o.id}')">Inspect</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Active Manufacturers Overview -->
    <div class="admin-card">
      <div class="card-header-flex">
        <h2>Accredited Zimbabwean Manufacturers</h2>
        <button class="btn-admin btn-admin-primary" onclick="openNewManufacturerModal()">+ Register New Plant</button>
      </div>
      <div class="table-responsive">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Plant / Company</th>
              <th>Primary Sector</th>
              <th>Location</th>
              <th>Rating & Reviews</th>
              <th>SAZ Standards</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${mfrs.slice(0, 5).map(m => `
              <tr>
                <td>
                  <strong>${escapeHtml(m.name)}</strong>
                  <div style="font-size: 12px; color: var(--admin-muted);">${escapeHtml(m.email || 'sales@plant.co.zw')}</div>
                </td>
                <td>${escapeHtml(m.category)}</td>
                <td>${escapeHtml(m.location)}</td>
                <td>★ ${m.rating} (${m.reviewsCount} verified)</td>
                <td><span class="badge-status badge-active">✓ Accredited</span></td>
                <td>
                  <button class="btn-admin btn-admin-outline" style="padding: 4px 10px; font-size: 12px;" onclick="editManufacturerModal('${m.id}')">Edit</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════════
// 2. MANUFACTURERS MANAGEMENT TAB
// ═══════════════════════════════════════════════════════════════
function renderManufacturersTab(container) {
  const mfrs = ZimboData.getManufacturers();

  container.innerHTML = `
    <div class="admin-card">
      <div class="card-header-flex">
        <div>
          <h2>Manufacturing Partners (${mfrs.length})</h2>
          <p style="font-size: 13px; color: var(--admin-muted);">Direct factory suppliers in Zimbabwe with verified quality standards.</p>
        </div>
        <button class="btn-admin btn-admin-primary" onclick="openNewManufacturerModal()">+ Add Manufacturer</button>
      </div>

      <div class="table-responsive">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Company Name</th>
              <th>Sector</th>
              <th>Factory Address</th>
              <th>Contact Phone</th>
              <th>Status</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${mfrs.map(m => `
              <tr>
                <td>
                  <strong>${escapeHtml(m.name)}</strong>
                  <div style="font-size: 12px; color: var(--admin-muted);">${escapeHtml(m.email)}</div>
                </td>
                <td>${escapeHtml(m.category)}</td>
                <td>${escapeHtml(m.address || m.location)}</td>
                <td>${escapeHtml(m.phone || 'Direct line')}</td>
                <td>
                  <span class="badge-status ${m.verified ? 'badge-active' : 'badge-pending'}">
                    ${m.verified ? '✓ Verified' : 'Pending Verification'}
                  </span>
                </td>
                <td style="text-align: right;">
                  <button class="btn-admin btn-admin-outline" style="padding: 4px 8px; font-size: 12px;" onclick="toggleManufacturerVerify('${m.id}')">
                    ${m.verified ? 'Unverify' : 'Verify'}
                  </button>
                  <button class="btn-admin btn-admin-outline" style="padding: 4px 8px; font-size: 12px;" onclick="editManufacturerModal('${m.id}')">Edit</button>
                  <button class="btn-admin btn-admin-danger" style="padding: 4px 8px; font-size: 12px;" onclick="deleteManufacturerAction('${m.id}')">Delete</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function openNewManufacturerModal() {
  const title = document.getElementById('adminModalTitle');
  const body = document.getElementById('adminModalBody');

  title.textContent = 'Register New Manufacturing Plant';
  body.innerHTML = `
    <form id="adminMfrForm" onsubmit="handleSaveManufacturer(event)">
      <div class="form-group">
        <label class="form-label">Company Name</label>
        <input type="text" name="name" class="form-input" required placeholder="e.g. Turnall Holdings Zimbabwe">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Sector Category</label>
          <select name="category" class="form-select" required>
            <option value="Roofing & Pipes">Roofing & Pipes</option>
            <option value="Bricks & Masonry">Bricks & Masonry</option>
            <option value="Timber & Boards">Timber & Boards</option>
            <option value="Electrical & Cabling">Electrical & Cabling</option>
            <option value="Steel & Structural">Steel & Structural</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Established Year</label>
          <input type="number" name="established" class="form-input" value="1980" required>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Factory Location</label>
          <input type="text" name="location" class="form-input" required placeholder="Southerton, Harare">
        </div>
        <div class="form-group">
          <label class="form-label">Physical Address</label>
          <input type="text" name="address" class="form-input" required placeholder="Plot / Stand, Street name">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Official Sales Phone</label>
          <input type="tel" name="phone" class="form-input" required placeholder="+263 (242) ...">
        </div>
        <div class="form-group">
          <label class="form-label">Official Sales Email</label>
          <input type="email" name="email" class="form-input" required placeholder="sales@plant.co.zw">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Factory Overview & Production Capabilities</label>
        <textarea name="about" class="form-textarea" rows="3" required placeholder="Describe manufacturing volume, kiln technologies, certifications, etc."></textarea>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
        <button type="button" class="btn-admin btn-admin-outline" onclick="closeAdminModal()">Cancel</button>
        <button type="submit" class="btn-admin btn-admin-primary">Save Manufacturer</button>
      </div>
    </form>
  `;
  openAdminModal();
}

function editManufacturerModal(mfrId) {
  const m = ZimboData.getManufacturerById(mfrId);
  if (!m) return;
  const title = document.getElementById('adminModalTitle');
  const body = document.getElementById('adminModalBody');

  title.textContent = `Edit Manufacturer: ${m.name}`;
  body.innerHTML = `
    <form id="adminEditMfrForm" onsubmit="handleUpdateManufacturer(event, '${m.id}')">
      <div class="form-group">
        <label class="form-label">Company Name</label>
        <input type="text" name="name" class="form-input" value="${escapeHtml(m.name)}" required>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Sector Category</label>
          <select name="category" class="form-select" required>
            <option value="Roofing & Pipes" ${m.category === 'Roofing & Pipes' ? 'selected' : ''}>Roofing & Pipes</option>
            <option value="Bricks & Masonry" ${m.category === 'Bricks & Masonry' ? 'selected' : ''}>Bricks & Masonry</option>
            <option value="Timber & Boards" ${m.category === 'Timber & Boards' ? 'selected' : ''}>Timber & Boards</option>
            <option value="Electrical & Cabling" ${m.category === 'Electrical & Cabling' ? 'selected' : ''}>Electrical & Cabling</option>
            <option value="Steel & Structural" ${m.category === 'Steel & Structural' ? 'selected' : ''}>Steel & Structural</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Rating</label>
          <input type="number" step="0.1" name="rating" class="form-input" value="${m.rating}">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Location</label>
          <input type="text" name="location" class="form-input" value="${escapeHtml(m.location)}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Phone</label>
          <input type="text" name="phone" class="form-input" value="${escapeHtml(m.phone || '')}">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Sales Email</label>
        <input type="email" name="email" class="form-input" value="${escapeHtml(m.email || '')}" required>
      </div>
      <div class="form-group">
        <label class="form-label">About / Overview</label>
        <textarea name="about" class="form-textarea" rows="3">${escapeHtml(m.about || '')}</textarea>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
        <button type="button" class="btn-admin btn-admin-outline" onclick="closeAdminModal()">Cancel</button>
        <button type="submit" class="btn-admin btn-admin-primary">Update Details</button>
      </div>
    </form>
  `;
  openAdminModal();
}

function handleSaveManufacturer(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);

  ZimboData.addManufacturer({
    name: formData.get('name'),
    category: formData.get('category'),
    location: formData.get('location'),
    address: formData.get('address'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    established: parseInt(formData.get('established'), 10) || 1980,
    about: formData.get('about'),
    verified: true
  });

  closeAdminModal();
  renderTabContent('tab-mfrs');
  showToast('Manufacturer registered successfully!', 'success');
}

function handleUpdateManufacturer(e, mfrId) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);

  ZimboData.updateManufacturer(mfrId, {
    name: formData.get('name'),
    category: formData.get('category'),
    rating: parseFloat(formData.get('rating')) || 4.8,
    location: formData.get('location'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    about: formData.get('about')
  });

  closeAdminModal();
  renderTabContent('tab-mfrs');
  showToast('Manufacturer details updated!', 'success');
}

function toggleManufacturerVerify(mfrId) {
  const m = ZimboData.getManufacturerById(mfrId);
  if (!m) return;
  ZimboData.updateManufacturer(mfrId, { verified: !m.verified });
  renderTabContent('tab-mfrs');
  showToast(`Updated verification status for ${m.name}`, 'info');
}

function deleteManufacturerAction(mfrId) {
  if (confirm('Delete this manufacturer and all associated product lines?')) {
    ZimboData.deleteManufacturer(mfrId);
    renderTabContent('tab-mfrs');
    showToast('Manufacturer removed.', 'info');
  }
}

// ═══════════════════════════════════════════════════════════════
// 3. PRODUCT CATALOG MANAGEMENT
// ═══════════════════════════════════════════════════════════════
function renderProductsTab(container) {
  let prods = ZimboData.getProducts();

  if (productCategoryFilter !== 'All') {
    prods = prods.filter(p => p.category === productCategoryFilter);
  }

  if (productSearchFilter) {
    const s = productSearchFilter.toLowerCase();
    prods = prods.filter(p => p.name.toLowerCase().includes(s) || p.mfrName.toLowerCase().includes(s));
  }

  container.innerHTML = `
    <div class="admin-card">
      <div class="card-header-flex">
        <div>
          <h2>Product Catalog (${prods.length} lines)</h2>
          <p style="font-size: 13px; color: var(--admin-muted);">Direct factory wholesale pricing and minimum order quantities.</p>
        </div>
        <button class="btn-admin btn-admin-primary" onclick="openNewProductModal()">+ Add Product</button>
      </div>

      <!-- Filters Bar -->
      <div class="filter-bar" style="margin-bottom: 20px;">
        <input type="text" class="filter-input" placeholder="Search by product or manufacturer..." 
          value="${escapeHtml(productSearchFilter)}"
          oninput="productSearchFilter = this.value; renderTabContent('tab-products');">

        <select class="filter-select" onchange="productCategoryFilter = this.value; renderTabContent('tab-products');">
          <option value="All" ${productCategoryFilter === 'All' ? 'selected' : ''}>All Categories</option>
          <option value="Roofing & Pipes" ${productCategoryFilter === 'Roofing & Pipes' ? 'selected' : ''}>Roofing & Pipes</option>
          <option value="Bricks & Masonry" ${productCategoryFilter === 'Bricks & Masonry' ? 'selected' : ''}>Bricks & Masonry</option>
          <option value="Timber & Boards" ${productCategoryFilter === 'Timber & Boards' ? 'selected' : ''}>Timber & Boards</option>
          <option value="Electrical & Cabling" ${productCategoryFilter === 'Electrical & Cabling' ? 'selected' : ''}>Electrical & Cabling</option>
          <option value="Steel & Structural" ${productCategoryFilter === 'Steel & Structural' ? 'selected' : ''}>Steel & Structural</option>
        </select>
      </div>

      <div class="table-responsive">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Product Details</th>
              <th>Manufacturer</th>
              <th>Category</th>
              <th>Wholesale Price</th>
              <th>MOQ</th>
              <th>Stock</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${prods.map(p => `
              <tr>
                <td>
                  <strong>${escapeHtml(p.name)}</strong>
                  <div style="font-size: 12px; color: var(--admin-muted);">${escapeHtml(p.specs || '')}</div>
                </td>
                <td style="font-size: 13px; font-weight: 600;">${escapeHtml(p.mfrName)}</td>
                <td>${escapeHtml(p.category)}</td>
                <td style="font-weight: 800; color: var(--admin-primary);">$${Number(p.price).toFixed(2)} <small style="font-weight: normal; color: var(--admin-muted);">${escapeHtml(p.unit)}</small></td>
                <td>${p.moq}</td>
                <td>${p.stockQty} units</td>
                <td style="text-align: right;">
                  <button class="btn-admin btn-admin-outline" style="padding: 4px 8px; font-size: 12px;" onclick="editProductModal('${p.id}')">Edit</button>
                  <button class="btn-admin btn-admin-danger" style="padding: 4px 8px; font-size: 12px;" onclick="deleteProductAction('${p.id}')">Delete</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function openNewProductModal() {
  const mfrs = ZimboData.getManufacturers();
  const title = document.getElementById('adminModalTitle');
  const body = document.getElementById('adminModalBody');

  title.textContent = 'Add Factory Product Line';
  body.innerHTML = `
    <form id="adminProductForm" onsubmit="handleCreateProduct(event)">
      <div class="form-group">
        <label class="form-label">Product Name</label>
        <input type="text" name="name" class="form-input" required placeholder="e.g. Endurite Corrugated Fiber-Cement Roofing Sheets (3.0m)">
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
            <option value="Roofing & Pipes">Roofing & Pipes</option>
            <option value="Bricks & Masonry">Bricks & Masonry</option>
            <option value="Timber & Boards">Timber & Boards</option>
            <option value="Electrical & Cabling">Electrical & Cabling</option>
            <option value="Steel & Structural">Steel & Structural</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Wholesale Unit Price ($ USD)</label>
          <input type="number" step="0.01" name="price" class="form-input" required placeholder="18.50">
        </div>
        <div class="form-group">
          <label class="form-label">Unit Description</label>
          <input type="text" name="unit" class="form-input" required placeholder="per sheet / per 1,000 bricks / per roll">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Minimum Order Quantity (MOQ)</label>
          <input type="number" name="moq" class="form-input" value="10" required>
        </div>
        <div class="form-group">
          <label class="form-label">Current Stock Count</label>
          <input type="number" name="stockQty" class="form-input" value="500" required>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Badge Label</label>
        <input type="text" name="badge" class="form-input" value="Direct Factory Price">
      </div>
      <div class="form-group">
        <label class="form-label">Engineering Specifications & Standards</label>
        <textarea name="specs" class="form-textarea" rows="2" placeholder="Dimensions, compressive strength, coatings, ASTM/SAZ grade..."></textarea>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
        <button type="button" class="btn-admin btn-admin-outline" onclick="closeAdminModal()">Cancel</button>
        <button type="submit" class="btn-admin btn-admin-primary">Save to Catalog</button>
      </div>
    </form>
  `;
  openAdminModal();
}

function editProductModal(productId) {
  const p = ZimboData.getProductById(productId);
  if (!p) return;
  const mfrs = ZimboData.getManufacturers();
  const title = document.getElementById('adminModalTitle');
  const body = document.getElementById('adminModalBody');

  title.textContent = `Edit Product: ${p.name}`;
  body.innerHTML = `
    <form id="adminEditProductForm" onsubmit="handleUpdateProduct(event, '${p.id}')">
      <div class="form-group">
        <label class="form-label">Product Name</label>
        <input type="text" name="name" class="form-input" value="${escapeHtml(p.name)}" required>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Manufacturer</label>
          <select name="mfrId" class="form-select" required>
            ${mfrs.map(m => `<option value="${m.id}" ${m.id === p.mfrId ? 'selected' : ''}>${escapeHtml(m.name)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Category</label>
          <select name="category" class="form-select" required>
            <option value="Roofing & Pipes" ${p.category === 'Roofing & Pipes' ? 'selected' : ''}>Roofing & Pipes</option>
            <option value="Bricks & Masonry" ${p.category === 'Bricks & Masonry' ? 'selected' : ''}>Bricks & Masonry</option>
            <option value="Timber & Boards" ${p.category === 'Timber & Boards' ? 'selected' : ''}>Timber & Boards</option>
            <option value="Electrical & Cabling" ${p.category === 'Electrical & Cabling' ? 'selected' : ''}>Electrical & Cabling</option>
            <option value="Steel & Structural" ${p.category === 'Steel & Structural' ? 'selected' : ''}>Steel & Structural</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Price ($ USD)</label>
          <input type="number" step="0.01" name="price" class="form-input" value="${p.price}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Unit Specifier</label>
          <input type="text" name="unit" class="form-input" value="${escapeHtml(p.unit)}" required>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">MOQ</label>
          <input type="number" name="moq" class="form-input" value="${p.moq}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Stock Qty</label>
          <input type="number" name="stockQty" class="form-input" value="${p.stockQty}" required>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Specifications</label>
        <textarea name="specs" class="form-textarea" rows="2">${escapeHtml(p.specs || '')}</textarea>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
        <button type="button" class="btn-admin btn-admin-outline" onclick="closeAdminModal()">Cancel</button>
        <button type="submit" class="btn-admin btn-admin-primary">Update Product</button>
      </div>
    </form>
  `;
  openAdminModal();
}

function handleCreateProduct(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const mfr = ZimboData.getManufacturerById(formData.get('mfrId'));

  ZimboData.addProduct({
    name: formData.get('name'),
    mfrId: formData.get('mfrId'),
    mfrName: mfr ? mfr.name : 'Zimbabwean Plant',
    category: formData.get('category'),
    price: parseFloat(formData.get('price')) || 0,
    unit: formData.get('unit'),
    moq: parseInt(formData.get('moq'), 10) || 1,
    stockQty: parseInt(formData.get('stockQty'), 10) || 0,
    badge: formData.get('badge') || 'Direct Factory Price',
    specs: formData.get('specs') || ''
  });

  closeAdminModal();
  renderTabContent('tab-products');
  showToast('Product added to live catalog!', 'success');
}

function handleUpdateProduct(e, productId) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const mfr = ZimboData.getManufacturerById(formData.get('mfrId'));

  ZimboData.updateProduct(productId, {
    name: formData.get('name'),
    mfrId: formData.get('mfrId'),
    mfrName: mfr ? mfr.name : 'Zimbabwean Plant',
    category: formData.get('category'),
    price: parseFloat(formData.get('price')) || 0,
    unit: formData.get('unit'),
    moq: parseInt(formData.get('moq'), 10) || 1,
    stockQty: parseInt(formData.get('stockQty'), 10) || 0,
    specs: formData.get('specs') || ''
  });

  closeAdminModal();
  renderTabContent('tab-products');
  showToast('Product updated successfully!', 'success');
}

function deleteProductAction(productId) {
  if (confirm('Delete this product permanently from the catalog?')) {
    ZimboData.deleteProduct(productId);
    renderTabContent('tab-products');
    showToast('Product deleted.', 'info');
  }
}

// ═══════════════════════════════════════════════════════════════
// 4. ORDERS & RFQS PIPELINE
// ═══════════════════════════════════════════════════════════════
function renderOrdersTab(container) {
  const orders = ZimboData.getOrders();

  container.innerHTML = `
    <div class="admin-card">
      <div class="card-header-flex">
        <div>
          <h2>Marketplace Orders & RFQs (${orders.length})</h2>
          <p style="font-size: 13px; color: var(--admin-muted);">Manage delivery scheduling, payments, and manufacturer order dispatch.</p>
        </div>
      </div>

      <div class="table-responsive">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer / Firm</th>
              <th>Date</th>
              <th>Total Amount</th>
              <th>Payment Channel</th>
              <th>Current Status</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${orders.map(o => `
              <tr>
                <td><strong>${escapeHtml(o.id)}</strong></td>
                <td>
                  <strong>${escapeHtml(o.customerName)}</strong>
                  <div style="font-size: 12px; color: var(--admin-muted);">${escapeHtml(o.company || '')} • ${escapeHtml(o.phone || '')}</div>
                </td>
                <td>${escapeHtml(o.date || 'Recent')}</td>
                <td style="font-weight: 800; color: var(--admin-primary);">$${Number(o.totalAmount).toFixed(2)} USD</td>
                <td>${escapeHtml(o.paymentMethod)}</td>
                <td>
                  <select class="filter-select" style="padding: 4px 8px; font-size: 12px;" onchange="handleOrderStatusChange('${o.id}', this.value)">
                    <option value="Pending Review" ${o.status === 'Pending Review' ? 'selected' : ''}>Pending Review</option>
                    <option value="Confirmed - In Production" ${o.status === 'Confirmed - In Production' ? 'selected' : ''}>Confirmed - In Production</option>
                    <option value="Dispatched - En Route" ${o.status === 'Dispatched - En Route' ? 'selected' : ''}>Dispatched - En Route</option>
                    <option value="Completed - Delivered" ${o.status === 'Completed - Delivered' ? 'selected' : ''}>Completed - Delivered</option>
                    <option value="Cancelled" ${o.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                  </select>
                </td>
                <td style="text-align: right;">
                  <button class="btn-admin btn-admin-outline" style="padding: 4px 10px; font-size: 12px;" onclick="viewOrderModal('${o.id}')">Inspect</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function handleOrderStatusChange(orderId, newStatus) {
  ZimboData.updateOrderStatus(orderId, newStatus);
  showToast(`Order #${orderId} marked as ${newStatus}`, 'success');
}

function viewOrderModal(orderId) {
  const o = ZimboData.getOrders().find(item => item.id === orderId);
  if (!o) return;

  const title = document.getElementById('adminModalTitle');
  const body = document.getElementById('adminModalBody');

  title.textContent = `Order Details: #${o.id}`;

  const itemsHtml = (o.items || []).map(i => `
    <div style="display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid var(--admin-border);">
      <div>
        <strong>${escapeHtml(i.name)}</strong>
        <div style="font-size: 12px; color: var(--admin-muted);">${escapeHtml(i.mfrName || '')}</div>
      </div>
      <div style="text-align: right;">
        <div>${i.quantity} x $${Number(i.price || i.unitPrice || 0).toFixed(2)}</div>
        <strong style="color: var(--admin-primary);">$${(i.quantity * (i.price || i.unitPrice || 0)).toFixed(2)}</strong>
      </div>
    </div>
  `).join('') || '<p style="color: var(--admin-muted);">Custom RFQ specification</p>';

  body.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; background: #F8FAFC; padding: 16px; border-radius: 8px; margin-bottom: 20px; font-size: 14px;">
      <div><strong>Customer:</strong> ${escapeHtml(o.customerName)}</div>
      <div><strong>Company:</strong> ${escapeHtml(o.company || 'Private Buyer')}</div>
      <div><strong>Phone:</strong> ${escapeHtml(o.phone)}</div>
      <div><strong>Email:</strong> ${escapeHtml(o.email)}</div>
      <div style="grid-column: 1/-1;"><strong>Delivery Site:</strong> ${escapeHtml(o.deliveryAddress)}</div>
      <div style="grid-column: 1/-1;"><strong>Payment:</strong> ${escapeHtml(o.paymentMethod)}</div>
      ${o.notes ? `<div style="grid-column: 1/-1;"><strong>Notes:</strong> ${escapeHtml(o.notes)}</div>` : ''}
    </div>

    <h4 style="margin-bottom: 10px;">Line Items & Materials</h4>
    <div style="background: #fff; border: 1px solid var(--admin-border); border-radius: 8px; margin-bottom: 20px;">
      ${itemsHtml}
      <div style="display: flex; justify-content: space-between; padding: 14px; font-size: 16px; font-weight: 800; background: #F1F5F9;">
        <span>Total Payable:</span>
        <span style="color: var(--admin-primary);">$${Number(o.totalAmount).toFixed(2)} USD</span>
      </div>
    </div>

    <div style="display: flex; justify-content: flex-end; gap: 10px;">
      <button class="btn-admin btn-admin-outline" onclick="closeAdminModal()">Close</button>
    </div>
  `;

  openAdminModal();
}

// ═══════════════════════════════════════════════════════════════
// 5. CUSTOM DESIGNS & FABRICATOR BIDS
// ═══════════════════════════════════════════════════════════════
function renderDesignsTab(container) {
  const designs = ZimboData.getDesigns();

  container.innerHTML = `
    <div class="admin-card">
      <div class="card-header-flex">
        <div>
          <h2>Custom Construction Designs & RFQs (${designs.length})</h2>
          <p style="font-size: 13px; color: var(--admin-muted);">Custom engineering requests submitted by clients for manufacturer competitive bidding.</p>
        </div>
      </div>

      <div class="table-responsive">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Design Title</th>
              <th>Client / Project</th>
              <th>Category</th>
              <th>Target Budget</th>
              <th>Bids Received</th>
              <th>Status</th>
              <th style="text-align: right;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${designs.map(d => `
              <tr>
                <td><strong>${escapeHtml(d.title)}</strong></td>
                <td>${escapeHtml(d.clientName)} <small style="color:var(--admin-muted);">(${escapeHtml(d.location || '')})</small></td>
                <td>${escapeHtml(d.category)}</td>
                <td style="font-weight: 700;">${escapeHtml(d.budget || 'Negotiable')}</td>
                <td>
                  <span class="badge-status badge-active">${(d.bids || []).length} Bid${(d.bids || []).length === 1 ? '' : 's'}</span>
                </td>
                <td><span class="badge-status badge-pending">${escapeHtml(d.status || 'Open')}</span></td>
                <td style="text-align: right;">
                  <button class="btn-admin btn-admin-outline" style="padding: 4px 10px; font-size: 12px;" onclick="viewAdminDesignModal('${d.id}')">Inspect & Bids</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function viewAdminDesignModal(designId) {
  const d = ZimboData.getDesigns().find(i => i.id === designId);
  if (!d) return;

  const title = document.getElementById('adminModalTitle');
  const body = document.getElementById('adminModalBody');

  title.textContent = `Custom Request: ${d.title}`;

  const bidsList = (d.bids || []).map(b => `
    <div style="background: #F8FAFC; border: 1px solid var(--admin-border); border-radius: 6px; padding: 12px; margin-bottom: 8px;">
      <div style="display: flex; justify-content: space-between; font-weight: 700;">
        <span>${escapeHtml(b.mfrName)}</span>
        <span style="color: var(--admin-primary);">$${Number(b.amount).toFixed(2)}</span>
      </div>
      <div style="font-size: 12px; color: var(--admin-muted);">Timeline: ${escapeHtml(b.timeline || 'Fast')}</div>
      <p style="font-size: 13px; margin-top: 4px;">${escapeHtml(b.notes)}</p>
    </div>
  `).join('') || '<p style="color: var(--admin-muted);">No fabricator bids yet.</p>';

  body.innerHTML = `
    <div style="margin-bottom: 20px; font-size: 14px; line-height: 1.5;">
      <p><strong>Client:</strong> ${escapeHtml(d.clientName)} | <strong>Location:</strong> ${escapeHtml(d.location)}</p>
      <p><strong>Quantity:</strong> ${escapeHtml(d.quantity)} | <strong>Budget:</strong> ${escapeHtml(d.budget)}</p>
      <div style="background: #fff; border: 1px solid var(--admin-border); padding: 12px; border-radius: 6px; margin: 12px 0;">
        ${escapeHtml(d.description)}
      </div>
    </div>

    <h4 style="margin-bottom: 10px;">Submitted Bids (${(d.bids || []).length})</h4>
    ${bidsList}

    <div style="display: flex; justify-content: flex-end; margin-top: 20px;">
      <button class="btn-admin btn-admin-outline" onclick="closeAdminModal()">Close</button>
    </div>
  `;

  openAdminModal();
}

// ═══════════════════════════════════════════════════════════════
// 6. FORMSPREE SUBMISSIONS LOG
// ═══════════════════════════════════════════════════════════════
function renderFormspreeTab(container) {
  const subs = ZimboData.getSubmissions();

  container.innerHTML = `
    <div class="admin-card">
      <div class="card-header-flex">
        <div>
          <h2>Formspree Submissions Log (${subs.length})</h2>
          <p style="font-size: 13px; color: var(--admin-muted);">
            Active Formspree Form ID: <code>mljbjywj</code> &bull; Endpoint: <code>https://formspree.io/f/mljbjywj</code>
          </p>
        </div>
        <button class="btn-admin btn-admin-outline" onclick="exportSubmissionsJSON()">Export JSON</button>
      </div>

      ${subs.length === 0 ? `
        <div style="text-align: center; padding: 48px; background: #F8FAFC; border-radius: 8px;">
          <div style="font-size: 40px; margin-bottom: 12px;">✉️</div>
          <h3>No Formspree submissions recorded yet</h3>
          <p style="color: var(--admin-muted); margin-top: 6px;">
            Submitting any registration form, custom design RFQ, or checkout order on the site will transmit to Formspree and record here.
          </p>
        </div>
      ` : `
        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Form Type</th>
                <th>Sender / Contact</th>
                <th>Message / Payload Preview</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${subs.map(s => {
                const data = s.data || {};
                const contact = data.email || data.phone || data.senderName || 'Anonymous';
                const preview = data.message || data.notes || JSON.stringify(data).substring(0, 70) + '...';
                return `
                  <tr>
                    <td>${escapeHtml(s.timestamp || '')}</td>
                    <td><span class="badge-status badge-active">${escapeHtml(s.formType || 'Inquiry')}</span></td>
                    <td><strong>${escapeHtml(contact)}</strong></td>
                    <td style="font-size: 13px; color: var(--admin-muted);">${escapeHtml(preview)}</td>
                    <td style="text-align: right;">
                      <button class="btn-admin btn-admin-outline" style="padding: 4px 8px; font-size: 12px;" onclick="viewSubmissionDetails('${s.id}')">View Full Payload</button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `}
    </div>
  `;
}

function viewSubmissionDetails(subId) {
  const s = ZimboData.getSubmissions().find(item => item.id === subId);
  if (!s) return;

  const title = document.getElementById('adminModalTitle');
  const body = document.getElementById('adminModalBody');

  title.textContent = `Formspree Payload: ${s.formType}`;
  body.innerHTML = `
    <div style="font-size: 13px; color: var(--admin-muted); margin-bottom: 12px;">
      Recorded at: ${escapeHtml(s.timestamp)} &bull; Form ID: <code>${escapeHtml(s.formspreeId || 'mljbjywj')}</code>
    </div>
    <pre style="background: #0F172A; color: #38BDF8; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 13px; line-height: 1.5;">${escapeHtml(JSON.stringify(s.data, null, 2))}</pre>
    <div style="display: flex; justify-content: flex-end; margin-top: 20px;">
      <button class="btn-admin btn-admin-outline" onclick="closeAdminModal()">Close</button>
    </div>
  `;
  openAdminModal();
}

function exportSubmissionsJSON() {
  const subs = ZimboData.getSubmissions();
  const blob = new Blob([JSON.stringify(subs, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `formspree_submissions_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ═══════════════════════════════════════════════════════════════
// 7. SETTINGS & CURRENCY
// ═══════════════════════════════════════════════════════════════
function renderSettingsTab(container) {
  container.innerHTML = `
    <div class="admin-card" style="max-width: 700px;">
      <h2 style="margin-bottom: 16px;">Platform Settings</h2>
      
      <div class="form-group">
        <label class="form-label">Formspree Form ID</label>
        <input class="form-input" value="mljbjywj" readonly>
        <div style="font-size: 12px; color: var(--admin-muted); margin-top: 4px;">
          Connected endpoint: <code>https://formspree.io/f/mljbjywj</code>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Base Currency</label>
          <input class="form-input" value="USD ($) Nostro" readonly>
        </div>
        <div class="form-group">
          <label class="form-label">Zimbabwe Gold (ZiG) Interbank Rate</label>
          <input class="form-input" value="1 USD = 26.50 ZiG" readonly>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">B2B EcoCash Merchant Code</label>
        <input class="form-input" value="984210 (Construction Connect Escrow)" readonly>
      </div>

      <div class="form-group">
        <label class="form-label">Administrator Notification Email</label>
        <input class="form-input" value="tanaka@constructionconnect.co.zw">
      </div>

      <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid var(--admin-border);">
        <h4 style="margin-bottom: 10px; color: #DC2626;">Database Tools</h4>
        <p style="font-size: 13px; color: var(--admin-muted); margin-bottom: 14px;">
          Reset the catalog back to default Zimbabwean manufacturing seed data or export all data to JSON.
        </p>
        <div style="display: flex; gap: 12px;">
          <button class="btn-admin btn-admin-outline" onclick="exportFullDatabaseJSON()">Export Full Database (JSON)</button>
          <button class="btn-admin btn-admin-danger" onclick="handleResetDatabase()">Reset to Factory Seed Data</button>
        </div>
      </div>
    </div>
  `;
}

function exportFullDatabaseJSON() {
  const db = {
    manufacturers: ZimboData.getManufacturers(),
    products: ZimboData.getProducts(),
    orders: ZimboData.getOrders(),
    designs: ZimboData.getDesigns(),
    submissions: ZimboData.getSubmissions()
  };
  const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `construction_connect_backup_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function handleResetDatabase() {
  if (confirm('Reset all catalog data, orders, and submissions back to original Zimbabwean factory defaults?')) {
    ZimboData.resetAllData();
    showToast('Database reset to initial defaults.', 'info');
    renderTabContent(activeAdminTab);
  }
}

// ═══════════════════════════════════════════════════════════════
// MODAL CONTROLS
// ═══════════════════════════════════════════════════════════════
function openAdminModal() {
  const m = document.getElementById('adminModal');
  if (m) {
    m.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeAdminModal() {
  const m = document.getElementById('adminModal');
  if (m) {
    m.classList.remove('active');
    document.body.style.overflow = '';
  }
}

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

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Expose handlers to window
window.switchAdminTab = switchAdminTab;
window.openNewProductModal = openNewProductModal;
window.editProductModal = editProductModal;
window.deleteProductAction = deleteProductAction;
window.openNewManufacturerModal = openNewManufacturerModal;
window.editManufacturerModal = editManufacturerModal;
window.deleteManufacturerAction = deleteManufacturerAction;
window.toggleManufacturerVerify = toggleManufacturerVerify;
window.handleSaveManufacturer = handleSaveManufacturer;
window.handleUpdateManufacturer = handleUpdateManufacturer;
window.handleCreateProduct = handleCreateProduct;
window.handleUpdateProduct = handleUpdateProduct;
window.handleOrderStatusChange = handleOrderStatusChange;
window.viewOrderModal = viewOrderModal;
window.viewAdminDesignModal = viewAdminDesignModal;
window.viewSubmissionDetails = viewSubmissionDetails;
window.exportSubmissionsJSON = exportSubmissionsJSON;
window.exportFullDatabaseJSON = exportFullDatabaseJSON;
window.handleResetDatabase = handleResetDatabase;
window.openAdminModal = openAdminModal;
window.closeAdminModal = closeAdminModal;
