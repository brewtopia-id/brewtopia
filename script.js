/**
 * BrewTopia Coffee E-Commerce Web Application
 * Complete Interactive Logic:
 * - Product Data & Filtering
 * - Shopping Cart Drawer & Calculations
 * - Auth Protection for Promo Claiming
 * - Login (Email/Password)
 * - Multi-Step Register with Simulated Gmail OTP Verification & Password Strength
 * - Simulated Google 1-Click Sign-In
 * - User Profile Dashboard (Kupon Saya, Riwayat Pesanan, Alamat, Pengaturan, Avatar, Logout)
 * - Quick View Modal & WhatsApp Checkout Simulation
 * - Toast Notification System
 */

// Product Data
const PRODUCTS = [
  {
    id: 'gayo',
    name: 'Arabica Gayo',
    origin: 'Gayo, Aceh',
    island: 'sumatra',
    category: 'beans',
    price: 120000,
    image: './assets/product_gayo.jpg',
    notes: ['Floral', 'Citrus', 'Brown Sugar'],
    roast: 'Medium Dark Roast',
    altitude: '1.400 - 1.600 mdpl',
    process: 'Wet Hulled (Giling Basah)',
    description: 'Arabica Gayo legendaris dari dataran tinggi Aceh dengan aroma floral wangi, keasaman segar buah jeruk, dan aftertaste manis karamel yang lembut dan seimbang.'
  },
  {
    id: 'mandailing',
    name: 'Mandailing',
    origin: 'Mandailing, Sumatra',
    island: 'sumatra',
    category: 'beans',
    price: 170000,
    image: './assets/product_mandailing.jpg',
    notes: ['Dark Chocolate', 'Earthy', 'Cedar'],
    roast: 'Dark Roast',
    altitude: '1.200 - 1.500 mdpl',
    process: 'Semi-Washed',
    description: 'Kopi Mandailing Sumatra dengan body yang tebal, sensasi rasa cokelat hitam pekat, aroma rempah kayu cedar, dan keasaman rendah yang ramah di lambung.'
  },
  {
    id: 'java-preanger',
    name: 'Java Preanger',
    origin: 'Preanger, Jawa Barat',
    island: 'java',
    category: 'beans',
    price: 210000,
    image: './assets/product_java.jpg',
    notes: ['Sweet Jasmine', 'Green Apple', 'Honey'],
    roast: 'Medium Roast',
    altitude: '1.350 - 1.700 mdpl',
    process: 'Fully Washed',
    description: 'Kopi klasik Jawa Barat sejak era kolonial yang terkenal dengan aroma melati harum, sentuhan rasa apel segar madu alami, serta kejernihan rasa yang memukau.'
  },
  {
    id: 'toraja',
    name: 'Toraja',
    origin: 'Toraja, Sulawesi',
    island: 'sulawesi',
    category: 'beans',
    price: 195000,
    image: './assets/product_toraja.jpg',
    notes: ['Dark Berry', 'Cinnamon', 'Smooth Spice'],
    roast: 'Medium Dark Roast',
    altitude: '1.500 - 1.800 mdpl',
    process: 'Natural / Washed',
    description: 'Biji kopi eksotis dari pegunungan Toraja Sulawesi Selatan dengan karakteristik buah berry gelap, kehangatan kayu manis, dan sentuhan rempah halus yang elegan.'
  }
];

// App State
let cart = [];
let isPromoApplied = false;
let appliedPromoCode = '';
let currentFilter = 'all';
let selectedQuickViewGrind = 'Biji Utuh (Whole Bean)';

// User Auth & Session State
let currentUser = null;
let usersDatabase = [];
let ordersHistory = [];
let authPendingPromoCode = null;
let currentOtpCode = '';
let otpTimerInterval = null;
let pendingRegisterData = null;

// Format IDR Currency
function formatIDR(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// Initialize on DOM Loaded
document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  setupEventListeners();
  setupScrollSpy();
  loadUserFromStorage();
  loadOrdersFromStorage();
  loadCartFromStorage();
  setupOtpInputListeners();
  updateNavUserUI();
});

// ==========================================================================
// Product Catalog & Filter
// ==========================================================================

