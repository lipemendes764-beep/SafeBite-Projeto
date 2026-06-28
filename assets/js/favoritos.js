'use strict';
/* ── favoritos.js ───────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth('login.html')) return;
  applyNavSession();
  setupHamburger();
  render();
});

function render() {
  const user   = Auth.current();
  const el     = document.getElementById('favGrid');

  if (!user) {
    el.innerHTML = `
      <div class="fav-empty">
        <div class="ico">🔐</div>
        <h2>Entre para ver seus favoritos</h2>
        <p>Faça login para salvar e acessar seus pratos preferidos.</p>
        <a class="btn primary" href="login.html?next=favoritos.html">Entrar</a>
      </div>`;
    return;
  }

  const favIds = Favorites.ofUser(user.id);
  const rests  = Restaurants.all();

  if (!favIds.length) {
    el.innerHTML = `
      <div class="fav-empty">
        <div class="ico">🤍</div>
        <h2>Você ainda não possui itens favoritos cadastrados.</h2>
        <p>Explore restaurantes e pratos e salve seus favoritos clicando no coração ❤.</p>
        <a class="btn primary" href="index.html">Explorar restaurantes</a>
      </div>`;
    return;
  }

  const dishes = favIds.map(id => Dishes.byId(id)).filter(Boolean);

  if (!dishes.length) {
    el.innerHTML = `<div class="empty">Nenhum prato encontrado. Talvez tenham sido removidos.</div>`;
    return;
  }

  el.innerHTML = `<div class="cards" id="favCards">${dishes.map(d => {
    const rest = rests.find(r => r.id === d.restaurantId);
    const img  = d.image
      ? `<img class="dish-card-img" src="${esc(d.image)}" alt="${esc(d.name)}" loading="lazy" />`
      : `<div class="dish-card-img" style="background:rgba(16,185,129,.1);display:grid;place-items:center;font-size:2rem">🍽</div>`;
    return `
      <div class="dish-card" data-dish="${esc(d.id)}" style="cursor:pointer">
        ${img}
        <div class="dish-card-body">
          <div class="dish-card-top">
            <div style="min-width:0">
              <p class="dish-card-name">${esc(d.name)}</p>
              <p class="dish-card-rest">${esc(rest?.name || '—')}</p>
            </div>
            <button class="fav-btn faved" data-dish="${esc(d.id)}" title="Remover dos favoritos">❤</button>
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
  }).join('')}</div>`;

  // click → detalhes
  el.querySelectorAll('.dish-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.fav-btn,.add-btn')) return;
      location.href = 'detalhes.html?id=' + card.dataset.dish;
    });
  });

  // remover favorito
  el.querySelectorAll('.fav-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      Favorites.toggle(user.id, btn.dataset.dish);
      showToast('Removido dos favoritos', 'err');
      render(); // re-render
    });
  });

  // adicionar ao carrinho
  el.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      Cart.add(btn.dataset.dish);
      updateCartBadge();
      showToast('🛒 Adicionado ao carrinho!');
    });
  });
}

function setupHamburger() {
  const btn   = document.getElementById('hamburger');
  const links = document.getElementById('navLinks');
  if (btn && links) btn.onclick = () => links.classList.toggle('open');
}
