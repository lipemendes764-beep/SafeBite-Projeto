'use strict';
/* ── perfil.js ──────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth('login.html')) return;
  applyNavSession();
  setupHamburger();
  setupSideNav();
  renderSidebar();
  renderVisaoGeral();
  setupFormDados();
  setupFormSenha();
});

/* ── Sidebar (avatar, nome, badge) ─────────────────────────────── */
function renderSidebar() {
  const u = Auth.current();
  if (!u) return;
  const initials = u.nome.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  document.getElementById('sideAvatar').textContent = initials;
  document.getElementById('sideNome').textContent   = u.nome;
  document.getElementById('sideLogin').textContent  = '@' + u.login;
  const badge = document.getElementById('sideBadge');
  badge.textContent = u.admin ? '⭐ Administrador' : '👤 Cliente';
  badge.className   = 'perfil-badge ' + (u.admin ? 'admin' : 'user');
}

/* ── Navegação lateral ──────────────────────────────────────────── */
function setupSideNav() {
  document.querySelectorAll('.perfil-side-link[data-panel]').forEach(btn => {
    btn.addEventListener('click', () => {
      // botões
      document.querySelectorAll('.perfil-side-link').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // painéis
      document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
      const panel = document.getElementById('panel-' + btn.dataset.panel);
      if (panel) panel.classList.add('active');
      // carrega conteúdo sob demanda
      const loaders = {
        'restricoes': renderRestrições,
        'fav-rest':   renderFavRestaurantes,
        'fav-pratos': renderFavPratos,
        'dados':      preencherFormDados,
      };
      loaders[btn.dataset.panel]?.();
    });
  });
}

/* ── Painel: Visão Geral ────────────────────────────────────────── */
function renderVisaoGeral() {
  const u       = Auth.current();
  const favIds  = Favorites.ofUser(u.id);
  const favRest = getFavRestaurants(u);
  const restr   = u.restrictions || [];

  // Quick stats
  document.getElementById('quickStats').innerHTML = [
    { val: favIds.length,   label: 'Pratos favoritos'        },
    { val: favRest.length,  label: 'Restaurantes favoritos'  },
    { val: restr.length,    label: 'Restrições configuradas' },
  ].map(s => `
    <div class="qs">
      <p class="qs-val">${s.val}</p>
      <p class="qs-label">${s.label}</p>
    </div>`).join('');

  // Restrições ativas
  const el = document.getElementById('visaoRestr');
  if (restr.length) {
    el.innerHTML = `
      <div style="margin-top:.25rem">
        <p class="small muted" style="margin-bottom:.5rem">🥗 Suas restrições ativas:</p>
        <div class="tags">
          ${restr.map(r => {
            const entry = RESTRICTIONS_MAP.find(([k]) => k === r);
            return `<span class="tag">${entry ? entry[2] + ' ' + entry[1] : esc(r)}</span>`;
          }).join('')}
        </div>
        <button class="btn ghost" data-panel="restricoes"
          style="margin-top:.85rem;padding:.45rem .9rem;font-size:.82rem"
          onclick="switchPanel('restricoes')">Editar restrições →</button>
      </div>`;
  } else {
    el.innerHTML = `
      <div class="empty" style="padding:1.5rem;margin-top:.5rem">
        <p style="margin:0 0 .75rem">Você ainda não configurou suas restrições alimentares.</p>
        <button class="btn primary" style="padding:.5rem 1rem;font-size:.88rem"
          onclick="switchPanel('restricoes')">Configurar agora</button>
      </div>`;
  }
}

function switchPanel(name) {
  document.querySelectorAll('.perfil-side-link').forEach(b => {
    b.classList.toggle('active', b.dataset.panel === name);
  });
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById('panel-' + name);
  if (panel) panel.classList.add('active');
  const loaders = {
    'restricoes': renderRestrições,
    'fav-rest':   renderFavRestaurantes,
    'fav-pratos': renderFavPratos,
    'dados':      preencherFormDados,
  };
  loaders[name]?.();
}

