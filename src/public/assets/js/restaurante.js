'use strict';
/* ── restaurante.js: Página de detalhe do restaurante ──────────── */

const params = new URLSearchParams(location.search);
const restId = params.get('id');

document.addEventListener('DOMContentLoaded', () => {
  applyNavSession();
  setupHamburger();

  if (!restId) { location.href = 'index.html'; return; }
  const r = Restaurants.byId(restId);
  if (!r)      { location.href = 'index.html'; return; }

  document.title = r.name + ' — SafeBite';
  renderBanner(r);
  renderHeader(r);
  renderInfoBar(r);
  renderInfoTab(r);
  renderMenu(r);
  setupTabs();
  setupFavRest(r);

  document.getElementById('dishModalClose').onclick = closeDishModal;
  document.getElementById('dishModal').addEventListener('click', e => {
    if (e.target.id === 'dishModal') closeDishModal();
  });
});

function renderBanner(r) {
  const el = document.getElementById('restBanner');
  if (r.banner || r.image) {
    el.innerHTML = `<img class="rest-banner" src="${esc(r.banner || r.image)}" alt="${esc(r.name)}" loading="lazy" />`;
  } else {
    el.innerHTML = `<div class="rest-banner-placeholder">🍽</div>`;
  }
}

function renderHeader(r) {
  document.getElementById('restName').textContent    = r.name;
  document.getElementById('restCuisine').textContent = r.cuisine || '';
  document.getElementById('restStatusBadge').innerHTML = r.open
    ? '<span class="rest-card-badge badge-open">✓ Aberto agora</span>'
    : '<span class="rest-card-badge badge-closed">Fechado</span>';
  document.getElementById('restDesc').textContent = r.description || '';
}

function renderInfoBar(r) {
  const bar = document.getElementById('restInfoBar');
  const items = [
    r.rating    ? `<span class="rest-card-rating">★ <strong>${r.rating}</strong></span><span class="sep">·</span><span>${r.reviewCount || 0} avaliações</span>` : null,
    r.deliveryTime ? `<span>🕐 ${esc(r.deliveryTime)}</span>` : null,
    r.priceRange   ? `<span>${esc(r.priceRange)}</span>`       : null,
    r.minOrder     ? `<span>Pedido mín. <strong>${brl(r.minOrder)}</strong></span>` : null,
    r.city         ? `<span>📍 ${esc(r.city + '/' + r.state)}</span>` : null,
  ].filter(Boolean);
  bar.innerHTML = items.join('<span class="sep">·</span>');
}

function renderInfoTab(r) {
  document.getElementById('restInfoDetails').innerHTML = `
    <p style="margin:.5rem 0;font-size:.9rem;color:var(--text-muted)">
      <strong style="color:var(--text)">📞 Telefone:</strong> ${esc(r.phone || '—')}
    </p>
    <p style="margin:.5rem 0;font-size:.9rem;color:var(--text-muted)">
      <strong style="color:var(--text)">📍 Cidade:</strong> ${esc(r.city ? r.city + '/' + r.state : '—')}
    </p>
    <p style="margin:.5rem 0;font-size:.9rem;color:var(--text-muted)">
      <strong style="color:var(--text)">🍽 Cozinha:</strong> ${esc(r.cuisine || '—')}
    </p>
    ${r.restrictions?.length ? `
    <p style="margin:.75rem 0 .4rem;font-size:.9rem;color:var(--text)"><strong>Restrições atendidas:</strong></p>
    <div class="tags">${r.restrictions.map(x => `<span class="tag">${esc(restrictionLabel(x))}</span>`).join('')}</div>
    ` : ''}`;
}

/* ── Cardápio ───────────────────────────────────────────────────── */
let activeCat = 'Todos';

