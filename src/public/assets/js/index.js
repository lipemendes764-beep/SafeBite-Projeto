'use strict';
/* ── index.js: Home Page ──────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  applyNavSession();
  renderStats();
  renderCarousel();
  renderRestaurants();
  renderDishes();
  setupHamburger();
  document.getElementById('dishModalClose').onclick = closeDishModal;
  document.getElementById('dishModal').addEventListener('click', e => {
    if (e.target.id === 'dishModal') closeDishModal();
  });
});

/* ── Stats ─────────────────────────────────────────────────────── */
function renderStats() {
  const rests  = Restaurants.all();
  const dishes = Dishes.all();
  const user   = Auth.current();
  const favCount = user ? Favorites.ofUser(user.id).length : 0;

  document.getElementById('stats').innerHTML = [
    { value: rests.length + '+',  label: 'Restaurantes parceiros' },
    { value: dishes.length + '+', label: 'Pratos disponíveis'     },
    { value: '12',                label: 'Tipos de restrição'      },
    { value: favCount || '❤',    label: user ? 'Seus favoritos' : 'Favoritos' },
  ].map(s => `
    <div class="stat">
      <div class="stat-value">${esc(String(s.value))}</div>
      <div class="stat-label">${esc(s.label)}</div>
    </div>`).join('');
}

/* ── Carrossel ──────────────────────────────────────────────────── */
let carIdx = 0;
let carList = [];
let carTimer;

function renderCarousel() {
  carList = Restaurants.featured().slice(0, 5);
  if (!carList.length) return;

  const track = document.getElementById('carouselTrack');
  track.innerHTML = carList.map(r => {
    const img = r.image
      ? `<img src="${esc(r.image)}" alt="${esc(r.name)}" loading="lazy" />`
      : `<div style="width:100%;height:100%;background:linear-gradient(135deg,rgba(16,185,129,.2),rgba(15,20,16,1));display:grid;place-items:center;font-size:4rem;">🍽</div>`;
    return `
      <div class="carousel-slide">
        ${img}
        <div class="carousel-overlay">
          <div class="tags" style="margin-bottom:.6rem">
            ${(r.restrictions || []).slice(0, 3).map(x =>
              `<span class="tag">${esc(restrictionLabel(x))}</span>`).join('')}
          </div>
          <h2>${esc(r.name)}</h2>
          <p>${esc(r.cuisine || '')} · 📍 ${esc(r.city + '/' + r.state)}</p>
          <a class="btn primary" href="restaurante.html?id=${esc(r.id)}"
             style="align-self:flex-start">Ver cardápio →</a>
        </div>
      </div>`;
  }).join('');

  // dots
  const dots = document.getElementById('carDots');
  dots.innerHTML = carList.map((_, i) =>
    `<button class="carousel-dot${i===0?' active':''}" data-i="${i}" aria-label="Slide ${i+1}"></button>`
  ).join('');
  dots.querySelectorAll('.carousel-dot').forEach(b =>
    b.addEventListener('click', () => goTo(+b.dataset.i)));

  document.getElementById('carPrev').onclick = () => goTo(carIdx - 1);
  document.getElementById('carNext').onclick = () => goTo(carIdx + 1);

  startAuto();
}

function goTo(n) {
  carIdx = (n + carList.length) % carList.length;
  document.getElementById('carouselTrack').style.transform = `translateX(-${carIdx * 100}%)`;
  document.querySelectorAll('.carousel-dot').forEach((d, i) =>
    d.classList.toggle('active', i === carIdx));
  resetAuto();
}

function startAuto() { carTimer = setInterval(() => goTo(carIdx + 1), 5000); }
function resetAuto()  { clearInterval(carTimer); startAuto(); }

/* ── Grid de Restaurantes ───────────────────────────────────────── */
let restQuery = '';
const restChipsActive = new Set();

function renderRestaurants() {
  const chips = document.getElementById('restChips');
  if (!chips.children.length) {
    RESTRICTIONS_MAP.slice(0, 6).forEach(([id, label]) => {
      const b = document.createElement('button');
      b.className = 'chip'; b.type = 'button'; b.textContent = label;
      b.onclick = () => {
        if (restChipsActive.has(id)) { restChipsActive.delete(id); b.classList.remove('active'); }
        else { restChipsActive.add(id); b.classList.add('active'); }
        renderRestGrid();
      };
      chips.appendChild(b);
    });
    document.getElementById('restQ').addEventListener('input', e => {
      restQuery = e.target.value.toLowerCase();
      renderRestGrid();
    });
  }
  renderRestGrid();
}