/* ── Painel: Restrições ─────────────────────────────────────────── */
function renderRestrições() {
  const u       = Auth.current();
  const saved   = u.restrictions || [];
  const grid    = document.getElementById('restricoesGrid');

  grid.innerHTML = RESTRICTIONS_MAP.map(([id, label, icon]) => `
    <label class="rest-chip${saved.includes(id) ? ' selected' : ''}" data-id="${esc(id)}">
      <span class="rest-chip-icon">${icon}</span>
      <span>${esc(label)}</span>
      <span class="rest-chip-check">✓</span>
      <input type="checkbox" style="display:none" ${saved.includes(id) ? 'checked' : ''} />
    </label>`).join('');

  // toggle visual
  grid.querySelectorAll('.rest-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('selected');
      chip.querySelector('input').checked = chip.classList.contains('selected');
    });
  });

  // botões
  document.getElementById('btnSalvarRestr').onclick = salvarRestrições;
  document.getElementById('btnLimparRestr').onclick = () => {
    grid.querySelectorAll('.rest-chip').forEach(c => {
      c.classList.remove('selected');
      c.querySelector('input').checked = false;
    });
  };

  renderPratosCompativeis(saved);
}

function salvarRestrições() {
  const selecionadas = [...document.querySelectorAll('.rest-chip.selected')]
    .map(c => c.dataset.id);

  const updated = Auth.updateCurrent({ restrictions: selecionadas });
  if (!updated) { showToast('Erro ao salvar', 'err'); return; }

  const msg = document.getElementById('msgRestr');
  msg.className = 'msg ok';
  msg.textContent = selecionadas.length
    ? `✅ ${selecionadas.length} restrição(ões) salva(s) com sucesso!`
    : '✅ Restrições removidas.';
  msg.style.display = '';
  setTimeout(() => { msg.style.display = 'none'; }, 3000);

  showToast('🥗 Restrições atualizadas!');
  renderPratosCompativeis(selecionadas);
  renderVisaoGeral(); // atualiza stats
}

/* ── Pratos compatíveis com as restrições do usuário ───────────── */
function renderPratosCompativeis(restr) {
  const grid = document.getElementById('pratosCompatGrid');
  const card = document.getElementById('cardPratosCompat');

  if (!restr.length) {
    card.style.display = 'none';
    return;
  }
  card.style.display = '';

  const u      = Auth.current();
  const rests  = Restaurants.all();
  const dishes = Dishes.all().filter(d =>
    restr.every(r => (d.restrictions || []).includes(r))
  );

  if (!dishes.length) {
    grid.innerHTML = `<div class="empty" style="grid-column:1/-1">
      Nenhum prato encontrado que atenda a todas as suas restrições simultaneamente.
    </div>`;
    return;
  }

  // banner informativo
  const banner = card.querySelector('.filtered-banner') || (() => {
    const b = document.createElement('div');
    b.className = 'filtered-banner';
    grid.before(b);
    return b;
  })();
  banner.innerHTML = `🔍 Exibindo <strong>${dishes.length} prato(s)</strong> compatíveis com suas ${restr.length} restrição(ões) selecionada(s).`;

  grid.innerHTML = dishes.map(d => {
    const rest  = rests.find(r => r.id === d.restaurantId);
    const isFav = Favorites.isFav(u.id, d.id);
    const img   = d.image
      ? `<img class="dish-card-img" src="${esc(d.image)}" alt="${esc(d.name)}" loading="lazy" />`
      : `<div class="dish-card-img" style="background:rgba(16,185,129,.1);display:grid;place-items:center;font-size:2rem">🍽</div>`;
    return `
      <div class="dish-card" style="cursor:pointer" data-dish="${esc(d.id)}">
        ${img}
        <div class="dish-card-body">
          <div class="dish-card-top">
            <div style="min-width:0">
              <p class="dish-card-name">${esc(d.name)}</p>
              <p class="dish-card-rest">${esc(rest?.name || '—')}</p>
            </div>
            <button class="fav-btn${isFav ? ' faved' : ''}" data-dish="${esc(d.id)}"
              title="${isFav ? 'Remover dos favoritos' : 'Favoritar'}">
              ${isFav ? '❤' : '🤍'}
            </button>
          </div>
          <p class="dish-card-desc">${esc(d.description || '')}</p>
          <div class="dish-card-footer">
            <span class="dish-price">${brl(d.price)}</span>
            <a class="btn primary" href="detalhes.html?id=${esc(d.id)}"
              style="padding:.4rem .8rem;font-size:.82rem">Ver prato</a>
          </div>
        </div>
      </div>`;
  }).join('');

  // click no card → detalhes
  grid.querySelectorAll('.dish-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.fav-btn, a')) return;
      location.href = 'detalhes.html?id=' + card.dataset.dish;
    });
  });

  // toggle favorito
  grid.querySelectorAll('.fav-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const now = Favorites.toggle(u.id, btn.dataset.dish);
      btn.classList.toggle('faved', now);
      btn.innerHTML = now ? '❤' : '🤍';
      showToast(now ? '❤ Adicionado aos favoritos!' : 'Removido dos favoritos', now ? 'ok' : 'err');
    });
  });
}