function renderProducts(filter = 'all') {
  const container = document.getElementById('productsContainer');
  if (!container) return;

  const filtered = filter === 'all' 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.island === filter || p.category === filter);

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 48px 0; color: var(--color-text-muted);">
        <p style="font-size: 1.1rem; font-weight: 600;">Tidak ada produk yang cocok dengan kategori ini.</p>
        <button class="btn btn-outline" style="margin-top: 16px;" onclick="setProductFilter('all')">Lihat Semua Kopi</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(product => `
    <div class="product-card" data-id="${product.id}">
      <div class="product-image-container">
        <img src="${product.image}" alt="${product.name} - ${product.origin}" class="product-card-img" loading="lazy">
        <div class="product-origin-badge">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
          ${product.origin}
        </div>
        <button class="product-quick-btn" onclick="openQuickView('${product.id}')" aria-label="Lihat detail ${product.name}">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>
      </div>
      <div class="product-card-body">
        <div class="product-notes-chips">
          ${product.notes.map(n => `<span class="note-chip">${n}</span>`).join('')}
        </div>
        <h3 class="product-card-title">${product.name}</h3>
        <span class="product-card-origin">${product.roast} • 250g</span>
        
        <div class="product-card-footer">
          <div class="product-price-box">
            <span class="price-label">Harga</span>
            <span class="product-card-price">${formatIDR(product.price)}</span>
          </div>
          <button class="btn-add-cart" onclick="addToCart('${product.id}')">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function setProductFilter(filter) {
  currentFilter = filter;
  const pills = document.querySelectorAll('.filter-pill');
  pills.forEach(pill => {
    const text = pill.textContent.toLowerCase();
    if (filter === 'all' && text.includes('semua')) {
      pill.classList.add('active');
    } else if (text.includes(filter)) {
      pill.classList.add('active');
    } else {
      pill.classList.remove('active');
    }
  });

  renderProducts(filter);
}

function filterByCategory(category) {
  const shopSection = document.getElementById('shop');
  if (shopSection) {
    shopSection.scrollIntoView({ behavior: 'smooth' });
  }

  showToast(`Menampilkan koleksi pilihan kategori`, '☕');
  setProductFilter('all');
}

// ==========================================================================
// Cart Management
// ==========================================================================

function addToCart(productId, grind = 'Biji Utuh (Whole Bean)', qty = 1) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const existingItemIndex = cart.findIndex(item => item.id === productId && item.grind === grind);

  if (existingItemIndex > -1) {
    cart[existingItemIndex].qty += qty;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      origin: product.origin,
      price: product.price,
      image: product.image,
      grind: grind,
      qty: qty
    });
  }

  saveCartToStorage();
  updateCartUI();
  showToast(`${product.name} (${grind}) berhasil ditambahkan ke keranjang!`, '🛒');

  const badge = document.getElementById('cartCountBadge');
  if (badge) {
    badge.classList.remove('bump');
    void badge.offsetWidth;
    badge.classList.add('bump');
  }
}

function updateCartQty(index, delta) {
  if (!cart[index]) return;
  cart[index].qty += delta;

  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
    showToast('Produk dihapus dari keranjang', '🗑️');
  }

  saveCartToStorage();
  updateCartUI();
}

function removeCartItem(index) {
  if (!cart[index]) return;
  const removedName = cart[index].name;
  cart.splice(index, 1);
  saveCartToStorage();
  updateCartUI();
  showToast(`${removedName} dihapus dari keranjang`, '🗑️');
}

function updateCartUI() {
  const cartBadge = document.getElementById('cartCountBadge');
  const cartHeaderCount = document.getElementById('cartHeaderCount');
  const cartList = document.getElementById('cartItemsList');
  const cartSubtotalEl = document.getElementById('cartSubtotal');
  const cartDiscountRow = document.getElementById('cartDiscountRow');
  const cartDiscountAmountEl = document.getElementById('cartDiscountAmount');
  const cartTotalEl = document.getElementById('cartTotal');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const promoAlert = document.getElementById('cartPromoAlert');

  const totalCount = cart.reduce((acc, item) => acc + item.qty, 0);
  if (cartBadge) cartBadge.textContent = totalCount;
  if (cartHeaderCount) cartHeaderCount.textContent = `(${totalCount} item)`;

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const discountAmount = isPromoApplied ? Math.round(subtotal * 0.15) : 0;
  const total = subtotal - discountAmount;

  if (cartSubtotalEl) cartSubtotalEl.textContent = formatIDR(subtotal);
  if (cartTotalEl) cartTotalEl.textContent = formatIDR(total);

  if (cartDiscountRow) {
    if (isPromoApplied && subtotal > 0) {
      cartDiscountRow.style.display = 'flex';
      if (cartDiscountAmountEl) cartDiscountAmountEl.textContent = `-${formatIDR(discountAmount)}`;
    } else {
      cartDiscountRow.style.display = 'none';
    }
  }

  if (promoAlert) {
    if (isPromoApplied) {
      promoAlert.classList.add('applied');
      promoAlert.innerHTML = `
        <div class="cart-promo-left">
          <span class="tag-icon">🎉</span>
          <div>
            <strong>Diskon 15% Berhasil Diterapkan!</strong>
            <p class="cart-promo-sub">Kode Promo <strong>${appliedPromoCode}</strong> aktif</p>
          </div>
        </div>
      `;
    } else {
      promoAlert.classList.remove('applied');
      promoAlert.innerHTML = `
        <div class="cart-promo-left">
          <span class="tag-icon">🏷️</span>
          <div>
            <strong>Diskon 15% Pembelian Pertama</strong>
            <p class="cart-promo-sub">Gunakan kode <strong>BREW15</strong></p>
          </div>
        </div>
        <button class="cart-promo-apply-btn" onclick="claimPromo('BREW15')">Terapkan</button>
      `;
    }
  }

  if (!cartList) return;

  if (cart.length === 0) {
    cartList.innerHTML = `
      <div class="cart-empty-state">
        <div class="cart-empty-icon">☕</div>
        <h4 class="cart-empty-title">Keranjangmu Masih Kosong</h4>
        <p class="cart-empty-desc">Jelajahi koleksi kopi single origin terbaik kami dan temukan rasa favoritmu hari ini.</p>
        <button class="btn btn-primary" onclick="toggleCart(); document.getElementById('shop').scrollIntoView({behavior: 'smooth'});">
          Mulai Belanja Kopi
        </button>
      </div>
    `;
    if (checkoutBtn) checkoutBtn.disabled = true;
  } else {
    if (checkoutBtn) checkoutBtn.disabled = false;
    cartList.innerHTML = cart.map((item, idx) => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-info">
          <h4 class="cart-item-title">${item.name}</h4>
          <span class="cart-item-variant">${item.grind} • 250g</span>
          <span class="cart-item-price">${formatIDR(item.price)}</span>
          
          <div class="cart-item-actions">
            <div class="qty-control-group">
              <button class="qty-btn" onclick="updateCartQty(${idx}, -1)" aria-label="Kurang satu">-</button>
              <span class="qty-val">${item.qty}</span>
              <button class="qty-btn" onclick="updateCartQty(${idx}, 1)" aria-label="Tambah satu">+</button>
            </div>
            <button class="cart-item-remove" onclick="removeCartItem(${idx})">Hapus</button>
          </div>
        </div>
      </div>
    `).join('');
  }
}

