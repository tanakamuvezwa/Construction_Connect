/**
 * Construction Connect (Zimbo-Connect) - Core Data Layer
 * Handles mock databases, initial Zimbabwean manufacturer listings,
 * products, orders, custom designs, and localStorage sync.
 */

const STORAGE_KEYS = {
  MANUFACTURERS: 'zimbo_manufacturers_v1',
  PRODUCTS: 'zimbo_products_v1',
  ORDERS: 'zimbo_orders_v1',
  DESIGNS: 'zimbo_designs_v1',
  SUBMISSIONS: 'zimbo_submissions_v1',
  CART: 'zimbo_cart_v1',
  CURRENT_USER: 'zimbo_user_v1'
};

const INITIAL_MANUFACTURERS = [
  {
    id: 'mfr-1',
    name: 'Turnall Holdings Zimbabwe',
    tagline: 'Leading fiber cement roofing, pipes & building materials',
    category: 'Roofing & Pipes',
    location: 'Harare, Southerton Industrial Area',
    address: '30 Glasgow Road, Southerton, Harare',
    phone: '+263 (242) 754 625',
    email: 'sales@turnall.co.zw',
    established: 1943,
    rating: 4.9,
    reviewsCount: 142,
    verified: true,
    certifications: ['Standards Association of Zimbabwe (SAZ)', 'ISO 9001:2015'],
    leadTime: '2-4 business days for Harare; 5 days nationwide',
    paymentMethods: ['EcoCash USD & ZiG', 'Bank Transfer (USD Nostro)', 'Bank Transfer (RTGS)', 'Cash on Collection'],
    about: 'Turnall Holdings is Zimbabwe’s premier manufacturer of fiber-cement roofing sheets, concrete roof tiles, and water conveyance piping solutions. Trusted by commercial developers and national housing projects for over 80 years.',
    logoText: 'TH'
  },
  {
    id: 'mfr-2',
    name: 'Beta Bricks & Concrete',
    tagline: 'Clay face bricks, common bricks, and heavy paving',
    category: 'Bricks & Masonry',
    location: 'Mount Hampden, Mashonaland West',
    address: 'Lombardy Farm, Old Mazowe Road, Mount Hampden',
    phone: '+263 (242) 308 090',
    email: 'orders@betabricks.co.zw',
    established: 1952,
    rating: 4.8,
    reviewsCount: 215,
    verified: true,
    certifications: ['SAZ Standard 157', 'CZI Industrialist of the Year'],
    leadTime: '3-7 days depending on kiln scheduling and site offloading',
    paymentMethods: ['EcoCash USD', 'Direct Bank Transfer', 'Nostro TT', 'Credit Terms for Approved Contractors'],
    about: 'Beta Bricks is Zimbabwe’s largest clay brick and paving manufacturer. We operate automated extrusion and tunnel kilns producing high-compressive-strength commercial building bricks and architectural pavers.',
    logoText: 'BB'
  },
  {
    id: 'mfr-3',
    name: 'PG Industries & Timber Solutions',
    tagline: 'Structural timber, prefabricated roof trusses & boards',
    category: 'Timber & Boards',
    location: 'Harare, Workington Industrial Area',
    address: '41 Plymouth Road, Workington, Harare',
    phone: '+263 (242) 620 580',
    email: 'timber@pgzim.co.zw',
    established: 1948,
    rating: 4.7,
    reviewsCount: 178,
    verified: true,
    certifications: ['Forestry Commission Sustainable Timber Mark', 'SAZ Grade-A Treated Pine'],
    leadTime: '1-3 days for standard cuts; 5 days for custom gang-nail trusses',
    paymentMethods: ['EcoCash USD / ZiG', 'RTGS / Nostro Transfer', 'Mastercard/Visa'],
    about: 'PG Industries manufactures and processes indigenous and plantation pine timber from eastern Zimbabwe. Specialties include kiln-dried structural timber, engineered Mitek roof trusses, and marine ply.',
    logoText: 'PG'
  },
  {
    id: 'mfr-4',
    name: 'Cafca Cables Limited',
    tagline: 'Copper & aluminium transmission & house wiring cables',
    category: 'Electrical & Cabling',
    location: 'Harare, Pockets Hill',
    address: '54 South Avenue, Pockets Hill, Harare',
    phone: '+263 (242) 754 084',
    email: 'cables@cafca.co.zw',
    established: 1947,
    rating: 4.9,
    reviewsCount: 98,
    verified: true,
    certifications: ['ISO 9001', 'IEC International Electrical Standards', 'SAZ Certified'],
    leadTime: 'Same day collection from factory; 48hr delivery in Harare',
    paymentMethods: ['USD Nostro TT', 'EcoCash USD', 'RTGS Bank Transfer'],
    about: 'Cafca Limited is the sole cable manufacturer in Zimbabwe listed on the ZSE. We supply armored underground cabling, conduit house wiring, and overhead conductors for residential, industrial and infrastructure electrification.',
    logoText: 'CA'
  },
  {
    id: 'mfr-5',
    name: 'Steelmakers Zimbabwe (Pvt) Ltd',
    tagline: 'Deformed high-yield rebar, structural steel & wire mesh',
    category: 'Steel & Structural',
    location: 'Redcliff, Kwekwe & Harare Depot',
    address: 'Heavy Industrial Sites, Redcliff / Lytton Road Harare',
    phone: '+263 (55) 68 200',
    email: 'steel@steelmakers.co.zw',
    established: 1996,
    rating: 4.8,
    reviewsCount: 164,
    verified: true,
    certifications: ['SAZ Rebar Grade 460/500', 'ASTM A615 Standard'],
    leadTime: '2-5 days for cut & bend lists; Ex-stock available at Harare Depot',
    paymentMethods: ['USD Bank Transfer', 'EcoCash USD', 'LC for regional exports'],
    about: 'Steelmakers melts scrap and ore to produce high-tensile reinforced bar (rebar Y10, Y12, Y16, Y20), lip channels, square tubes, and BRC reinforcing fabric mesh for reinforced concrete structures.',
    logoText: 'SZ'
  },
  {
    id: 'mfr-6',
    name: 'Zimtile Concrete Roofing',
    tagline: 'Modern concrete roof tiles, ridge caps & color paving',
    category: 'Roofing & Pipes',
    location: 'Harare, Willowvale & Bulawayo',
    address: 'Gleneagles Road, Willowvale, Harare',
    phone: '+263 (242) 621 110',
    email: 'sales@zimtile.co.zw',
    established: 1957,
    rating: 4.7,
    reviewsCount: 110,
    verified: true,
    certifications: ['SAZ 50-Year Guarantee', 'CZI Product Award'],
    leadTime: '3-5 business days',
    paymentMethods: ['EcoCash USD & ZiG', 'Swipe & Nostro Transfer', 'Direct Deposit'],
    about: 'Zimtile is synonymous with durable, elegant roofing tiles across Southern Africa. With state-of-the-art Italian presses, our interlocking concrete tiles withstand harsh climate cycles and hail.',
    logoText: 'ZT'
  }
];