/* ── Painel: Restaurantes Favoritos ────────────────────────────── */
function getFavRestaurants(u) {
  const ids = u.favRestaurants || [];
  return ids.map(id => Restaurants.byId(id)).filter(Boolean);
}

function renderFavRestaurantes() {
  const u    = Auth.current();
  const list = getFavRestaurants(u);
  const el   = document.getElementById('favRestGrid');

  if (!list.length) {
    el.innerHTML = `
      <div class="fav-empty" style="padding:2rem">
        <div class="ico">🏪</div>
        <h3 style="margin:0 0 .5rem">Nenhum restaurante favorito ainda</h3>
        <p style="margin:0 0 1.25rem;color:var(--text-muted)">
          Acesse a página de um restaurante e clique em "❤ Favoritar" para salvá-lo aqui.
        </p>
        <a class="btn primary" href="index.html">Explorar restaurantes</a>
      </div>`;
    return;
  }

  el.innerHTML = `<div style="display:flex;flex-direction:column;gap:.75rem">
    ${list.map(r => {
      const thumb = r.image
        ? `<img class="fav-rest-thumb" src="${esc(r.image)}" alt="${esc(r.name)}" />`
        : `<div class="fav-rest-thumb">🍽</div>`;
      return `
        <div class="fav-rest-card">
          ${thumb}
          <div class="fav-rest-info">
            <p class="fav-rest-name">${esc(r.name)}</p>
            <p class="fav-rest-sub">${esc(r.cuisine || '')}${r.city ? ' · ' + r.city : ''}</p>
            ${r.restrictions?.length ? `<div class="tags" style="margin-top:.35rem">
              ${r.restrictions.slice(0, 3).map(x => `<span class="tag">${esc(restrictionLabel(x))}</span>`).join('')}
            </div>` : ''}
          </div>
          <div style="display:flex;flex-direction:column;gap:.4rem;align-items:flex-end">
            <a class="btn ghost" href="restaurante.html?id=${esc(r.id)}"
              style="padding:.4rem .85rem;font-size:.82rem;white-space:nowrap">Ver cardápio →</a>
            <button class="btn danger fav-rest-remove" data-id="${esc(r.id)}"
              style="padding:.4rem .85rem;font-size:.78rem">Remover</button>
          </div>
        </div>`;
    }).join('')}
  </div>`;

  el.querySelectorAll('.fav-rest-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const ids = (Auth.current().favRestaurants || []).filter(id => id !== btn.dataset.id);
      Auth.updateCurrent({ favRestaurants: ids });
      showToast('Restaurante removido dos favoritos', 'err');
      renderFavRestaurantes();
      renderVisaoGeral();
    });
  });
}

