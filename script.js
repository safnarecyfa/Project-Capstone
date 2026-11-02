/**
 * ═══════════════════════════════════════════════════════════
 *  Kicau Mart — script.js
 *  Vanilla JavaScript, zero dependencies.
 *
 *  Responsibilities:
 *  1. Product catalog data & card rendering
 *  2. Cart state management (add / increment / decrement / remove)
 *  3. Cart sidebar open/close toggle
 *  4. Cart UI rendering (items list, badge count, total price)
 *  5. Navbar scroll effect
 *  6. Toast notification
 * ═══════════════════════════════════════════════════════════
 */

'use strict';

/* ══════════════════════════════════════════════════════════
   1. PRODUCT DATA
   ══════════════════════════════════════════════════════════ */

/** @type {Array<{id:number, name:string, desc:string, price:number, img:string, badge:string|null, badgeType:string|null}>} */
const PRODUCTS = [
  {
    id: 1,
    name: 'Pakan Murai Batu Premium',
    desc: 'Formula kaya protein serangga pilihan untuk meningkatkan volume & kualitas kicauan Murai Batu juara.',
    price: 85000,
    img: 'https://placehold.co/400x300/d1fae5/16a34a?text=Murai+Batu&font=poppins',
    badge: 'Terlaris 🔥',
    badgeType: 'badge-hot',
  },
  {
    id: 2,
    name: 'Pakan Kenari Master',
    desc: 'Campuran biji-bijian pilihan kaya vitamin E, menjaga stamina dan warna bulu Kenari tetap cerah.',
    price: 62000,
    img: 'https://placehold.co/400x300/fef9c3/d97706?text=Kenari+Master&font=poppins',
    badge: 'Baru 🌟',
    badgeType: 'badge-new',
  },
  {
    id: 3,
    name: 'Pakan Lovebird Color Boost',
    desc: 'Fortifikasi astaxanthin alami untuk mempercerah warna bulu Lovebird kesayanganmu.',
    price: 75000,
    img: 'https://placehold.co/400x300/fce7f3/db2777?text=Lovebird+Color&font=poppins',
    badge: 'Diskon 15%',
    badgeType: 'badge-sale',
  },
  {
    id: 4,
    name: 'Pakan Cucak Rowo Stamina',
    desc: 'Kandungan cacing kering tinggi untuk menjaga tenaga dan agresivitas Cucak Rowo di arena lomba.',
    price: 95000,
    img: 'https://placehold.co/400x300/dbeafe/2563eb?text=Cucak+Rowo&font=poppins',
    badge: null,
    badgeType: null,
  },
  {
    id: 5,
    name: 'Pakan Pleci Organik',
    desc: '100% bahan organik tanpa pengawet — menjaga kesehatan saluran cerna Pleci secara alami.',
    price: 48000,
    img: 'https://placehold.co/400x300/dcfce7/15803d?text=Pleci+Organik&font=poppins',
    badge: 'Organik 🌿',
    badgeType: 'badge-eco',
  },
  {
    id: 6,
    name: 'Pakan Kacer Gacor Pro',
    desc: 'Formula jangkrik + voer premium yang terbukti memperpanjang durasi dan variasi irama Kacer.',
    price: 78000,
    img: 'https://placehold.co/400x300/ede9fe/7c3aed?text=Kacer+Gacor&font=poppins',
    badge: 'Terlaris 🔥',
    badgeType: 'badge-hot',
  },
  {
    id: 7,
    name: 'Pakan Anis Merah Ngebren',
    desc: 'Suplemen amino esensial yang mendorong gaya ngebren khas Anis Merah agar lebih enerjik.',
    price: 88000,
    img: 'https://placehold.co/400x300/fee2e2/dc2626?text=Anis+Merah&font=poppins',
    badge: 'Baru 🌟',
    badgeType: 'badge-new',
  },
  {
    id: 8,
    name: 'Pakan Kolibri Nectar Plus',
    desc: 'Nektar sintetis kaya fruktosa dan mineral esensial — satu-satunya pakan kolibri bebas semut.',
    price: 55000,
    img: 'https://placehold.co/400x300/fef3c7/b45309?text=Kolibri+Nectar&font=poppins',
    badge: 'Diskon 10%',
    badgeType: 'badge-sale',
  },
];

/* ══════════════════════════════════════════════════════════
   2. CART STATE
   ══════════════════════════════════════════════════════════ */

/**
 * Cart is a plain object keyed by product id.
 * { [id]: { product: Product, qty: number } }
 */
const cart = {};

/** Track whether the cart sidebar is currently open. */
let cartOpen = false;

/* ══════════════════════════════════════════════════════════
   3. UTILITY HELPERS
   ══════════════════════════════════════════════════════════ */