const INITIAL_PRODUCTS = [
  {
    id: 'prd-101',
    mfrId: 'mfr-1',
    mfrName: 'Turnall Holdings Zimbabwe',
    name: 'Endurite Corrugated Fiber-Cement Roofing Sheets (3.0m)',
    category: 'Roofing & Pipes',
    price: 18.50,
    unit: 'per sheet (3.0m x 0.92m)',
    moq: 25,
    stockQty: 850,
    badge: 'Direct Factory Price',
    specs: 'Thickness: 6mm | Corrugation Pitch: 177mm | Rust-proof & fire-resistant | Thermal acoustic damping',
    description: 'Heavy-duty non-asbestos fiber cement corrugated sheet suitable for residential, commercial warehouses, and poultry shelters across Zimbabwe.',
    imageIcon: 'roof'
  },
  {
    id: 'prd-102',
    mfrId: 'mfr-1',
    mfrName: 'Turnall Holdings Zimbabwe',
    name: 'Turnall AC Pressure Pipe Class 15 (100mm x 4m)',
    category: 'Roofing & Pipes',
    price: 42.00,
    unit: 'per length',
    moq: 10,
    stockQty: 320,
    badge: 'Infrastructure Grade',
    specs: 'Diameter: 100mm | Length: 4 meters | Pressure rating: Class 15 (15 bar) | Includes coupling rings',
    description: 'Durable potable water transmission and sewerage pipe resistant to ground acid and corrosion.',
    imageIcon: 'pipe'
  },
  {
    id: 'prd-103',
    mfrId: 'mfr-2',
    mfrName: 'Beta Bricks & Concrete',
    name: 'Beta Premium Hard-Burnt Common Bricks',
    category: 'Bricks & Masonry',
    price: 135.00,
    unit: 'per 1,000 bricks',
    moq: 3000,
    stockQty: 185000,
    badge: 'Bestseller',
    specs: 'Standard Size: 220 x 105 x 70mm | Compressive Strength: > 14 MPa | Low water absorption | Kiln fired',
    description: 'Top-quality load-bearing red clay common bricks. Guaranteed solid core for single & multi-storey structural walls.',
    imageIcon: 'brick'
  },
  {
    id: 'prd-104',
    mfrId: 'mfr-2',
    mfrName: 'Beta Bricks & Concrete',
    name: 'Beta Sahara Rustic Red Clay Face Bricks',
    category: 'Bricks & Masonry',
    price: 240.00,
    unit: 'per 1,000 bricks',
    moq: 2000,
    stockQty: 92000,
    badge: 'Architectural Finish',
    specs: 'Size: 222 x 106 x 73mm | Aesthetic textured face | Zero maintenance required | Efflorescence resistant',
    description: 'Exquisite architectural facing bricks engineered for modern exterior walls, perimeter boundary walls, and upscale developments.',
    imageIcon: 'brick'
  },
  {
    id: 'prd-105',
    mfrId: 'mfr-2',
    mfrName: 'Beta Bricks & Concrete',
    name: 'Interlocking Concrete Driveway Pavers (60mm Charcoal/Grey)',
    category: 'Bricks & Masonry',
    price: 14.00,
    unit: 'per square meter (50 units/m²)',
    moq: 100,
    stockQty: 12000,
    badge: 'Heavy Traffic 35MPa',
    specs: 'Thickness: 60mm | 35 MPa concrete grade | Non-slip textured surface | Ideal for commercial loading bays',
    description: 'Interlocking concrete paving stones designed for petrol stations, parking complexes, logistics depots, and residential drives.',
    imageIcon: 'paver'
  },
  {
    id: 'prd-106',
    mfrId: 'mfr-3',
    mfrName: 'PG Industries & Timber Solutions',
    name: 'CCA Pressure-Treated Structural Pine (38mm x 114mm x 6.0m)',
    category: 'Timber & Boards',
    price: 16.80,
    unit: 'per length',
    moq: 30,
    stockQty: 1400,
    badge: 'Treated H2 Grade',
    specs: 'Dimensions: 38mm x 114mm x 6000mm | Kiln dried to < 12% moisture | Termite & fungal decay resistant',
    description: 'Certified SABS/SAZ structural Zimbabwean pine lumber for roof rafters, purlins, wall framing and ceilings.',
    imageIcon: 'timber'
  },
  {
    id: 'prd-107',
    mfrId: 'mfr-3',
    mfrName: 'PG Industries & Timber Solutions',
    name: 'Exterior WBP Marine Plywood Sheet (18mm 2.44m x 1.22m)',
    category: 'Timber & Boards',
    price: 38.00,
    unit: 'per board',
    moq: 15,
    stockQty: 450,
    badge: 'Waterproof Adhesive',
    specs: 'Size: 2440mm x 1220mm x 18mm | Phenolic resin bonded | Multiple cross-laminated hardwood plies',
    description: 'Heavy duty exterior shuttering board for concrete formwork, architectural cabinetry, decking, and scaffolding bases.',
    imageIcon: 'board'
  },
  {
    id: 'prd-108',
    mfrId: 'mfr-4',
    mfrName: 'Cafca Cables Limited',
    name: 'Cafca 2.5mm² Twin + Earth Copper Electrical House Wire (100m Roll)',
    category: 'Electrical & Cabling',
    price: 89.00,
    unit: 'per 100m roll',
    moq: 5,
    stockQty: 260,
    badge: '100% Pure Oxygen-Free Copper',
    specs: 'Conductor: Solid high-conductivity annealed copper | PVC Insulated 300/500V | Color coded SAZ/IEC standard',
    description: 'The standard of reliability for ring main socket circuits in domestic and commercial buildings throughout Zimbabwe.',
    imageIcon: 'cable'
  },
  {
    id: 'prd-109',
    mfrId: 'mfr-4',
    mfrName: 'Cafca Cables Limited',
    name: 'Cafca 16mm² 4-Core Armoured Underground Cable (SWA)',
    category: 'Electrical & Cabling',
    price: 18.50,
    unit: 'per meter',
    moq: 20,
    stockQty: 1800,
    badge: 'Steel Wire Armoured (SWA)',
    specs: '4-Core 16mm² | 600/1000V rated | Galvanized steel wire armouring | XLPE insulation',
    description: 'Direct-burial main intake electrical cable for connecting transformer substations to main building distribution panels.',
    imageIcon: 'cable'
  },
  {
    id: 'prd-110',
    mfrId: 'mfr-5',
    mfrName: 'Steelmakers Zimbabwe (Pvt) Ltd',
    name: 'High-Tensile Deformed Rebar Y12 (12mm x 12m Length)',
    category: 'Steel & Structural',
    price: 11.20,
    unit: 'per 12m length',
    moq: 50,
    stockQty: 3200,
    badge: 'Grade 460B High Tensile',
    specs: 'Diameter: 12mm | Length: 12 meters | Yield strength >= 460 MPa | Deep ribbed deformation pattern',
    description: 'Crucial reinforcing steel bars for ring beams, foundation footings, concrete columns, and slab lintels.',
    imageIcon: 'steel'
  },
  {
    id: 'prd-111',
    mfrId: 'mfr-5',
    mfrName: 'Steelmakers Zimbabwe (Pvt) Ltd',
    name: 'Structural Steel Lip Channel (100mm x 50mm x 20mm x 2.0mm x 6m)',
    category: 'Steel & Structural',
    price: 24.50,
    unit: 'per 6m length',
    moq: 20,
    stockQty: 840,
    badge: 'Cold-Formed High Strength',
    specs: 'Profile: 100x50x20mm | Wall thickness: 2.0mm | High bending resistance | Clean degreased surface',
    description: 'Factory purlin and girt steel section for roofing frameworks, warehouse portal frames, and carport manufacturing.',
    imageIcon: 'steel'
  },
  {
    id: 'prd-112',
    mfrId: 'mfr-5',
    mfrName: 'Steelmakers Zimbabwe (Pvt) Ltd',
    name: 'BRC Concrete Reinforcement Mesh Ref 617 (30m x 2.4m Roll)',
    category: 'Steel & Structural',
    price: 145.00,
    unit: 'per roll',
    moq: 5,
    stockQty: 190,
    badge: 'Welded Wire Mesh',
    specs: 'Wire gauge: 6.0mm ribbed wire | Aperture: 200mm x 200mm grid | Total roll area: 72 m²',
    description: 'Welded steel wire reinforcement fabric for driveways, warehouse concrete floor slabs, and precast wall panels.',
    imageIcon: 'mesh'
  },
  {
    id: 'prd-113',
    mfrId: 'mfr-6',
    mfrName: 'Zimtile Concrete Roofing',
    name: 'Zimtile Mendip Double Roman Concrete Roof Tiles (Slate Grey)',
    category: 'Roofing & Pipes',
    price: 1.15,
    unit: 'per tile (10.5 tiles per m²)',
    moq: 500,
    stockQty: 48000,
    badge: '50-Year Guarantee',
    specs: 'Dimensions: 420 x 330mm | Integrated weather-lock channels | UV-resistant mineral pigment | Weight: 4.4kg/tile',
    description: 'Premium through-color interlocking concrete roof tile. Enhances aesthetic curbside appeal with maximum weather-tightness.',
    imageIcon: 'tile'
  },
  {
    id: 'prd-114',
    mfrId: 'mfr-6',
    mfrName: 'Zimtile Concrete Roofing',
    name: 'Zimtile Universal Angle Ridge Caps (Terracotta / Red)',
    category: 'Roofing & Pipes',
    price: 3.20,
    unit: 'per capping piece',
    moq: 50,
    stockQty: 2400,
    badge: 'Seamless Fit',
    specs: 'Length: 450mm | Effective cover: 400mm | Pre-drilled fixing points | High flexural bond strength',
    description: 'Matching concrete ridge and hip caps to finish apex roof junctions with complete water protection.',
    imageIcon: 'tile'
  }
];

