'use strict';
/* ── search.js: Barra de pesquisa global da navbar ──────────────── */

(function () {
  const PAGES = [
    { label: 'Início',           href: 'index.html',           icon: '🏠' },
    { label: 'Favoritos',        href: 'favoritos.html',        icon: '❤' },
    { label: 'Carrinho',         href: 'carrinho.html',         icon: '🛒' },
    { label: 'Entrar / Login',   href: 'login.html',            icon: '🔐' },
    { label: 'Criar conta',      href: 'cadastro-usuario.html', icon: '👤' },
    { label: 'Painel Admin',     href: 'admin.html',            icon: '⚙' },
  ];

  function search(q) {
    if (!q || q.trim().length < 2) return null;
    const rests  = Restaurants.all();
    const dishes = Dishes.all();

    const matchedPages = PAGES.filter(p => normalize(p.label).includes(normalize(q))).slice(0, 3);
    const matchedRests = rests.filter(r =>
      normalize(r.name).includes(normalize(q)) || normalize(r.cuisine).includes(normalize(q))
    ).slice(0, 4);
    const matchedDishes = dishes.filter(d =>
      normalize(d.name).includes(normalize(q)) || normalize(d.description).includes(normalize(q))
    ).slice(0, 4);

    return { pages: matchedPages, restaurants: matchedRests, dishes: matchedDishes };
  }

  function render(results, container) {
    if (!results) { container.classList.remove('open'); return; }
    const total = results.pages.length + results.restaurants.length + results.dishes.length;

    if (total === 0) {
      container.innerHTML = '<p class="nav-search-empty">Nenhum resultado encontrado.</p>';
      container.classList.add('open');
      return;
    }

    let html = '';

    if (results.pages.length) {
      html += '<div class="nav-search-group"><div class="nav-search-group-label">Páginas</div>';
      html += results.pages.map(p =>
        `<a class="nav-search-item" href="${esc(p.href)}">
           <i class="nav-search-item-icon">${p.icon}</i><span>${esc(p.label)}</span>
         </a>`).join('');
      html += '</div>';
    }

    if (results.restaurants.length) {
      if (results.pages.length) html += '<div class="nav-search-divider"></div>';
      html += '<div class="nav-search-group"><div class="nav-search-group-label">Restaurantes</div>';
      html += results.restaurants.map(r =>
        `<a class="nav-search-item" href="restaurante.html?id=${esc(r.id)}">
           <i class="nav-search-item-icon">🏪</i>
           <span>${esc(r.name)}</span>
           <span class="nav-search-item-sub">${esc(r.cuisine || '')}</span>
         </a>`).join('');
      html += '</div>';
    }

    if (results.dishes.length) {
      if (results.pages.length + results.restaurants.length) html += '<div class="nav-search-divider"></div>';
      html += '<div class="nav-search-group"><div class="nav-search-group-label">Pratos</div>';
      html += results.dishes.map(d =>
        `<a class="nav-search-item" href="detalhes.html?id=${esc(d.id)}">
           <i class="nav-search-item-icon">🍽</i>
           <span>${esc(d.name)}</span>
           <span class="nav-search-item-sub">${brl(d.price)}</span>
         </a>`).join('');
      html += '</div>';
    }

    container.innerHTML = html;
    container.classList.add('open');
  }

  function init() {
    const input    = document.getElementById('globalSearch');
    const dropdown = document.getElementById('globalSearchResults');
    if (!input || !dropdown) return;

    let timer;
    input.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => render(search(input.value), dropdown), 180);
    });
    input.addEventListener('focus', () => {
      if (input.value.trim().length >= 2) render(search(input.value), dropdown);
    });

    document.addEventListener('click', e => {
      if (!input.contains(e.target) && !dropdown.contains(e.target))
        dropdown.classList.remove('open');
    });

    input.addEventListener('keydown', e => {
      const items   = dropdown.querySelectorAll('.nav-search-item');
      const focused = dropdown.querySelector('.nav-search-item.focused');
      let idx = [...items].indexOf(focused);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (focused) focused.classList.remove('focused');
        items[(idx + 1) % items.length]?.classList.add('focused');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (focused) focused.classList.remove('focused');
        items[(idx - 1 + items.length) % items.length]?.classList.add('focused');
      } else if (e.key === 'Enter') {
        const f = dropdown.querySelector('.nav-search-item.focused');
        if (f) { e.preventDefault(); f.click(); }
      } else if (e.key === 'Escape') {
        dropdown.classList.remove('open'); input.blur();
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