function renderMenu(r) {
  const dishes = Dishes.byRestaurant(r.id);
  const cats   = ['Todos', ...new Set(dishes.map(d => d.category).filter(Boolean))];

  // Filtro de categorias
  const catFilter = document.getElementById('menuCatFilter');
  catFilter.innerHTML = cats.map(c =>
    `<button class="filter-btn${c === activeCat ? ' active' : ''}" data-cat="${esc(c)}">${esc(c)}</button>`
  ).join('');
  catFilter.querySelectorAll('button').forEach(b => {
    b.onclick = () => {
      activeCat = b.dataset.cat;
      catFilter.querySelectorAll('button').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      renderMenuGrid(dishes);
    };
  });

  renderMenuGrid(dishes);
}

function renderMenuGrid(dishes) {
  const user     = Auth.current();
  const filtered = activeCat === 'Todos' ? dishes : dishes.filter(d => d.category === activeCat);
  const grid     = document.getElementById('menuGrid');

  if (!filtered.length) {
    grid.innerHTML = '<div class="empty">Nenhum prato nesta categoria.</div>';
    return;
  }

  grid.innerHTML = filtered.map(d => {
    const isFav = user ? Favorites.isFav(user.id, d.id) : false;
    const img   = d.image
      ? `<img class="dish-card-img" src="${esc(d.image)}" alt="${esc(d.name)}" loading="lazy" />`
      : `<div class="dish-card-img" style="background:rgba(16,185,129,.1);display:grid;place-items:center;font-size:2rem">🍽</div>`;
    return `
      <div class="dish-card" data-dish="${esc(d.id)}" style="cursor:pointer">
        ${img}
        <div class="dish-card-body">
          <div class="dish-card-top">
            <div style="min-width:0">
              <p class="dish-card-name">${esc(d.name)}</p>
              <p class="dish-card-rest">${esc(d.category || '')}</p>
            </div>
            <button class="fav-btn${isFav?' faved':''}" data-dish="${esc(d.id)}"
              title="${isFav?'Remover dos favoritos':'Adicionar aos favoritos'}">
              ${isFav ? '❤' : '🤍'}
            </button>
          </div>
          <p class="dish-card-desc">${esc(d.description || '')}</p>
          ${d.restrictions?.length ? `<div class="tags">
            ${d.restrictions.slice(0,3).map(x=>`<span class="tag">${esc(restrictionLabel(x))}</span>`).join('')}
          </div>` : ''}
          <div class="dish-card-footer">
            <span class="dish-price">${brl(d.price)}</span>
            <button class="btn primary add-btn" data-dish="${esc(d.id)}"
              style="padding:.45rem .9rem;font-size:.85rem">+ Carrinho</button>
          </div>
        </div>
      </div>`;
  }).join('');

  // eventos
  grid.querySelectorAll('.dish-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.fav-btn,.add-btn')) return;
      openDishModal(card.dataset.dish);
    });
  });
  grid.querySelectorAll('.fav-btn').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); toggleFav(btn); });
  });
  grid.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      Cart.add(btn.dataset.dish);
      updateCartBadge();
      showToast('🛒 Adicionado ao carrinho!');
    });
  });
}

function toggleFav(btn) {
  const user = Auth.current();
  if (!user) { location.href = 'login.html'; return; }
  const now = Favorites.toggle(user.id, btn.dataset.dish);
  btn.classList.toggle('faved', now);
  btn.innerHTML = now ? '❤' : '🤍';
  showToast(now ? '❤ Adicionado aos favoritos!' : 'Removido dos favoritos', now ? 'ok' : 'err');
}