/**
 * Format a number to Indonesian Rupiah string.
 * @param {number} amount
 * @returns {string}  e.g. "Rp 85.000"
 */
function formatRupiah(amount) {
  return 'Rp ' + amount.toLocaleString('id-ID');
}

/**
 * Show a brief toast notification at the bottom of the screen.
 * Auto-dismisses after 2.5 s.
 * @param {string} message
 */
function showToast(message) {
  const toast   = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');

  toastMsg.textContent = message;
  toast.classList.remove('hidden');

  // Reset animation by removing & re-adding the class
  const inner = toast.firstElementChild;
  inner.classList.remove('animate-slide-down');
  void inner.offsetWidth; // force reflow
  inner.classList.add('animate-slide-down');

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.add('hidden');
  }, 2500);
}

/* ══════════════════════════════════════════════════════════
   4. CART LOGIC
   ══════════════════════════════════════════════════════════ */

/**
 * Add one unit of a product to the cart, or increment quantity if already present.
 * @param {number} productId
 */
function addToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  if (cart[productId]) {
    // Product already in cart — just increment
    cart[productId].qty += 1;
  } else {
    // New cart entry
    cart[productId] = { product, qty: 1 };
  }

  updateCartUI();
  showToast(`"${product.name}" ditambahkan ke keranjang!`);
}

/**
 * Increment qty of a specific cart item.
 * @param {number} productId
 */
function incrementQty(productId) {
  if (!cart[productId]) return;
  cart[productId].qty += 1;
  updateCartUI();
}

/**
 * Decrement qty of a specific cart item.
 * Removes item entirely when qty reaches 0.
 * @param {number} productId
 */
function decrementQty(productId) {
  if (!cart[productId]) return;
  cart[productId].qty -= 1;
  if (cart[productId].qty <= 0) {
    removeFromCart(productId);
    return;
  }
  updateCartUI();
}

/**
 * Remove a product completely from the cart.
 * @param {number} productId
 */
function removeFromCart(productId) {
  delete cart[productId];
  updateCartUI();
}

/**
 * Calculate total item count across all cart entries.
 * @returns {number}
 */
function getTotalItems() {
  return Object.values(cart).reduce((sum, entry) => sum + entry.qty, 0);
}

/**
 * Calculate grand total price.
 * @returns {number}
 */
function getTotalPrice() {
  return Object.values(cart).reduce(
    (sum, entry) => sum + entry.product.price * entry.qty,
    0
  );
}

/* ══════════════════════════════════════════════════════════
   5. CART UI RENDERING
   ══════════════════════════════════════════════════════════ */

/**
 * Main function that re-renders the cart badge, sidebar items, and total.
 * Called after every state change.
 */
function updateCartUI() {
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  // ── Badge on navbar button ──────────────────────────────
  const badge = document.getElementById('cart-badge');
  if (totalItems > 0) {
    badge.textContent = totalItems > 99 ? '99+' : totalItems;
    badge.classList.remove('hidden');
    // Re-trigger bounce animation
    badge.classList.remove('animate-bounce-in');
    void badge.offsetWidth;
    badge.classList.add('animate-bounce-in');
  } else {
    badge.classList.add('hidden');
  }

  // ── Sidebar: toggle empty state vs item list ────────────
  const cartItemsEl  = document.getElementById('cart-items');
  const cartFooterEl = document.getElementById('cart-footer');
  const cartEmptyEl  = document.getElementById('cart-empty');
  const cartTotalEl  = document.getElementById('cart-total');

  if (totalItems === 0) {
    // Show empty state
    cartItemsEl.classList.add('hidden');
    cartFooterEl.classList.add('hidden');
    cartEmptyEl.classList.remove('hidden');
    cartEmptyEl.classList.add('flex');
    return;
  }

  // Show items
  cartItemsEl.classList.remove('hidden');
  cartFooterEl.classList.remove('hidden');
  cartEmptyEl.classList.add('hidden');
  cartEmptyEl.classList.remove('flex');

  // ── Render item rows ────────────────────────────────────
  cartItemsEl.innerHTML = Object.values(cart)
    .map(({ product, qty }) => `
      <div class="cart-item" id="cart-item-${product.id}">
        <img
          src="${product.img}"
          alt="${product.name}"
          class="cart-item-img"
        />
        <div class="flex-1 min-w-0">
          <p class="cart-item-name truncate">${product.name}</p>
          <p class="cart-item-price">${formatRupiah(product.price)}</p>
          <!-- Quantity controls -->
          <div class="flex items-center gap-2 mt-2">
            <button
              class="qty-btn"
              onclick="decrementQty(${product.id})"
              aria-label="Kurangi jumlah"
            >−</button>
            <span class="qty-display">${qty}</span>
            <button
              class="qty-btn"
              onclick="incrementQty(${product.id})"
              aria-label="Tambah jumlah"
            >+</button>
          </div>
        </div>
        <!-- Subtotal + remove -->
        <div class="flex flex-col items-end gap-2 flex-shrink-0">
          <p class="text-xs font-bold text-gray-700">${formatRupiah(product.price * qty)}</p>
          <button
            class="remove-btn"
            onclick="removeFromCart(${product.id})"
            aria-label="Hapus produk dari keranjang"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
      </div>
    `)
    .join('');

  // ── Total price ─────────────────────────────────────────
  cartTotalEl.textContent = formatRupiah(totalPrice);
}

