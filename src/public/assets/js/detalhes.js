'use strict';
/* ── detalhes.js: Detalhe de prato individual ──────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  applyNavSession();
  setupHamburger();

  const params = new URLSearchParams(location.search);
  const dishId = params.get('id');
  const el     = document.getElementById('detalhesContent');
  const d      = dishId ? Dishes.byId(dishId) : null;

  if (!d) {
    el.innerHTML = `<div class="empty"><p>Prato não encontrado.</p>
      <a class="btn primary" href="index.html">← Voltar ao início</a></div>`;
    return;
  }

  const user  = Auth.current();
  const rest  = Restaurants.byId(d.restaurantId);
  const isFav = user ? Favorites.isFav(user.id, d.id) : false;
  document.title = d.name + ' — SafeBite';

  el.innerHTML = `
    <a class="link" href="${esc(rest ? 'restaurante.html?id=' + rest.id : 'index.html')}"
      style="display:inline-flex;align-items:center;gap:.35rem;margin-bottom:1.5rem">
      ← ${esc(rest ? rest.name : 'Voltar')}
    </a>
    <div class="grid" style="align-items:start">
      <div>
        ${d.image
          ? `<img src="${esc(d.image)}" alt="${esc(d.name)}"
               style="width:100%;border-radius:var(--radius-xl);max-height:380px;object-fit:cover;display:block" />`
          : `<div style="width:100%;height:260px;background:rgba(16,185,129,.1);border-radius:var(--radius-xl);display:grid;place-items:center;font-size:4rem">🍽</div>`}
      </div>
      <div>
        <span class="eyebrow">${esc(d.category || 'Prato')}</span>
        <h1 style="margin:.25rem 0 .5rem">${esc(d.name)}</h1>
        <p class="muted" style="margin:0 0 .35rem">
          🏪 <a class="link" href="restaurante.html?id=${esc(d.restaurantId)}">${esc(rest?.name || '—')}</a>
        </p>
        <p class="dish-modal-price">${brl(d.price)}</p>
        <p style="color:var(--text-muted);line-height:1.65;margin:1rem 0">${esc(d.description || '')}</p>

        ${d.restrictions?.length ? `
        <div style="margin-bottom:1rem">
          <p class="small muted" style="margin-bottom:.4rem">✅ Restrições atendidas</p>
          <div class="tags">${d.restrictions.map(x => `<span class="tag">${esc(restrictionLabel(x))}</span>`).join('')}</div>
        </div>` : ''}

        ${d.allergens ? `<p class="dish-modal-aller" style="margin-bottom:1rem">⚠ ${esc(d.allergens)}</p>` : ''}
        ${d.calories  ? `<p class="muted small" style="margin-bottom:1rem">🔥 ${esc(String(d.calories))} kcal</p>` : ''}

        <div style="display:flex;gap:.75rem;flex-wrap:wrap">
          <button class="btn primary" id="detAddCart">🛒 Adicionar ao carrinho</button>
          <button class="btn ghost fav-btn${isFav?' faved':''}" id="detFav">
            ${isFav ? '❤ Favoritado' : '🤍 Favoritar'}
          </button>
        </div>
      </div>
    </div>`;

  document.getElementById('detAddCart').onclick = () => {
    Cart.add(d.id); updateCartBadge();
    showToast('🛒 Adicionado ao carrinho!');
  };

  document.getElementById('detFav').onclick = () => {
    if (!user) { location.href = 'login.html'; return; }
    const now = Favorites.toggle(user.id, d.id);
    const btn = document.getElementById('detFav');
    btn.className = `btn ghost fav-btn${now?' faved':''}`;
    btn.innerHTML = now ? '❤ Favoritado' : '🤍 Favoritar';
    showToast(now ? '❤ Adicionado aos favoritos!' : 'Removido dos favoritos', now ? 'ok' : 'err');
  };
});

function setupHamburger() {
  const btn   = document.getElementById('hamburger');
  const links = document.getElementById('navLinks');
  if (btn && links) btn.onclick = () => links.classList.toggle('open');
}