function toggleCart(forceOpen = false) {
  const drawer = document.getElementById('cartDrawer');
  const backdrop = document.getElementById('drawerBackdrop');
  if (!drawer || !backdrop) return;

  if (forceOpen || !drawer.classList.contains('open')) {
    drawer.classList.add('open');
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  } else {
    drawer.classList.remove('open');
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function closeCart() {
  const drawer = document.getElementById('cartDrawer');
  const backdrop = document.getElementById('drawerBackdrop');
  if (drawer) drawer.classList.remove('open');
  if (backdrop && !document.getElementById('authModal').classList.contains('active') && !document.getElementById('profileModal').classList.contains('active')) {
    backdrop.classList.remove('active');
  }
  document.body.style.overflow = '';
}

function saveCartToStorage() {
  try {
    localStorage.setItem('brewtopia_cart', JSON.stringify(cart));
    localStorage.setItem('brewtopia_promo', JSON.stringify({ isPromoApplied, appliedPromoCode }));
  } catch (e) {
    console.warn('Storage not accessible', e);
  }
}

function loadCartFromStorage() {
  try {
    const savedCart = localStorage.getItem('brewtopia_cart');
    const savedPromo = localStorage.getItem('brewtopia_promo');
    if (savedCart) cart = JSON.parse(savedCart);
    if (savedPromo) {
      const p = JSON.parse(savedPromo);
      isPromoApplied = p.isPromoApplied;
      appliedPromoCode = p.appliedPromoCode;
    }
  } catch (e) {
    console.warn('Could not load cart', e);
  }
  updateCartUI();
}

// ==========================================================================
// Promo Code Logic (Protected with Auth)
// ==========================================================================

function claimPromo(code = 'BREW15') {
  // Requirement: User must log in to use or claim promo!
  if (!currentUser) {
    openAuthModal({ intent: 'promo', promoCode: code });
    return;
  }

  isPromoApplied = true;
  appliedPromoCode = code;
  saveCartToStorage();
  updateCartUI();

  showToast(`Kode Promo ${code} berhasil diklaim! Diskon 15% telah diterapkan.`, '🎉');

  const claimBtn = document.getElementById('claimPromoBtn');
  if (claimBtn) {
    claimBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span>Promo 15% Aktif!</span>
    `;
    claimBtn.style.backgroundColor = '#4CAF50';
    claimBtn.style.color = '#FFFFFF';
  }
}

// ==========================================================================
// Quick View Modal
// ==========================================================================

function openQuickView(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  selectedQuickViewGrind = 'Biji Utuh (Whole Bean)';

  const content = document.getElementById('quickViewContent');
  if (!content) return;

  content.innerHTML = `
    <div class="quickview-img-col">
      <img src="${product.image}" alt="${product.name}" class="quickview-img">
      <div class="quickview-badges">
        <span class="badge-single">${product.origin}</span>
        <span class="badge-score">Score 87+</span>
      </div>
    </div>

    <div class="quickview-details-col">
      <div class="quickview-header">
        <span class="product-origin-label">${product.island.toUpperCase()} • ${product.altitude}</span>
        <h2 class="quickview-title">${product.name}</h2>
        <div class="quickview-price-row">
          <span class="quickview-price">${formatIDR(product.price)}</span>
          <span class="quickview-weight">Kemasan Valve 250 gram</span>
        </div>
      </div>

      <div class="quickview-notes-box">
        <span class="notes-title">Flavor Notes:</span>
        <div class="notes-chips-list">
          ${product.notes.map(n => `<span class="note-chip">${n}</span>`).join('')}
        </div>
      </div>

      <p class="quickview-desc">${product.description}</p>

      <div class="quickview-specs-grid">
        <div class="spec-item">
          <span class="spec-label">Proses</span>
          <span class="spec-value">${product.process}</span>
        </div>
        <div class="spec-item">
          <span class="spec-label">Sangrai</span>
          <span class="spec-value">${product.roast}</span>
        </div>
      </div>

      <div class="quickview-grind-selector">
        <label class="grind-label">Pilih Tingkat Gilingan:</label>
        <div class="quickview-grind-options-grid">
          <button type="button" class="grind-option-btn active" onclick="setQuickViewGrind(this, 'Biji Utuh (Whole Bean)')">Biji Utuh</button>
          <button type="button" class="grind-option-btn" onclick="setQuickViewGrind(this, 'Giling Kasar (Cold Brew/French Press)')">Giling Kasar</button>
          <button type="button" class="grind-option-btn" onclick="setQuickViewGrind(this, 'Giling Sedang (V60/Aeropress)')">Giling Sedang</button>
          <button type="button" class="grind-option-btn" onclick="setQuickViewGrind(this, 'Giling Halus (Espresso/Mokapot)')">Giling Halus</button>
        </div>
      </div>

      <div class="quickview-actions">
        <button class="btn btn-primary btn-full" onclick="addQuickViewToCart('${product.id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <span>Tambah ke Keranjang • ${formatIDR(product.price)}</span>
        </button>
      </div>
    </div>
  `;

  const modal = document.getElementById('quickViewModal');
  const backdrop = document.getElementById('drawerBackdrop');
  if (modal && backdrop) {
    modal.classList.add('active');
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function setQuickViewGrind(btn, grind) {
  selectedQuickViewGrind = grind;
  const buttons = document.querySelectorAll('.grind-option-btn');
  buttons.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function addQuickViewToCart(productId) {
  addToCart(productId, selectedQuickViewGrind, 1);
  closeQuickView();
  toggleCart(true);
}

function closeQuickView() {
  const modal = document.getElementById('quickViewModal');
  const backdrop = document.getElementById('drawerBackdrop');
  if (modal) modal.classList.remove('active');
  if (backdrop && !document.getElementById('cartDrawer').classList.contains('open') && !document.getElementById('authModal').classList.contains('active') && !document.getElementById('profileModal').classList.contains('active')) {
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// ==========================================================================
// Checkout Modal & WhatsApp Order Simulator
// ==========================================================================

function openCheckoutModal() {
  if (cart.length === 0) return;

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const discountAmount = isPromoApplied ? Math.round(subtotal * 0.15) : 0;
  const total = subtotal - discountAmount;

  const detailsBox = document.getElementById('checkoutDetailsBox');
  if (detailsBox) {
    detailsBox.innerHTML = `
      <div style="margin-bottom: 12px;">
        <strong>Rincian Pesanan:</strong>
        <ul style="margin: 8px 0 0 20px; list-style: circle; color: var(--color-text-muted);">
          ${cart.map(item => `
            <li>${item.name} (${item.grind}) x ${item.qty} — <strong>${formatIDR(item.price * item.qty)}</strong></li>
          `).join('')}
        </ul>
      </div>
      <div style="border-top: 1px dashed var(--color-cream-border); padding-top: 8px; margin-top: 8px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span>Subtotal</span>
          <span>${formatIDR(subtotal)}</span>
        </div>
        ${isPromoApplied ? `
          <div style="display: flex; justify-content: space-between; color: var(--color-success); margin-bottom: 4px;">
            <span>Diskon Promo (${appliedPromoCode})</span>
            <span>-${formatIDR(discountAmount)}</span>
          </div>
        ` : ''}
        <div style="display: flex; justify-content: space-between; font-weight: 800; color: var(--color-dark-brown); font-size: 1.05rem; margin-top: 6px;">
          <span>Total Akhir</span>
          <span>${formatIDR(total)}</span>
        </div>
      </div>
    `;
  }

  const confirmBtn = document.getElementById('confirmWhatsAppCheckoutBtn');
  if (confirmBtn) {
    let message = `Halo BrewTopia, saya ingin memesan kopi premium:%0A%0A`;
    cart.forEach((item, idx) => {
      message += `${idx + 1}. ${item.name} (${item.grind}) x ${item.qty} = ${formatIDR(item.price * item.qty)}%0A`;
    });
    message += `%0ASubtotal: ${formatIDR(subtotal)}`;
    if (isPromoApplied) {
      message += `%0ADiskon (${appliedPromoCode} 15%): -${formatIDR(discountAmount)}`;
    }
    message += `%0ATotal Pembayaran: ${formatIDR(total)}%0A%0AMohon info ketersediaan dan nomor rekening/QRIS untuk transfer. Terima kasih!`;

    confirmBtn.onclick = () => {
      const newOrder = {
        id: `BT-${Math.floor(10000 + Math.random() * 90000)}`,
        date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
        items: [...cart],
        subtotal: subtotal,
        discount: discountAmount,
        total: total,
        status: 'processing',
        statusLabel: 'Sedang Diproses ⏳'
      };
      ordersHistory.unshift(newOrder);
      saveOrdersToStorage();

      if (currentUser) {
        currentUser.points = (currentUser.points || 0) + 50;
        saveUserToStorage();
        updateNavUserUI();
      }

      window.open(`https://wa.me/6281234567890?text=${message}`, '_blank');
      showToast('Pesanan tersimpan di Riwayat & WhatsApp dibuka! +50 BrewPoints ☕', '💬');
      closeCheckoutModal();
      cart = [];
      saveCartToStorage();
      updateCartUI();
    };
  }

  const modal = document.getElementById('checkoutModal');
  const backdrop = document.getElementById('drawerBackdrop');
  if (modal && backdrop) {
    modal.classList.add('active');
    backdrop.classList.add('active');
  }
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkoutModal');
  if (modal) modal.classList.remove('active');
}

// ==========================================================================
// Live Search & Autocomplete
// ==========================================================================

function setupSearch() {
  const searchInput = document.getElementById('searchInput');
  const clearBtn = document.getElementById('searchClearBtn');
  const dropdown = document.getElementById('searchDropdown');
  const resultsList = document.getElementById('searchResultsList');

  if (!searchInput || !resultsList || !dropdown) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();

    if (query.length > 0) {
      if (clearBtn) clearBtn.classList.add('visible');
      const matches = PRODUCTS.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.origin.toLowerCase().includes(query) ||
        p.notes.some(n => n.toLowerCase().includes(query)) ||
        p.roast.toLowerCase().includes(query)
      );

      if (matches.length > 0) {
        resultsList.innerHTML = matches.map(m => `
          <div class="search-item" onclick="selectSearchResult('${m.id}')">
            <img src="${m.image}" alt="${m.name}" class="search-item-img">
            <div class="search-item-info">
              <h5 class="search-item-title">${m.name}</h5>
              <span class="search-item-price">${formatIDR(m.price)} • ${m.origin}</span>
            </div>
          </div>
        `).join('');
      } else {
        resultsList.innerHTML = `
          <div class="search-empty">
            Tidak ditemukan hasil untuk "<strong>${query}</strong>"
          </div>
        `;
      }
      dropdown.classList.add('active');
    } else {
      if (clearBtn) clearBtn.classList.remove('visible');
      dropdown.classList.remove('active');
    }
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      clearBtn.classList.remove('visible');
      dropdown.classList.remove('active');
      searchInput.focus();
    });
  }

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#searchWrapper')) {
      dropdown.classList.remove('active');
    }
  });
}

