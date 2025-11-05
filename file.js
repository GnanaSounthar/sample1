// ===== Simple Sales Shop =====
// Replace PRODUCTS with your items (id, name, price, category, rating, image, tags, stock)
const PRODUCTS = [
  { id: 1, name: "Aurora Sneakers", price: 2599, category: "Footwear", rating: 4.6, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop", tags: ["new","bestseller"], stock: 18 },
  { id: 2, name: "Nimbus Hoodie", price: 1899, category: "Apparel", rating: 4.4, image: "https://th.bing.com/th/id/R.0b16c088b52b41600c92e00666fb121f?rik=DuEFPx6UqkYjKA&riu=http%3a%2f%2fstcroixrodfactorystore.com%2fcdn%2fshop%2ffiles%2fBlackfish_M-SwiftHoodie_Nimbus-StormFront_1a4528d3-553b-4a04-ad6a-b5614a5c9c01.png%3fv%3d1731431342&ehk=iMP0TD%2bf85UVSaCNePSeskXx8t5sRJT4UTt%2fZaT2vOU%3d&risl=&pid=ImgRaw&r=0", tags: ["new"], stock: 32 },
  { id: 3, name: "Echo Wireless Buds", price: 3499, category: "Electronics", rating: 4.2, image: "https://th.bing.com/th?id=OPAC.6qa%2fIWnEI7c%2fmQ474C474&w=592&h=550&o=5&dpr=1.3&pid=21.1", tags: ["hot"], stock: 12 },
  { id: 4, name: "Comet Backpack", price: 1499, category: "Bags", rating: 4.1, image: "https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1200&auto=format&fit=crop", tags: ["eco"], stock: 20 },
  { id: 5, name: "Pulse Smartwatch", price: 4999, category: "Electronics", rating: 4.7, image: "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?q=80&w=1200&auto=format&fit=crop", tags: ["bestseller"], stock: 9 },
  { id: 6, name: "Glide Running Tee", price: 999, category: "Apparel", rating: 4.0, image: "https://tse4.mm.bing.net/th/id/OIP.DT28_o_Dv3p8WSzWbd7OogHaHa?rs=1&pid=ImgDetMain&o=7&rm=3p", tags: [], stock: 40 }
];

const formatINR = (n) => `₹${n.toLocaleString('en-IN')}`;

const state = {
  query: "",
  category: "all",
  sort: "featured",
  maxPrice: 10000,
  cart: JSON.parse(localStorage.getItem('cart') || '{}') // { [id]: qty }
};

const els = {
  grid: document.getElementById('productsGrid'),
  search: document.getElementById('searchInput'),
  category: document.getElementById('categorySelect'),
  sort: document.getElementById('sortSelect'),
  priceRange: document.getElementById('priceRange'),
  priceValue: document.getElementById('priceValue'),
  cartBtn: document.getElementById('openCartBtn'),
  cartDrawer: document.getElementById('cartDrawer'),
  overlay: document.getElementById('overlay'),
  closeCartBtn: document.getElementById('closeCartBtn'),
  cartItems: document.getElementById('cartItems'),
  subtotal: document.getElementById('subtotal'),
  delivery: document.getElementById('delivery'),
  grandTotal: document.getElementById('grandTotal'),
  cartCount: document.getElementById('cartCount'),
  clearCartBtn: document.getElementById('clearCartBtn'),
  checkoutBtn: document.getElementById('checkoutBtn'),
  year: document.getElementById('year'),
};

// Categories
const categories = Array.from(new Set(PRODUCTS.map(p => p.category)));
categories.forEach(c => {
  const opt = document.createElement('option');
  opt.value = c; opt.textContent = c;
  els.category.appendChild(opt);
});

// Price slider
const maxPrice = Math.max(...PRODUCTS.map(p => p.price), 10000);
els.priceRange.max = maxPrice;
els.priceRange.value = state.maxPrice;
els.priceValue.textContent = ` — ${formatINR(state.maxPrice)}`;

// Filtering
function getFiltered() {
  let list = PRODUCTS.filter(p =>
    (state.category === 'all' || p.category === state.category) &&
    p.price <= state.maxPrice &&
    p.name.toLowerCase().includes(state.query.toLowerCase())
  );
  switch (state.sort) {
    case 'price-asc': list.sort((a,b) => a.price - b.price); break;
    case 'price-desc': list.sort((a,b) => b.price - a.price); break;
    case 'rating-desc': list.sort((a,b) => b.rating - a.rating); break;
    case 'name-asc': list.sort((a,b) => a.name.localeCompare(b.name)); break;
    default: break;
  }
  return list;
}

function renderProducts() {
  const list = getFiltered();
  els.grid.innerHTML = '';
  if (!list.length) {
    els.grid.innerHTML = `<div class="card" style="padding:1rem; text-align:center;">No products found.</div>`;
    return;
  }
  for (const p of list) {
    const inCart = state.cart[p.id] || 0;
    const el = document.createElement('article');
    el.className = 'card';
    el.innerHTML = `
      <img src="${p.image}" alt="${p.name}" loading="lazy">
      <div class="card-body">
        <div class="card-title">${p.name}</div>
        <div class="card-meta">
          <span class="price">${formatINR(p.price)}</span>
          <span class="rating">⭐ ${p.rating.toFixed(1)}</span>
        </div>
        <div class="tags">${(p.tags||[]).map(t => `<span class='tag'>${t}</span>`).join('')}</div>
        <div class="actions">
          ${inCart ? `
            <div class="qty">
              <button data-action="dec" data-id="${p.id}">−</button>
              <span>${inCart}</span>
              <button data-action="inc" data-id="${p.id}">+</button>
            </div>
          ` : `
            <button class="btn primary" data-action="add" data-id="${p.id}">Add to Cart</button>
          `}
        </div>
      </div>
    `;
    el.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const id = Number(btn.dataset.id);
      const action = btn.dataset.action;
      if (action === 'add') updateCart(id, 1);
      if (action === 'inc') updateCart(id, (state.cart[id]||0) + 1);
      if (action === 'dec') updateCart(id, (state.cart[id]||0) - 1);
    });
    els.grid.appendChild(el);
  }
}