function renderRestGrid() {
  const all = Restaurants.all();
  const filtered = all.filter(r => {
    const m = !restQuery ||
      normalize(r.name).includes(normalize(restQuery)) ||
      normalize(r.cuisine).includes(normalize(restQuery));
    const f = restChipsActive.size === 0 ||
      [...restChipsActive].every(x => r.restrictions.includes(x));
    return m && f;
  });

  document.getElementById('restCount').textContent =
    filtered.length + (filtered.length === 1 ? ' restaurante' : ' restaurantes');

  const grid = document.getElementById('restGrid');
  if (!filtered.length) {
    grid.innerHTML = '<div class="empty"><div style="font-size:2rem;margin-bottom:.5rem">🔍</div>Nenhum restaurante encontrado.</div>';
    return;
  }

  grid.innerHTML = filtered.map(r => restCardHtml(r)).join('');
}

function restCardHtml(r) {
  const img = r.image
    ? `<img class="rest-card-img" src="${esc(r.image)}" alt="${esc(r.name)}" loading="lazy" />`
    : `<div class="rest-card-img-placeholder">🍽</div>`;
  const badge = r.open
    ? `<span class="rest-card-badge badge-open">Aberto</span>`
    : `<span class="rest-card-badge badge-closed">Fechado</span>`;
  return `
    <a class="rest-card${r.open ? '' : ' rest-card-closed'}" href="restaurante.html?id=${esc(r.id)}" aria-label="Ver ${esc(r.name)}">
      ${img}
      <div class="rest-card-body">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:.5rem">
          <p class="rest-card-name">${esc(r.name)}</p>
          ${badge}
        </div>
        <p class="rest-card-cuisine">${esc(r.cuisine || '—')}</p>
        <div class="rest-card-meta">
          <span class="rest-card-rating">★ ${r.rating || '—'}</span>
          <span class="sep">·</span>
          <span>${esc(r.deliveryTime || '—')}</span>
          <span class="sep">·</span>
          <span>${esc(r.priceRange || '—')}</span>
        </div>
        ${r.restrictions?.length ? `<div class="tags" style="margin-top:.5rem">
          ${r.restrictions.slice(0, 3).map(x => `<span class="tag">${esc(restrictionLabel(x))}</span>`).join('')}
        </div>` : ''}
      </div>
    </a>`;
}

/* ── Grid de Pratos (com favoritos) ────────────────────────────── */
let dishQuery = '';

function renderDishes() {
  document.getElementById('dishQ').addEventListener('input', e => {
    dishQuery = e.target.value.toLowerCase();
    renderDishGrid();
  });
  renderDishGrid();
}

function renderDishGrid() {
  const user    = Auth.current();
  const all     = Dishes.all();
  const rests   = Restaurants.all();

  const filtered = dishQuery
    ? all.filter(d =>
        normalize(d.name).includes(normalize(dishQuery)) ||
        normalize(d.description).includes(normalize(dishQuery)))
    : all;

  document.getElementById('dishCount').textContent =
    filtered.length + (filtered.length === 1 ? ' prato' : ' pratos');

  const grid = document.getElementById('dishGrid');
  if (!filtered.length) {
    grid.innerHTML = '<div class="empty">Nenhum prato encontrado.</div>';
    return;
  }

  grid.innerHTML = filtered.map(d => dishCardHtml(d, rests, user)).join('');

  // fav handlers
  grid.querySelectorAll('.fav-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      const dishId = btn.dataset.dish;
      if (!user) { window.location.href = 'login.html'; return; }
      const isFav = Favorites.toggle(user.id, dishId);
      btn.classList.toggle('faved', isFav);
      btn.title = isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos';
      showToast(isFav ? '❤ Adicionado aos favoritos!' : 'Removido dos favoritos', isFav ? 'ok' : 'err');
    });
  });

  // card click → modal detalhe
  grid.querySelectorAll('.dish-card[data-dish]').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.fav-btn, .add-btn')) return;
      openDishModal(card.dataset.dish);
    });
    card.style.cursor = 'pointer';
  });

  // add to cart
  grid.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      Cart.add(btn.dataset.dish);
      updateCartBadge();
      showToast('🛒 Adicionado ao carrinho!');
    });
  });
}