/* ── Modal detalhe do prato ─────────────────────────────────────── */
function openDishModal(dishId) {
  const d    = Dishes.byId(dishId);
  const user = Auth.current();
  if (!d) return;
  const rest  = Restaurants.byId(d.restaurantId);
  const isFav = user ? Favorites.isFav(user.id, d.id) : false;

  document.getElementById('dishModalTitle').textContent = d.name;
  document.getElementById('dishModalBody').innerHTML = `
    ${d.image ? `<img class="dish-modal-img" src="${esc(d.image)}" alt="${esc(d.name)}" />` : ''}
    <p class="muted" style="margin:0 0 .35rem;font-size:.85rem">${esc(rest?.name||'')} · ${esc(d.category||'')}</p>
    <p class="dish-modal-price">${brl(d.price)}</p>
    <p style="color:var(--text-muted);line-height:1.6;margin:.5rem 0 .75rem">${esc(d.description||'')}</p>
    ${d.restrictions?.length?`<div class="tags" style="margin-bottom:.75rem">
      ${d.restrictions.map(x=>`<span class="tag">${esc(restrictionLabel(x))}</span>`).join('')}
    </div>`:''}
    ${d.allergens?`<span class="dish-modal-aller">⚠ ${esc(d.allergens)}</span>`:''}
    ${d.calories?`<p class="muted small" style="margin:.5rem 0 0">🔥 ${esc(String(d.calories))} kcal</p>`:''}
    <div style="display:flex;gap:.75rem;margin-top:1.25rem;flex-wrap:wrap">
      <button class="btn primary" id="modalAddCart" data-dish="${esc(d.id)}">🛒 Adicionar ao carrinho</button>
      <button class="btn ghost fav-btn${isFav?' faved':''}" id="modalFav" data-dish="${esc(d.id)}">
        ${isFav?'❤ Favoritado':'🤍 Favoritar'}
      </button>
    </div>`;

  document.getElementById('modalAddCart').onclick = () => {
    Cart.add(d.id); updateCartBadge();
    showToast('🛒 Adicionado ao carrinho!');
    closeDishModal();
  };
  document.getElementById('modalFav').onclick = () => {
    if (!user) { location.href = 'login.html'; return; }
    const now = Favorites.toggle(user.id, d.id);
    const btn = document.getElementById('modalFav');
    btn.className = `btn ghost fav-btn${now?' faved':''}`;
    btn.innerHTML = now ? '❤ Favoritado' : '🤍 Favoritar';
    showToast(now ? '❤ Favorito!' : 'Removido', now ? 'ok' : 'err');
    renderMenu(Restaurants.byId(restId));
  };

  document.getElementById('dishModal').classList.add('open');
}
function closeDishModal() {
  document.getElementById('dishModal').classList.remove('open');
}

/* ── Tabs ───────────────────────────────────────────────────────── */
function setupTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    };
  });
}

function setupHamburger() {
  const btn   = document.getElementById('hamburger');
  const links = document.getElementById('navLinks');
  if (btn && links) btn.onclick = () => links.classList.toggle('open');
}

/* ── Favoritar restaurante ──────────────────────────────────────── */
function setupFavRest(r) {
  const btn  = document.getElementById('btnFavRest');
  if (!btn) return;
  const user = Auth.current();

  // estado inicial
  const isFav = user && (user.favRestaurants || []).includes(r.id);
  setFavRestBtn(btn, isFav);

  btn.addEventListener('click', () => {
    const u = Auth.current();
    if (!u) { location.href = 'login.html?next=' + encodeURIComponent(location.href); return; }
    const ids  = u.favRestaurants || [];
    const idx  = ids.indexOf(r.id);
    let nowFav;
    if (idx >= 0) { ids.splice(idx, 1); nowFav = false; }
    else          { ids.push(r.id);     nowFav = true;  }
    Auth.updateCurrent({ favRestaurants: ids });
    setFavRestBtn(btn, nowFav);
    showToast(nowFav ? '🏪 Restaurante favoritado!' : 'Restaurante removido dos favoritos', nowFav ? 'ok' : 'err');
  });
}

function setFavRestBtn(btn, isFav) {
  btn.classList.toggle('faved', isFav);
  btn.innerHTML = isFav ? '❤ Favoritado' : '🤍 Favoritar restaurante';
}