function updateCart(id, qty) {
  if (qty <= 0) delete state.cart[id];
  else state.cart[id] = qty;
  localStorage.setItem('cart', JSON.stringify(state.cart));
  renderProducts(); renderCart(); updateBadge();
}

function renderCart() {
  els.cartItems.innerHTML = '';
  const ids = Object.keys(state.cart);
  if (!ids.length) {
    els.cartItems.innerHTML = '<div class="card" style="padding:1rem; text-align:center;">Your cart is empty.</div>';
  }
  let subtotal = 0;
  for (const id of ids) {
    const p = PRODUCTS.find(x => x.id === Number(id));
    const qty = state.cart[id];
    const line = p.price * qty;
    subtotal += line;
    const item = document.createElement('div');
    item.className = 'cart-item';
    item.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <div>
        <div class="name">${p.name}</div>
        <div class="muted">${formatINR(p.price)} × ${qty}</div>
      </div>
      <div style="display:grid; gap:.4rem; justify-items:end;">
        <div class="price">${formatINR(line)}</div>
        <div class="qty">
          <button data-action="dec" data-id="${p.id}">−</button>
          <span>${qty}</span>
          <button data-action="inc" data-id="${p.id}">+</button>
        </div>
      </div>
    `;
    item.addEventListener('click', (e) => {
      const btn = e.target.closest('button'); if (!btn) return;
      const id = Number(btn.dataset.id);
      const act = btn.dataset.action;
      if (act === 'inc') updateCart(id, state.cart[id] + 1);
      if (act === 'dec') updateCart(id, state.cart[id] - 1);
    });
    els.cartItems.appendChild(item);
  }
  const delivery = subtotal ? 99 : 0;
  els.subtotal.textContent = formatINR(subtotal);
  els.delivery.textContent = formatINR(delivery);
  els.grandTotal.textContent = formatINR(subtotal + delivery);
}

function updateBadge() {
  const count = Object.values(state.cart).reduce((a,b) => a + b, 0);
  els.cartCount.textContent = count;
}

function openCart(open) {
  els.cartDrawer.classList.toggle('open', open);
  els.overlay.hidden = !open;
  els.cartDrawer.setAttribute('aria-hidden', (!open).toString());
}

function initEvents() {
  els.search.addEventListener('input', e => { state.query = e.target.value; renderProducts(); });
  els.category.addEventListener('change', e => { state.category = e.target.value; renderProducts(); });
  els.sort.addEventListener('change', e => { state.sort = e.target.value; renderProducts(); });
  els.priceRange.addEventListener('input', e => { state.maxPrice = Number(e.target.value); els.priceValue.textContent = ` — ${formatINR(state.maxPrice)}`; renderProducts(); });
  els.cartBtn.addEventListener('click', () => openCart(true));
  els.closeCartBtn.addEventListener('click', () => openCart(false));
  els.overlay.addEventListener('click', () => openCart(false));
  els.clearCartBtn.addEventListener('click', () => { state.cart = {}; localStorage.removeItem('cart'); renderProducts(); renderCart(); updateBadge(); });
  els.checkoutBtn.addEventListener('click', () => alert('Demo checkout — connect to backend for real orders.'));
  els.year.textContent = new Date().getFullYear();
}

(function start(){
  // fill categories
  const cats = new Set(PRODUCTS.map(p => p.category));
  for (const c of cats) {
    const opt = document.createElement('option'); opt.value = c; opt.textContent = c;
    els.category.appendChild(opt);
  }
  renderProducts(); renderCart(); updateBadge(); initEvents();
})();