const INITIAL_DESIGNS = [
  {
    id: 'ds-201',
    title: 'Custom Fabricated Cantilever Steel Canopy for Fuel Station',
    clientName: 'Tinashe Marange (Zuva Partner Station)',
    category: 'Steel & Structural',
    budget: '$8,500 - $12,000',
    quantity: '1 Structural Frame (24m x 14m)',
    deadline: 'December 2026',
    location: 'Gweru CBD, Midlands',
    description: 'Seeking certified steel structural fabricators to produce engineer-approved cantilever roof columns and I-beam rafters for a modern 4-pump commercial service station canopy. Specifications and CAD drawings available upon bid approval.',
    status: 'Open for Bids',
    createdAt: '2026-11-12',
    bids: [
      {
        id: 'bid-1',
        mfrName: 'Steelmakers Zimbabwe (Pvt) Ltd',
        amount: 9400,
        timeline: '14 days fabrication',
        notes: 'Can supply certified mild steel beams with anti-corrosive primer coating and test certs.'
      }
    ]
  },
  {
    id: 'ds-202',
    title: 'Precast Exposed Aggregate Decorative Cladding Panels',
    clientName: 'Chipo Moyo Architects',
    category: 'Bricks & Masonry',
    budget: '$4,200',
    quantity: '180 custom modular panels (1.2m x 0.6m)',
    deadline: 'Late November 2026',
    location: 'Borrowdale Brooke, Harare',
    description: 'Requires precast concrete manufacturer to fabricate custom architectural facade panels with crushed white quartz exposed aggregate finish. Must meet 30MPa strength criteria.',
    status: 'Open for Bids',
    createdAt: '2026-11-14',
    bids: []
  },
  {
    id: 'ds-203',
    title: 'Custom Timber Gang-Nail Scissor Trusses (18m Span)',
    clientName: 'Masvingo Anglican Church Project',
    category: 'Timber & Boards',
    budget: '$6,800',
    quantity: '22 Engineered Trusses',
    deadline: 'December 2026',
    location: 'Masvingo Urban',
    description: 'Vaulted cathedral ceiling trusses engineered from treated pine with galvanized steel connector plates. Delivery required on site in Masvingo with structural engineer sign-off.',
    status: 'Under Review',
    createdAt: '2026-11-10',
    bids: [
      {
        id: 'bid-2',
        mfrName: 'PG Industries & Timber Solutions',
        amount: 6350,
        timeline: '8 business days',
        notes: 'Engineered using Mitek 2026 design software with PE structural compliance stamp included.'
      }
    ]
  }
];