function dishCardHtml(d, rests, user) {
  const rest   = rests.find(r => r.id === d.restaurantId);
  const isFav  = user ? Favorites.isFav(user.id, d.id) : false;
  const img    = d.image
    ? `<img class="dish-card-img" src="${esc(d.image)}" alt="${esc(d.name)}" loading="lazy" />`
    : `<div class="dish-card-img" style="background:rgba(16,185,129,.1);display:grid;place-items:center;font-size:2rem">🍽</div>`;
  return `
    <div class="dish-card" data-dish="${esc(d.id)}">
      ${img}
      <div class="dish-card-body">
        <div class="dish-card-top">
          <div style="min-width:0">
            <p class="dish-card-name">${esc(d.name)}</p>
            <p class="dish-card-rest">${esc(rest?.name || '—')}</p>
          </div>
          <button class="fav-btn${isFav ? ' faved' : ''}" data-dish="${esc(d.id)}"
            title="${isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}"
            aria-label="${isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}">
            ${isFav ? '❤' : '🤍'}
          </button>
        </div>
        <p class="dish-card-desc">${esc(d.description || '')}</p>
        ${d.restrictions?.length ? `<div class="tags">
          ${d.restrictions.slice(0, 3).map(x => `<span class="tag">${esc(restrictionLabel(x))}</span>`).join('')}
        </div>` : ''}
        <div class="dish-card-footer">
          <span class="dish-price">${brl(d.price)}</span>
          <button class="btn primary add-btn" data-dish="${esc(d.id)}"
            style="padding:.45rem .9rem;font-size:.85rem">+ Carrinho</button>
        </div>
      </div>
    </div>`;
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
    <p class="muted" style="margin:0 0 .35rem;font-size:.85rem">${esc(rest?.name || '')} · ${esc(d.category || '')}</p>
    <p class="dish-modal-price">${brl(d.price)}</p>
    <p style="color:var(--text-muted);line-height:1.6;margin:.5rem 0 .75rem">${esc(d.description || '')}</p>
    ${d.restrictions?.length ? `<div class="tags" style="margin-bottom:.75rem">
      ${d.restrictions.map(x => `<span class="tag">${esc(restrictionLabel(x))}</span>`).join('')}
    </div>` : ''}
    ${d.allergens ? `<span class="dish-modal-aller">⚠ ${esc(d.allergens)}</span>` : ''}
    ${d.calories   ? `<p class="muted small" style="margin:.5rem 0 0">🔥 ${esc(String(d.calories))} kcal</p>` : ''}
    <div style="display:flex;gap:.75rem;margin-top:1.25rem;flex-wrap:wrap">
      <button class="btn primary" id="modalAddCart" data-dish="${esc(d.id)}">🛒 Adicionar ao carrinho</button>
      <button class="btn ghost fav-btn${isFav?' faved':''}" id="modalFav" data-dish="${esc(d.id)}">
        ${isFav ? '❤ Favoritado' : '🤍 Favoritar'}
      </button>
      <a class="btn ghost" href="restaurante.html?id=${esc(d.restaurantId)}">Ver restaurante →</a>
    </div>`;

  document.getElementById('modalAddCart').onclick = () => {
    Cart.add(d.id); updateCartBadge();
    showToast('🛒 Adicionado ao carrinho!');
    closeDishModal();
  };
  document.getElementById('modalFav').onclick = () => {
    if (!user) { window.location.href = 'login.html'; return; }
    const now = Favorites.toggle(user.id, d.id);
    const btn = document.getElementById('modalFav');
    btn.className = `btn ghost fav-btn${now?' faved':''}`;
    btn.innerHTML = now ? '❤ Favoritado' : '🤍 Favoritar';
    showToast(now ? '❤ Adicionado aos favoritos!' : 'Removido dos favoritos', now ? 'ok' : 'err');
    renderDishGrid(); // atualiza cards
  };

  document.getElementById('dishModal').classList.add('open');
}

function closeDishModal() {
  document.getElementById('dishModal').classList.remove('open');
}

/* ── Hero search ────────────────────────────────────────────────── */
function heroSearch(e) {
  e.preventDefault();
  const q = document.getElementById('heroQ').value.trim();
  if (!q) return;
  // scroll para a seção de restaurantes e aplica filtro
  document.getElementById('restQ').value = q;
  restQuery = q.toLowerCase();
  renderRestGrid();
  document.getElementById('restGrid').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ── Hamburger ──────────────────────────────────────────────────── */
function setupHamburger() {
  const btn   = document.getElementById('hamburger');
  const links = document.getElementById('navLinks');
  if (btn && links) {
    btn.onclick = () => links.classList.toggle('open');
  }
}