/* ══════════════════════════════════════════════════════════
   6. CART SIDEBAR TOGGLE
   ══════════════════════════════════════════════════════════ */

/**
 * Toggle cart sidebar open/close state.
 * Uses CSS translate-x for the slide animation.
 */
function toggleCart() {
  const sidebar  = document.getElementById('cart-sidebar');
  const overlay  = document.getElementById('cart-overlay');

  cartOpen = !cartOpen;

  if (cartOpen) {
    // Open
    overlay.classList.remove('hidden');
    // Slight delay so display:block renders before opacity transition
    requestAnimationFrame(() => {
      overlay.classList.remove('opacity-0');
      overlay.classList.add('opacity-100');
      sidebar.classList.remove('translate-x-full');
    });
    document.body.style.overflow = 'hidden'; // prevent body scroll
  } else {
    // Close
    overlay.classList.remove('opacity-100');
    overlay.classList.add('opacity-0');
    sidebar.classList.add('translate-x-full');
    document.body.style.overflow = '';

    // Hide overlay after transition ends (300ms)
    setTimeout(() => overlay.classList.add('hidden'), 310);
  }
}

/* ══════════════════════════════════════════════════════════
   7. CHECKOUT STUB
   ══════════════════════════════════════════════════════════ */

/**
 * Checkout handler — currently a friendly alert stub.
 * Replace with real payment gateway / page navigation logic.
 */
function checkout() {
  const total = getTotalPrice();
  if (total === 0) return;
  showToast(`✅ Pesanan senilai ${formatRupiah(total)} berhasil dikirim!`);
  // Clear cart
  Object.keys(cart).forEach(k => delete cart[k]);
  updateCartUI();
  toggleCart();
}

/* ══════════════════════════════════════════════════════════
   8. PRODUCT CARD RENDERING
   ══════════════════════════════════════════════════════════ */

/**
 * Build one product card HTML string.
 * @param {Object} product
 * @returns {string} HTML markup
 */
function buildProductCard(product) {
  const badgeHTML = product.badge
    ? `<span class="badge ${product.badgeType}">${product.badge}</span>`
    : '';

  return `
    <article class="product-card" aria-label="${product.name}">
      <div class="overflow-hidden">
        <img
          src="${product.img}"
          alt="${product.name}"
          class="product-card-img"
          loading="lazy"
        />
      </div>
      <div class="product-card-body">
        ${badgeHTML}
        <h3 class="font-bold text-gray-900 text-base leading-snug mb-1">${product.name}</h3>
        <p class="text-gray-500 text-sm leading-relaxed flex-1">${product.desc}</p>
        <div class="flex items-center justify-between mt-4 mb-3">
          <span class="text-lg font-extrabold text-forest-600">${formatRupiah(product.price)}</span>
          <span class="text-xs text-gray-400 font-medium">/ 500g</span>
        </div>
        <button
          class="btn-cart"
          onclick="addToCart(${product.id})"
          aria-label="Tambah ${product.name} ke keranjang"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          Tambah ke Keranjang
        </button>
      </div>
    </article>
  `;
}

/**
 * Render all products into the #product-grid container.
 */
function renderProducts() {
  const grid = document.getElementById('product-grid');
  if (!grid) return;
  grid.innerHTML = PRODUCTS.map(buildProductCard).join('');
}

/* ══════════════════════════════════════════════════════════
   9. NAVBAR SCROLL EFFECT
   ══════════════════════════════════════════════════════════ */

function handleNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (window.scrollY > 40) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

/* ══════════════════════════════════════════════════════════
   10. INIT — run after DOM is ready
   ══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  // Render product grid
  renderProducts();

  // Initialize cart UI (empty state)
  updateCartUI();

  // Navbar scroll listener (passive for performance)
  window.addEventListener('scroll', handleNavbarScroll, { passive: true });

  // Keyboard: close cart with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && cartOpen) toggleCart();
  });
});