const INITIAL_ORDERS = [
  {
    id: 'ORD-7041',
    customerName: 'Kudakwashe Shumba',
    company: 'Shumba Builders & Civils',
    phone: '+263 77 412 8899',
    email: 'kuda@shumbacivils.co.zw',
    deliveryAddress: 'Plot 14, Enterprise Rd, Highlands, Harare',
    items: [
      { productId: 'prd-103', name: 'Beta Premium Hard-Burnt Common Bricks', qty: 10000, unitPrice: 135.00, subtotal: 1350.00 },
      { productId: 'prd-110', name: 'High-Tensile Deformed Rebar Y12 (12m)', qty: 80, unitPrice: 11.20, subtotal: 896.00 }
    ],
    totalAmount: 2246.00,
    paymentMethod: 'EcoCash USD Nostro',
    status: 'Confirmed - In Production',
    date: '2026-11-15 14:22',
    notes: 'Please coordinate offloading crane for the rebar delivery.'
  },
  {
    id: 'ORD-7038',
    customerName: 'Grace Chiwenga',
    company: 'Apex Hardware Supplies',
    phone: '+263 71 298 3344',
    email: 'purchasing@apexhardware.co.zw',
    deliveryAddress: 'Stand 405, Kelvin North Industrial, Bulawayo',
    items: [
      { productId: 'prd-108', name: 'Cafca 2.5mm² Twin + Earth Copper Wire (100m)', qty: 15, unitPrice: 89.00, subtotal: 1335.00 },
      { productId: 'prd-106', name: 'CCA Treated Structural Pine 38x114x6m', qty: 60, unitPrice: 16.80, subtotal: 1008.00 }
    ],
    totalAmount: 2343.00,
    paymentMethod: 'Direct Bank Transfer (USD)',
    status: 'Dispatched - En Route',
    date: '2026-11-14 09:10',
    notes: 'Bulk stock delivery for Bulawayo branch wholesale depot.'
  }
];

