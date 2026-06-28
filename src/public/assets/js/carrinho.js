'use strict';
/* ── carrinho.js ────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  applyNavSession();
  setupHamburger();
  render();
  document.getElementById('btnCheckout').onclick = checkout;
});

const DELIVERY_FEE = 5.00;

function render() {
  const items  = Cart.get();
  const dishes = Dishes.all();
  const list   = document.getElementById('cartList');
  const rows   = document.getElementById('summaryRows');
  const total  = document.getElementById('summaryTotal');

  if (!items.length) {
    list.innerHTML = `
      <div class="fav-empty">
        <div class="ico">🛒</div>
        <h2>Seu carrinho está vazio</h2>
        <p>Explore restaurantes e adicione pratos ao carrinho.</p>
        <a class="btn primary" href="index.html">Ver restaurantes</a>
      </div>`;
    rows.innerHTML = '';
    total.textContent = 'R$ 0,00';
    document.getElementById('btnCheckout').disabled = true;
    return;
  }

  document.getElementById('btnCheckout').disabled = false;

  let subtotal = 0;
  list.innerHTML = items.map(item => {
    const d = dishes.find(x => x.id === item.dishId);
    if (!d) return '';
    const lineTotal = d.price * item.qty;
    subtotal += lineTotal;
    const rest = Restaurants.byId(d.restaurantId);
    const img  = d.image
      ? `<img class="item-thumb" src="${esc(d.image)}" alt="${esc(d.name)}" />`
      : `<div class="item-thumb" style="background:rgba(16,185,129,.1);display:grid;place-items:center;font-size:1.4rem">🍽</div>`;
    return `
      <div class="item" data-dish="${esc(d.id)}">
        ${img}
        <div class="item-body">
          <p class="item-title">${esc(d.name)}</p>
          <p class="item-sub">${esc(rest?.name || '—')}</p>
          <p class="item-meta">${brl(d.price)} × ${item.qty}</p>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:.5rem">
          <span class="price">${brl(lineTotal)}</span>
          <div class="qty-ctrl">
            <button class="qty-btn-sm qty-dec" data-dish="${esc(d.id)}" aria-label="Diminuir">−</button>
            <span style="min-width:1.5rem;text-align:center;font-size:.9rem">${item.qty}</span>
            <button class="qty-btn-sm qty-inc" data-dish="${esc(d.id)}" aria-label="Aumentar">+</button>
          </div>
          <button class="btn danger remove-btn" data-dish="${esc(d.id)}"
            style="padding:.3rem .7rem;font-size:.78rem">Remover</button>
        </div>
      </div>`;
  }).join('');

  const totalVal = subtotal + DELIVERY_FEE;
  rows.innerHTML = `
    <div class="summary-row"><span>Subtotal</span><span>${brl(subtotal)}</span></div>
    <div class="summary-row"><span>Taxa de entrega</span><span>${brl(DELIVERY_FEE)}</span></div>`;
  total.textContent = brl(totalVal);

  // Eventos
  list.querySelectorAll('.qty-dec').forEach(btn => btn.onclick = () => {
    const item = Cart.get().find(x => x.dishId === btn.dataset.dish);
    if (item) {
      const nextQty = item.qty - 1;
      if (nextQty <= 0) Cart.remove(btn.dataset.dish);
      else Cart.setQty(btn.dataset.dish, nextQty);
    }
    updateCartBadge(); render();
  });
  list.querySelectorAll('.qty-inc').forEach(btn => btn.onclick = () => {
    const item = Cart.get().find(x => x.dishId === btn.dataset.dish);
    if (item) Cart.setQty(btn.dataset.dish, item.qty + 1);
    updateCartBadge(); render();
  });
  list.querySelectorAll('.remove-btn').forEach(btn => btn.onclick = () => {
    Cart.remove(btn.dataset.dish);
    updateCartBadge(); render();
    showToast('Item removido', 'err');
  });
}

function checkout() {
  if (!Auth.current()) { location.href = 'login.html?next=carrinho.html'; return; }
  if (!Cart.get().length) return;
  // Redireciona para a tela de pagamento
  location.href = 'pagamento.html';
}

function setupHamburger() {
  const btn   = document.getElementById('hamburger');
  const links = document.getElementById('navLinks');
  if (btn && links) btn.onclick = () => links.classList.toggle('open');
}