/* ── Painel: Pratos Favoritos ───────────────────────────────────── */
function renderFavPratos() {
  const u      = Auth.current();
  const favIds = Favorites.ofUser(u.id);
  const rests  = Restaurants.all();
  const el     = document.getElementById('favPratosGrid');

  if (!favIds.length) {
    el.innerHTML = `
      <div class="fav-empty" style="padding:2rem;grid-column:1/-1">
        <div class="ico">🤍</div>
        <h3 style="margin:0 0 .5rem">Você ainda não possui pratos favoritos</h3>
        <p style="margin:0 0 1.25rem;color:var(--text-muted)">
          Clique no ❤ em qualquer prato para salvá-lo aqui.
        </p>
        <a class="btn primary" href="index.html">Explorar pratos</a>
      </div>`;
    return;
  }

  const dishes = favIds.map(id => Dishes.byId(id)).filter(Boolean);

  el.innerHTML = dishes.map(d => {
    const rest = rests.find(r => r.id === d.restaurantId);
    const img  = d.image
      ? `<img class="dish-card-img" src="${esc(d.image)}" alt="${esc(d.name)}" loading="lazy" />`
      : `<div class="dish-card-img" style="background:rgba(16,185,129,.1);display:grid;place-items:center;font-size:2rem">🍽</div>`;
    return `
      <div class="dish-card" style="cursor:pointer" data-dish="${esc(d.id)}">
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
            <a class="btn primary" href="detalhes.html?id=${esc(d.id)}"
              style="padding:.4rem .8rem;font-size:.82rem">Ver prato</a>
          </div>
        </div>
      </div>`;
  }).join('');

  // click no card
  el.querySelectorAll('.dish-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.fav-btn, a')) return;
      location.href = 'detalhes.html?id=' + card.dataset.dish;
    });
  });

  // remover favorito
  el.querySelectorAll('.fav-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      Favorites.toggle(u.id, btn.dataset.dish);
      showToast('Removido dos favoritos', 'err');
      renderFavPratos();
      renderVisaoGeral();
    });
  });
}

/* ── Painel: Editar dados ───────────────────────────────────────── */
function preencherFormDados() {
  const u = Auth.current();
  document.getElementById('dNome').value  = u.nome  || '';
  document.getElementById('dEmail').value = u.email || '';
}

function setupFormDados() {
  document.getElementById('formDados').addEventListener('submit', e => {
    e.preventDefault();
    const nome  = document.getElementById('dNome').value.trim();
    const email = document.getElementById('dEmail').value.trim();
    const msg   = document.getElementById('msgDados');

    if (!nome || !email) {
      msg.className = 'msg err'; msg.textContent = 'Preencha todos os campos.'; msg.style.display = '';
      return;
    }

    // verifica e-mail duplicado em outro usuário
    const users = JSON.parse(localStorage.getItem('sb_users') || '[]');
    const u     = Auth.current();
    const dup   = users.find(x => x.email === email && x.id !== u.id);
    if (dup) {
      msg.className = 'msg err'; msg.textContent = 'E-mail já está em uso por outra conta.'; msg.style.display = '';
      return;
    }

    Auth.updateCurrent({ nome, email });
    renderSidebar();

    msg.className = 'msg ok'; msg.textContent = '✅ Dados atualizados com sucesso!'; msg.style.display = '';
    setTimeout(() => { msg.style.display = 'none'; }, 3000);
    showToast('✅ Dados salvos!');
  });
}

/* ── Painel: Alterar senha ──────────────────────────────────────── */
function setupFormSenha() {
  document.getElementById('formSenha').addEventListener('submit', e => {
    e.preventDefault();
    const atual   = document.getElementById('sAtual').value;
    const nova    = document.getElementById('sNova').value;
    const confirm = document.getElementById('sConfirm').value;
    const msg     = document.getElementById('msgSenha');
    const u       = Auth.current();

    if (!atual || !nova || !confirm) {
      msg.className = 'msg err'; msg.textContent = 'Preencha todos os campos.'; msg.style.display = '';
      return;
    }
    if (u.senha !== atual) {
      msg.className = 'msg err'; msg.textContent = 'Senha atual incorreta.'; msg.style.display = '';
      return;
    }
    if (nova.length < 3) {
      msg.className = 'msg err'; msg.textContent = 'A nova senha deve ter no mínimo 3 caracteres.'; msg.style.display = '';
      return;
    }
    if (nova !== confirm) {
      msg.className = 'msg err'; msg.textContent = 'As senhas não conferem.'; msg.style.display = '';
      return;
    }

    Auth.updateCurrent({ senha: nova });

    document.getElementById('sAtual').value   = '';
    document.getElementById('sNova').value    = '';
    document.getElementById('sConfirm').value = '';

    msg.className = 'msg ok'; msg.textContent = '✅ Senha alterada com sucesso!'; msg.style.display = '';
    setTimeout(() => { msg.style.display = 'none'; }, 3000);
    showToast('🔒 Senha alterada!');
  });
}

/* ── Hamburger ──────────────────────────────────────────────────── */
function setupHamburger() {
  const btn   = document.getElementById('hamburger');
  const links = document.getElementById('navLinks');
  if (btn && links) btn.onclick = () => links.classList.toggle('open');
}