// Data Access API
const ZimboData = {
  getManufacturers() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MANUFACTURERS);
      if (stored) return JSON.parse(stored);
    } catch (e) { console.warn(e); }
    localStorage.setItem(STORAGE_KEYS.MANUFACTURERS, JSON.stringify(INITIAL_MANUFACTURERS));
    return INITIAL_MANUFACTURERS;
  },

  saveManufacturers(list) {
    localStorage.setItem(STORAGE_KEYS.MANUFACTURERS, JSON.stringify(list));
  },

  getManufacturerById(id) {
    return this.getManufacturers().find(m => m.id === id);
  },

  addManufacturer(mfr) {
    const list = this.getManufacturers();
    mfr.id = 'mfr-' + Date.now();
    mfr.verified = mfr.verified !== undefined ? mfr.verified : false;
    mfr.rating = mfr.rating || 5.0;
    mfr.reviewsCount = 0;
    mfr.logoText = mfr.name.split(' ').map(w => w[0]).join('').substring(0, 3).toUpperCase();
    list.unshift(mfr);
    this.saveManufacturers(list);
    return mfr;
  },

  updateManufacturer(id, updates) {
    const list = this.getManufacturers();
    const idx = list.findIndex(m => m.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      this.saveManufacturers(list);
      return list[idx];
    }
    return null;
  },

  deleteManufacturer(id) {
    const list = this.getManufacturers().filter(m => m.id !== id);
    this.saveManufacturers(list);
    // Also remove their products
    const prods = this.getProducts().filter(p => p.mfrId !== id);
    this.saveProducts(prods);
  },

  getProducts() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (stored) return JSON.parse(stored);
    } catch (e) { console.warn(e); }
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  },

  saveProducts(list) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(list));
  },

  getProductById(id) {
    return this.getProducts().find(p => p.id === id);
  },

  addProduct(prod) {
    const list = this.getProducts();
    prod.id = 'prd-' + Date.now();
    prod.price = parseFloat(prod.price) || 0;
    prod.moq = parseInt(prod.moq, 10) || 1;
    prod.stockQty = parseInt(prod.stockQty, 10) || 0;
    list.unshift(prod);
    this.saveProducts(list);
    return prod;
  },

  updateProduct(id, updates) {
    const list = this.getProducts();
    const idx = list.findIndex(p => p.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      this.saveProducts(list);
      return list[idx];
    }
    return null;
  },

  deleteProduct(id) {
    const list = this.getProducts().filter(p => p.id !== id);
    this.saveProducts(list);
  },

  getDesigns() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DESIGNS);
      if (stored) return JSON.parse(stored);
    } catch (e) { console.warn(e); }
    localStorage.setItem(STORAGE_KEYS.DESIGNS, JSON.stringify(INITIAL_DESIGNS));
    return INITIAL_DESIGNS;
  },

  saveDesigns(list) {
    localStorage.setItem(STORAGE_KEYS.DESIGNS, JSON.stringify(list));
  },

  addDesign(design) {
    const list = this.getDesigns();
    design.id = 'ds-' + Date.now();
    design.status = 'Open for Bids';
    design.createdAt = new Date().toISOString().split('T')[0];
    design.bids = [];
    list.unshift(design);
    this.saveDesigns(list);
    return design;
  },

  addBidToDesign(designId, bid) {
    const list = this.getDesigns();
    const d = list.find(item => item.id === designId);
    if (d) {
      bid.id = 'bid-' + Date.now();
      d.bids.push(bid);
      this.saveDesigns(list);
      return d;
    }
    return null;
  },

  getOrders() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (stored) return JSON.parse(stored);
    } catch (e) { console.warn(e); }
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    return INITIAL_ORDERS;
  },

  saveOrders(list) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(list));
  },

  addOrder(order) {
    const list = this.getOrders();
    order.id = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
    order.date = new Date().toLocaleString();
    order.status = 'Pending Review';
    list.unshift(order);
    this.saveOrders(list);
    return order;
  },

  updateOrderStatus(orderId, newStatus) {
    const list = this.getOrders();
    const o = list.find(item => item.id === orderId);
    if (o) {
      o.status = newStatus;
      this.saveOrders(list);
      return o;
    }
    return null;
  },

  // Form Submissions Record (Formspree logs)
  getSubmissions() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [];
  },

  recordSubmission(submission) {
    const list = this.getSubmissions();
    submission.id = 'sub-' + Date.now();
    submission.timestamp = new Date().toLocaleString();
    list.unshift(submission);
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(list));
    return submission;
  },

  // Cart Management
  getCart() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CART);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [];
  },

  saveCart(cart) {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  },

  addToCart(product, quantity) {
    const cart = this.getCart();
    const existing = cart.find(i => i.id === product.id);
    const qty = Math.max(quantity || product.moq || 1, product.moq || 1);
    if (existing) {
      existing.quantity += qty;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        unit: product.unit,
        moq: product.moq,
        mfrName: product.mfrName,
        quantity: qty
      });
    }
    this.saveCart(cart);
    return cart;
  },

  removeFromCart(productId) {
    const cart = this.getCart().filter(i => i.id !== productId);
    this.saveCart(cart);
    return cart;
  },

  updateCartQty(productId, qty) {
    const cart = this.getCart();
    const item = cart.find(i => i.id === productId);
    if (item) {
      if (qty <= 0) return this.removeFromCart(productId);
      item.quantity = qty;
      this.saveCart(cart);
    }
    return cart;
  },

  clearCart() {
    this.saveCart([]);
  },

  // Authentication & Session
  getCurrentUser() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return null;
  },

  setCurrentUser(user) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  resetAllData() {
    localStorage.setItem(STORAGE_KEYS.MANUFACTURERS, JSON.stringify(INITIAL_MANUFACTURERS));
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.DESIGNS, JSON.stringify(INITIAL_DESIGNS));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    localStorage.removeItem(STORAGE_KEYS.SUBMISSIONS);
    localStorage.removeItem(STORAGE_KEYS.CART);
  }
};

window.ZimboData = ZimboData;