function selectSearchResult(productId) {
  const dropdown = document.getElementById('searchDropdown');
  if (dropdown) dropdown.classList.remove('active');
  openQuickView(productId);
}

// ==========================================================================
// User Authentication & Session Logic
// ==========================================================================

function saveUserToStorage() {
  try {
    if (currentUser) {
      localStorage.setItem('brewtopia_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('brewtopia_user');
    }
    localStorage.setItem('brewtopia_users_db', JSON.stringify(usersDatabase));
  } catch (e) {
    console.warn('Storage not accessible', e);
  }
}

function loadUserFromStorage() {
  try {
    const savedDb = localStorage.getItem('brewtopia_users_db');
    if (savedDb) {
      usersDatabase = JSON.parse(savedDb);
    } else {
      usersDatabase = [
        {
          name: 'Dana Yoga',
          email: 'danayoga@gmail.com',
          phone: '0812-3456-7890',
          password: 'kopi',
          avatar: '☕',
          avatarBg: '#8B5A2B',
          tier: 'Gold Member',
          points: 1250,
          memberSince: 'Ags 2026',
          address: {
            recipient: 'Dana Yoga',
            phone: '0812-3456-7890',
            label: 'Rumah',
            street: 'Jl. Senopati Raya No. 45, Kebayoran Baru, Jakarta Selatan 12190'
          },
          favCoffee: 'gayo',
          prefWa: true
        }
      ];
      localStorage.setItem('brewtopia_users_db', JSON.stringify(usersDatabase));
    }

    const savedUser = localStorage.getItem('brewtopia_user');
    if (savedUser) {
      currentUser = JSON.parse(savedUser);
    }
  } catch (e) {
    console.warn('Could not load user data', e);
  }
}

function loadOrdersFromStorage() {
  try {
    const savedOrders = localStorage.getItem('brewtopia_orders_history');
    if (savedOrders) {
      ordersHistory = JSON.parse(savedOrders);
    } else {
      ordersHistory = [
        {
          id: 'BT-88291',
          date: '18 Ags 2026',
          items: [
            { name: 'Arabica Gayo', grind: 'Biji Utuh (Whole Bean)', qty: 2, price: 120000, image: './assets/product_gayo.jpg' },
            { name: 'Toraja Specialty', grind: 'Giling Halus', qty: 1, price: 195000, image: './assets/product_toraja.jpg' }
          ],
          subtotal: 435000,
          discount: 0,
          total: 435000,
          status: 'shipping',
          statusLabel: 'Sedang Dikirim 🚚'
        },
        {
          id: 'BT-77104',
          date: '02 Ags 2026',
          items: [
            { name: 'Java Preanger', grind: 'Giling Sedang', qty: 1, price: 210000, image: './assets/product_java.jpg' }
          ],
          subtotal: 210000,
          discount: 31500,
          total: 178500,
          status: 'completed',
          statusLabel: 'Selesai ✅'
        }
      ];
      localStorage.setItem('brewtopia_orders_history', JSON.stringify(ordersHistory));
    }
  } catch (e) {
    console.warn('Could not load orders history', e);
  }
}

function saveOrdersToStorage() {
  try {
    localStorage.setItem('brewtopia_orders_history', JSON.stringify(ordersHistory));
  } catch (e) {
    console.warn('Storage not accessible', e);
  }
}

function updateNavUserUI() {
  const navUserBtn = document.getElementById('navUserBtn');
  const userAvatarMini = document.getElementById('userAvatarMini');
  const userNavLabel = document.getElementById('userNavLabel');

  const mobileUserAvatar = document.getElementById('mobileUserAvatar');
  const mobileUserName = document.getElementById('mobileUserName');
  const mobileUserSubtitle = document.getElementById('mobileUserSubtitle');

  if (currentUser) {
    if (navUserBtn) navUserBtn.classList.add('logged-in');
    if (userAvatarMini) {
      if (currentUser.avatar && currentUser.avatar.length <= 2) {
        userAvatarMini.textContent = currentUser.avatar;
        userAvatarMini.style.backgroundColor = currentUser.avatarBg || '#8B5A2B';
      } else {
        const initials = currentUser.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
        userAvatarMini.textContent = initials || '☕';
      }
    }
    if (userNavLabel) {
      userNavLabel.textContent = currentUser.name.split(' ')[0];
    }

    if (mobileUserAvatar) {
      if (currentUser.avatar && currentUser.avatar.length <= 2) {
        mobileUserAvatar.textContent = currentUser.avatar;
        mobileUserAvatar.style.backgroundColor = currentUser.avatarBg || '#8B5A2B';
      } else {
        mobileUserAvatar.textContent = currentUser.name.slice(0, 2).toUpperCase();
      }
    }
    if (mobileUserName) mobileUserName.textContent = currentUser.name;
    if (mobileUserSubtitle) mobileUserSubtitle.textContent = `☕ ${currentUser.points || 1250} BrewPoints • ${currentUser.tier || 'Gold'}`;
  } else {
    if (navUserBtn) navUserBtn.classList.remove('logged-in');
    if (userAvatarMini) {
      userAvatarMini.innerHTML = `
        <svg class="action-icon user-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      `;
      userAvatarMini.style.backgroundColor = '#8B5A2B';
    }
    if (userNavLabel) userNavLabel.textContent = 'Masuk / Daftar';

    if (mobileUserAvatar) {
      mobileUserAvatar.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      `;
      mobileUserAvatar.style.backgroundColor = '#8B5A2B';
    }
    if (mobileUserName) mobileUserName.textContent = 'Masuk / Daftar';
    if (mobileUserSubtitle) mobileUserSubtitle.textContent = 'Klaim Diskon 15% & Poin Kopi';
  }
}

function handleUserNavClick() {
  if (currentUser) {
    openProfileModal();
  } else {
    openAuthModal({ intent: 'normal' });
  }
}

// ==========================================================================
// Auth Modal & Multi-Step Logic
// ==========================================================================

function openAuthModal({ intent = 'normal', promoCode = 'BREW15' } = {}) {
  const modal = document.getElementById('authModal');
  const backdrop = document.getElementById('drawerBackdrop');
  const intentBox = document.getElementById('authPromoIntentBox');
  const promoTag = document.getElementById('authPromoCodeTag');
  const promoMsg = document.getElementById('authPromoIntentMessage');

  if (!modal || !backdrop) return;

  if (intent === 'promo') {
    authPendingPromoCode = promoCode;
    if (intentBox) intentBox.style.display = 'flex';
    if (promoTag) promoTag.textContent = promoCode;
    if (promoMsg) {
      promoMsg.innerHTML = `Masuk atau Buat Akun terlebih dahulu untuk menggunakan promo <span class="promo-code-badge">${promoCode}</span> dan nikmati potongan belanja.`;
    }
  } else {
    authPendingPromoCode = null;
    if (intentBox) intentBox.style.display = 'none';
  }

  switchAuthTab('login');
  modal.classList.add('active');
  backdrop.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  const backdrop = document.getElementById('drawerBackdrop');
  if (modal) modal.classList.remove('active');
  if (backdrop && !document.getElementById('cartDrawer').classList.contains('open') && !document.getElementById('profileModal').classList.contains('active')) {
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }
  if (otpTimerInterval) {
    clearInterval(otpTimerInterval);
    otpTimerInterval = null;
  }
}

function switchAuthTab(tab) {
  const tabBtnLogin = document.getElementById('tabBtnLogin');
  const tabBtnRegister = document.getElementById('tabBtnRegister');
  const panelLogin = document.getElementById('authPanelLogin');
  const panelRegister = document.getElementById('authPanelRegister');

  if (tab === 'login') {
    if (tabBtnLogin) tabBtnLogin.classList.add('active');
    if (tabBtnRegister) tabBtnRegister.classList.remove('active');
    if (panelLogin) panelLogin.classList.add('active');
    if (panelRegister) panelRegister.classList.remove('active');
  } else {
    if (tabBtnLogin) tabBtnLogin.classList.remove('active');
    if (tabBtnRegister) tabBtnRegister.classList.add('active');
    if (panelLogin) panelLogin.classList.remove('active');
    if (panelRegister) panelRegister.classList.add('active');
    goToRegisterStep(1);
  }
}

function togglePasswordVisibility(inputId, btnEl) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    btnEl.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="eye-icon"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
  } else {
    input.type = 'password';
    btnEl.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="eye-icon"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
  }
}

function showForgotPasswordAlert() {
  const email = document.getElementById('loginEmail')?.value || 'email Anda';
  showToast(`Tautan pemulihan kata sandi telah dikirim ke ${email}. Periksa kotak masuk Gmail Anda.`, '🔑');
}

function handleLoginSubmit(e) {
  e.preventDefault();
  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');

  const email = emailInput?.value.trim().toLowerCase();
  const password = passwordInput?.value.trim();

  if (!email || !password) {
    showToast('Harap masukkan email dan kata sandi Anda.', '⚠️');
    return;
  }

  let user = usersDatabase.find(u => u.email.toLowerCase() === email);
  if (!user) {
    const namePart = email.split('@')[0].replace('.', ' ');
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    user = {
      name: formattedName || 'Kawan Kopi',
      email: email,
      phone: '0812-3456-7890',
      password: password,
      avatar: '☕',
      avatarBg: '#8B5A2B',
      tier: 'Gold Member',
      points: 1250,
      memberSince: 'Ags 2026',
      address: {
        recipient: formattedName || 'Kawan Kopi',
        phone: '0812-3456-7890',
        label: 'Rumah',
        street: 'Jl. Senopati Raya No. 45, Kebayoran Baru, Jakarta Selatan 12190'
      },
      favCoffee: 'gayo',
      prefWa: true
    };
    usersDatabase.push(user);
  }

  currentUser = user;
  saveUserToStorage();
  updateNavUserUI();
  closeAuthModal();

  showToast(`Selamat datang kembali, ${currentUser.name}! ☕`, '✨');
  proceedAfterAuth();
}

// ==========================================================================
// Multi-Step Registration & Gmail OTP Simulation
// ==========================================================================

function goToRegisterStep(step) {
  for (let i = 1; i <= 4; i++) {
    const stepEl = document.getElementById(`regStep${i}`);
    const indicatorEl = document.getElementById(`stepIndicator${i}`);
    const lineEl = document.getElementById(`stepLine${i}`);

    if (stepEl) {
      if (i === step) {
        stepEl.classList.add('active');
      } else {
        stepEl.classList.remove('active');
      }
    }

    if (indicatorEl) {
      if (i < step) {
        indicatorEl.classList.add('completed');
        indicatorEl.classList.remove('active');
      } else if (i === step) {
        indicatorEl.classList.add('active');
        indicatorEl.classList.remove('completed');
      } else {
        indicatorEl.classList.remove('active', 'completed');
      }
    }

    if (lineEl) {
      if (i < step) {
        lineEl.classList.add('active');
      } else {
        lineEl.classList.remove('active');
      }
    }
  }

  if (step === 2) {
    setTimeout(() => {
      const firstOtp = document.querySelector('.otp-digit-input[data-index="0"]');
      if (firstOtp) firstOtp.focus();
    }, 150);
  } else if (step === 3) {
    setTimeout(() => {
      const pwd = document.getElementById('newPasswordInput');
      if (pwd) pwd.focus();
    }, 150);
  }
}

function handleRegisterStep1Submit(e) {
  e.preventDefault();
  const nameInput = document.getElementById('regFullName');
  const emailInput = document.getElementById('regEmail');
  const phoneInput = document.getElementById('regPhone');

  const fullName = nameInput?.value.trim();
  const email = emailInput?.value.trim().toLowerCase();
  const phone = phoneInput?.value.trim() || '0812-3456-7890';

  if (!fullName || !email) {
    showToast('Harap masukkan nama lengkap dan alamat Gmail.', '⚠️');
    return;
  }

  if (!email.includes('@') || !email.includes('.')) {
    showToast('Format email tidak valid. Pastikan menyertakan @ dan domain.', '⚠️');
    return;
  }

  currentOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
  pendingRegisterData = { fullName, email, phone };

  const targetBadge = document.getElementById('targetEmailBadge');
  if (targetBadge) {
    targetBadge.innerHTML = `
      <span>${email}</span>
      <button type="button" class="btn-change-email" onclick="goToRegisterStep(1)">Ubah</button>
    `;
  }

  const gmailBanner = document.getElementById('gmailNotificationBanner');
  const gmailOtpCodeDisplay = document.getElementById('gmailOtpCodeDisplay');
  if (gmailOtpCodeDisplay) gmailOtpCodeDisplay.textContent = currentOtpCode;

  if (gmailBanner) {
    gmailBanner.classList.add('show');
  }

  startOtpCountdown();

  const otpInputs = document.querySelectorAll('.otp-digit-input');
  otpInputs.forEach(input => input.value = '');

  goToRegisterStep(2);
  showToast(`Kode OTP 6-digit telah dikirim ke ${email}!`, '📩');
}

function startOtpCountdown() {
  if (otpTimerInterval) clearInterval(otpTimerInterval);
  let timeLeft = 60;

  const secondsEl = document.getElementById('otpTimerSeconds');
  const countdownText = document.getElementById('otpCountdownText');
  const resendBtn = document.getElementById('btnResendOtp');

  if (secondsEl) secondsEl.textContent = timeLeft;
  if (countdownText) countdownText.style.display = 'inline';
  if (resendBtn) resendBtn.style.display = 'none';

  otpTimerInterval = setInterval(() => {
    timeLeft--;
    if (secondsEl) secondsEl.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(otpTimerInterval);
      otpTimerInterval = null;
      if (countdownText) countdownText.style.display = 'none';
      if (resendBtn) resendBtn.style.display = 'inline';
    }
  }, 1000);
}

function resendGmailOTP() {
  currentOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const gmailOtpCodeDisplay = document.getElementById('gmailOtpCodeDisplay');
  if (gmailOtpCodeDisplay) gmailOtpCodeDisplay.textContent = currentOtpCode;

  const gmailBanner = document.getElementById('gmailNotificationBanner');
  if (gmailBanner) gmailBanner.classList.add('show');

  startOtpCountdown();
  showToast('Kode OTP baru telah dikirimkan ke Gmail!', '🔄');
}

function dismissGmailNotification() {
  const gmailBanner = document.getElementById('gmailNotificationBanner');
  if (gmailBanner) gmailBanner.classList.remove('show');
}

function autoFillOTP() {
  if (!currentOtpCode) return;
  const otpInputs = document.querySelectorAll('.otp-digit-input');
  currentOtpCode.split('').forEach((char, idx) => {
    if (otpInputs[idx]) otpInputs[idx].value = char;
  });
  dismissGmailNotification();
  showToast('Kode OTP berhasil disalin dan diisi!', '📋');
  
  const verifyBtn = document.getElementById('btnVerifyOtp');
  if (verifyBtn) verifyBtn.focus();
}

function setupOtpInputListeners() {
  const inputs = document.querySelectorAll('.otp-digit-input');
  inputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
      const val = e.target.value;
      if (val.length === 1 && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && index > 0) {
        inputs[index - 1].focus();
      }
    });

    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const pasteData = (e.clipboardData || window.clipboardData).getData('text').trim();
      if (/^\d{6}$/.test(pasteData)) {
        pasteData.split('').forEach((char, i) => {
          if (inputs[i]) inputs[i].value = char;
        });
        if (inputs[5]) inputs[5].focus();
      }
    });
  });
}

function handleOtpVerificationSubmit(e) {
  e.preventDefault();
  const inputs = document.querySelectorAll('.otp-digit-input');
  const enteredOtp = Array.from(inputs).map(i => i.value).join('');

  if (enteredOtp.length !== 6) {
    showToast('Harap masukkan 6 digit kode OTP secara lengkap.', '⚠️');
    return;
  }

  if (enteredOtp === currentOtpCode || enteredOtp === '123456') {
    dismissGmailNotification();
    showToast('Verifikasi Gmail Berhasil! Silakan buat kata sandi.', '✅');
    goToRegisterStep(3);
  } else {
    showToast('Kode verifikasi salah. Silakan periksa kembali Gmail Anda.', '❌');
    inputs.forEach(i => {
      i.style.borderColor = '#d32f2f';
      setTimeout(() => i.style.borderColor = '', 1500);
    });
  }
}

function evaluatePasswordStrength(pwd) {
  const bar = document.getElementById('pwdStrengthBar');
  const label = document.getElementById('pwdStrengthLabel');
  if (!bar || !label) return;

  if (pwd.length === 0) {
    bar.className = 'pwd-strength-bar';
    label.textContent = 'Kekuatan: -';
    return;
  }

  let score = 0;
  if (pwd.length >= 6) score++;
  if (pwd.length >= 8) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[A-Z]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score++;

  if (score <= 2) {
    bar.className = 'pwd-strength-bar weak';
    label.textContent = 'Kekuatan: Lemah (tambahkan angka/panjang)';
    label.style.color = '#e53935';
  } else if (score === 3) {
    bar.className = 'pwd-strength-bar medium';
    label.textContent = 'Kekuatan: Sedang';
    label.style.color = '#fbc02d';
  } else {
    bar.className = 'pwd-strength-bar strong';
    label.textContent = 'Kekuatan: Sangat Kuat 👍';
    label.style.color = '#43a047';
  }
}

function handleCreatePasswordSubmit(e) {
  e.preventDefault();
  const pwdInput = document.getElementById('newPasswordInput');
  const confirmInput = document.getElementById('confirmPasswordInput');
  const termsAgreed = document.getElementById('regTermsAgreed');

  const password = pwdInput?.value;
  const confirmPassword = confirmInput?.value;

  if (!password || password.length < 6) {
    showToast('Kata sandi harus memiliki minimal 6 karakter.', '⚠️');
    return;
  }

  if (password !== confirmPassword) {
    showToast('Konfirmasi kata sandi tidak cocok.', '❌');
    return;
  }

  if (!termsAgreed || !termsAgreed.checked) {
    showToast('Harap setujui Syarat & Ketentuan serta Kebijakan Privasi.', '⚠️');
    return;
  }

  const newUser = {
    name: pendingRegisterData?.fullName || 'Dana Yoga',
    email: pendingRegisterData?.email || 'user@gmail.com',
    phone: pendingRegisterData?.phone || '0812-3456-7890',
    password: password,
    avatar: '☕',
    avatarBg: '#8B5A2B',
    tier: 'Gold Member',
    points: 100,
    memberSince: new Date().toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
    address: {
      recipient: pendingRegisterData?.fullName || 'Dana Yoga',
      phone: pendingRegisterData?.phone || '0812-3456-7890',
      label: 'Rumah',
      street: 'Jl. Senopati Raya No. 45, Kebayoran Baru, Jakarta Selatan 12190'
    },
    favCoffee: 'gayo',
    prefWa: true
  };

  usersDatabase.push(newUser);
  currentUser = newUser;
  saveUserToStorage();
  updateNavUserUI();

  const successName = document.getElementById('successUserName');
  if (successName) successName.textContent = newUser.name;

  isPromoApplied = true;
  appliedPromoCode = authPendingPromoCode || 'BREW15';
  saveCartToStorage();
  updateCartUI();

  goToRegisterStep(4);
}

function proceedAfterAuth() {
  if (authPendingPromoCode) {
    isPromoApplied = true;
    appliedPromoCode = authPendingPromoCode;
    saveCartToStorage();
    updateCartUI();
    showToast(`Promo ${appliedPromoCode} diskon 15% telah aktif di akun Anda!`, '🎉');
    authPendingPromoCode = null;
  }
}

// ==========================================================================
// Google Account Picker Simulation
// ==========================================================================

function openGoogleAccountPicker() {
  const modal = document.getElementById('googleModal');
  const backdrop = document.getElementById('drawerBackdrop');
  if (modal && backdrop) {
    modal.classList.add('active');
    backdrop.classList.add('active');
  }
}

function closeGoogleModal() {
  const modal = document.getElementById('googleModal');
  if (modal) modal.classList.remove('active');
}

function loginWithGoogleAccount(name, email, photoUrl) {
  closeGoogleModal();
  closeAuthModal();

  let user = usersDatabase.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    user = {
      name: name,
      email: email,
      phone: '0812-3456-7890',
      password: 'google_auth_oauth',
      avatar: '☕',
      avatarBg: '#4285F4',
      tier: 'Gold Member',
      points: 1250,
      memberSince: 'Ags 2026',
      address: {
        recipient: name,
        phone: '0812-3456-7890',
        label: 'Rumah',
        street: 'Jl. Senopati Raya No. 45, Kebayoran Baru, Jakarta Selatan 12190'
      },
      favCoffee: 'gayo',
      prefWa: true
    };
    usersDatabase.push(user);
  }

  currentUser = user;
  saveUserToStorage();
  updateNavUserUI();

  showToast(`Masuk dengan Google berhasil! Selamat datang, ${name} ✨`, '🌐');
  proceedAfterAuth();
}

function promptCustomGoogleAccount() {
  const email = prompt('Masukkan alamat Gmail Anda:', 'nama.kopi@gmail.com');
  if (email && email.includes('@')) {
    const namePart = email.split('@')[0];
    const name = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    loginWithGoogleAccount(name, email, '');
  }
}

// ==========================================================================
// User Profile Dashboard Modal Logic
// ==========================================================================

function openProfileModal() {
  if (!currentUser) {
    openAuthModal();
    return;
  }

  renderProfileData();
  switchProfileTab('vouchers');

  const modal = document.getElementById('profileModal');
  const backdrop = document.getElementById('drawerBackdrop');
  if (modal && backdrop) {
    modal.classList.add('active');
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeProfileModal() {
  const modal = document.getElementById('profileModal');
  const backdrop = document.getElementById('drawerBackdrop');
  const dropdown = document.getElementById('avatarPickerDropdown');
  if (dropdown) dropdown.style.display = 'none';

  if (modal) modal.classList.remove('active');
  if (backdrop && !document.getElementById('cartDrawer').classList.contains('open')) {
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function renderProfileData() {
  if (!currentUser) return;

  const profileAvatarDisplay = document.getElementById('profileAvatarDisplay');
  const profileNameDisplay = document.getElementById('profileNameDisplay');
  const profileEmailDisplay = document.getElementById('profileEmailDisplay');
  const profilePointsBalance = document.getElementById('profilePointsBalance');
  const profileMemberSince = document.getElementById('profileMemberSince');
  const profileTierPill = document.getElementById('profileTierPill');

  if (profileAvatarDisplay) {
    profileAvatarDisplay.textContent = currentUser.avatar || '☕';
    profileAvatarDisplay.style.backgroundColor = currentUser.avatarBg || '#8B5A2B';
  }

  if (profileNameDisplay) profileNameDisplay.textContent = currentUser.name;
  if (profileEmailDisplay) profileEmailDisplay.textContent = currentUser.email;
  if (profilePointsBalance) profilePointsBalance.textContent = (currentUser.points || 1250).toLocaleString('id-ID');
  if (profileMemberSince) profileMemberSince.textContent = `Member sejak ${currentUser.memberSince || 'Ags 2026'}`;
  if (profileTierPill) profileTierPill.textContent = `☕ ${currentUser.tier || 'Gold Coffee Connoisseur'}`;

  const recipientName = document.getElementById('addressRecipientName');
  const recipientPhone = document.getElementById('addressRecipientPhone');
  const recipientStreet = document.getElementById('addressRecipientStreet');

  if (currentUser.address) {
    if (recipientName) recipientName.textContent = currentUser.address.recipient || currentUser.name;
    if (recipientPhone) recipientPhone.textContent = currentUser.address.phone || currentUser.phone;
    if (recipientStreet) recipientStreet.textContent = currentUser.address.street;
  }

  const editName = document.getElementById('editProfileName');
  const editPhone = document.getElementById('editProfilePhone');
  const editFav = document.getElementById('editProfileFavCoffee');
  const editWa = document.getElementById('prefPromoWa');

  if (editName) editName.value = currentUser.name;
  if (editPhone) editPhone.value = currentUser.phone || '';
  if (editFav) editFav.value = currentUser.favCoffee || 'gayo';
  if (editWa) editWa.checked = currentUser.prefWa !== false;

  renderOrdersHistory();
}

function switchProfileTab(tabName) {
  const tabs = ['vouchers', 'orders', 'address', 'settings'];
  tabs.forEach(t => {
    const btn = document.getElementById(`profTabBtn${t.charAt(0).toUpperCase() + t.slice(1)}`);
    const content = document.getElementById(`profileTab${t.charAt(0).toUpperCase() + t.slice(1)}`);
    if (btn) {
      if (t === tabName) btn.classList.add('active');
      else btn.classList.remove('active');
    }
    if (content) {
      if (t === tabName) content.classList.add('active');
      else content.classList.remove('active');
    }
  });
}

function toggleAvatarPicker() {
  const dropdown = document.getElementById('avatarPickerDropdown');
  if (!dropdown) return;
  dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
}

function selectAvatarPreset(icon, bg) {
  if (!currentUser) return;
  currentUser.avatar = icon;
  currentUser.avatarBg = bg;
  saveUserToStorage();
  updateNavUserUI();
  renderProfileData();

  const dropdown = document.getElementById('avatarPickerDropdown');
  if (dropdown) dropdown.style.display = 'none';
  showToast('Foto icon profil berhasil diperbarui!', '✨');
}

function renderOrdersHistory() {
  const container = document.getElementById('ordersListContainer');
  if (!container) return;

  if (ordersHistory.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 32px 16px; color: var(--color-text-muted);">
        <p style="font-size: 1rem; font-weight: 600;">Belum ada riwayat pesanan.</p>
        <p style="font-size: 0.84rem; margin-top: 4px;">Pesan kopi Nusantara favoritmu sekarang dan dapatkan BrewPoints!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = ordersHistory.map(order => `
    <div class="order-card">
      <div class="order-card-top">
        <div class="order-id-date">
          <strong>Pesanan #${order.id}</strong>
          <span>${order.date}</span>
        </div>
        <span class="order-status-badge ${order.status}">${order.statusLabel}</span>
      </div>

      <div class="order-items-summary">
        <div class="order-thumb-group">
          ${order.items.slice(0, 2).map(item => `
            <img src="${item.image || './assets/product_gayo.jpg'}" alt="${item.name}" class="order-item-thumb">
          `).join('')}
        </div>
        <div class="order-desc-items">
          <h5>${order.items[0]?.name} ${order.items.length > 1 ? `+ ${order.items.length - 1} produk lainnya` : ''}</h5>
          <p>${order.items.map(i => `${i.name} (${i.qty}x)`).join(', ')}</p>
        </div>
      </div>

      <div class="order-card-bottom">
        <div>
          <span class="order-total-label">Total Belanja</span>
          <div class="order-total-val">${formatIDR(order.total)}</div>
        </div>
        <button class="btn-reorder" onclick="reorderPreviousOrder('${order.id}')">
          <span>Pesan Lagi ☕</span>
        </button>
      </div>
    </div>
  `).join('');
}

function reorderPreviousOrder(orderId) {
  const order = ordersHistory.find(o => o.id === orderId);
  if (!order) return;

  order.items.forEach(item => {
    const existing = cart.find(c => c.name === item.name && c.grind === item.grind);
    if (existing) {
      existing.qty += item.qty;
    } else {
      cart.push({ ...item });
    }
  });

  saveCartToStorage();
  updateCartUI();
  closeProfileModal();
  toggleCart(true);
  showToast(`Produk dari pesanan #${orderId} telah dimasukkan ke keranjang!`, '🛒');
}

function applyCustomPromoFromProfile() {
  const input = document.getElementById('profileCustomPromoInput');
  const code = input?.value.trim().toUpperCase();

  if (!code) {
    showToast('Masukkan kode promo yang ingin digunakan.', '⚠️');
    return;
  }

  claimPromo(code);
  closeProfileModal();
  toggleCart(true);
}

function openRedeemPointsModal() {
  if (!currentUser) return;
  if ((currentUser.points || 0) < 500) {
    showToast(`Poin Anda (${currentUser.points}) belum mencukupi. Minimal 500 BrewPoints untuk ditukar dengan voucher.`, 'ℹ️');
  } else {
    currentUser.points -= 500;
    saveUserToStorage();
    renderProfileData();
    updateNavUserUI();
    showToast('Berhasil menukar 500 BrewPoints! Voucher diskon Rp25.000 telah ditambahkan ke akun Anda.', '🎁');
  }
}

function showAddAddressAlert() {
  const newStreet = prompt('Masukkan alamat pengiriman baru:', 'Jl. Sudirman No. 10, Jakarta Pusat 10220');
  if (newStreet && currentUser) {
    currentUser.address.street = newStreet;
    saveUserToStorage();
    renderProfileData();
    showToast('Alamat baru berhasil ditambahkan dan dijadikan alamat utama.', '📍');
  }
}

function showEditAddressModal() {
  const currentStreet = currentUser?.address?.street || 'Jl. Senopati Raya No. 45, Jakarta Selatan';
  const updated = prompt('Ubah alamat pengiriman:', currentStreet);
  if (updated && currentUser) {
    currentUser.address.street = updated;
    saveUserToStorage();
    renderProfileData();
    showToast('Alamat pengiriman berhasil diperbarui!', '✅');
  }
}

function handleProfileSettingsSave(e) {
  e.preventDefault();
  if (!currentUser) return;

  const name = document.getElementById('editProfileName')?.value.trim();
  const phone = document.getElementById('editProfilePhone')?.value.trim();
  const favCoffee = document.getElementById('editProfileFavCoffee')?.value;
  const prefWa = document.getElementById('prefPromoWa')?.checked;

  if (name) currentUser.name = name;
  if (phone) currentUser.phone = phone;
  if (favCoffee) currentUser.favCoffee = favCoffee;
  currentUser.prefWa = prefWa;

  saveUserToStorage();
  renderProfileData();
  updateNavUserUI();
  showToast('Pengaturan profil berhasil disimpan!', '💾');
}

function handleLogoutClick() {
  if (confirm('Apakah Anda yakin ingin keluar dari akun BrewTopia?')) {
    currentUser = null;
    isPromoApplied = false;
    appliedPromoCode = '';
    saveUserToStorage();
    saveCartToStorage();
    updateCartUI();
    updateNavUserUI();
    closeProfileModal();
    showToast('Anda telah keluar dari akun BrewTopia. Sampai jumpa kembali! ☕', '👋');
  }
}

function closeMobileMenu() {
  closeMobileNav();
}

// ==========================================================================
// Toast System
// ==========================================================================

function showToast(message, icon = '☕') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px) scale(0.9)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ==========================================================================
// Event Listeners & Navigation
// ==========================================================================

function setupEventListeners() {
  const cartToggleBtn = document.getElementById('cartToggleBtn');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const backdrop = document.getElementById('drawerBackdrop');

  if (cartToggleBtn) cartToggleBtn.addEventListener('click', () => toggleCart());
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);

  const closeQuickViewBtn = document.getElementById('closeQuickViewBtn');
  if (closeQuickViewBtn) closeQuickViewBtn.addEventListener('click', closeQuickView);

  const closeCheckoutBtn = document.getElementById('closeCheckoutBtn');
  if (closeCheckoutBtn) closeCheckoutBtn.addEventListener('click', closeCheckoutModal);

  if (backdrop) {
    backdrop.addEventListener('click', () => {
      closeCart();
      closeQuickView();
      closeCheckoutModal();
      closeAuthModal();
      closeProfileModal();
      closeGoogleModal();
      closeMobileNav();
    });
  }

  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const closeMobileNavBtn = document.getElementById('closeMobileNavBtn');
  const mobileNavDrawer = document.getElementById('mobileNavDrawer');

  if (mobileMenuBtn && mobileNavDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileNavDrawer.classList.add('open');
      backdrop.classList.add('active');
    });
  }

  if (closeMobileNavBtn) {
    closeMobileNavBtn.addEventListener('click', closeMobileNav);
  }

  const mobileLinks = document.querySelectorAll('.mobile-nav-link');
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMobileNav);
  });

  setupSearch();

  window.addEventListener('scroll', () => {
    const header = document.getElementById('mainHeader');
    if (header) {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  });
}

function closeMobileNav() {
  const mobileNavDrawer = document.getElementById('mobileNavDrawer');
  const backdrop = document.getElementById('drawerBackdrop');
  if (mobileNavDrawer) mobileNavDrawer.classList.remove('open');
  if (backdrop && !document.getElementById('cartDrawer').classList.contains('open') && !document.getElementById('authModal').classList.contains('active') && !document.getElementById('profileModal').classList.contains('active')) {
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function setupScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}
