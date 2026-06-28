'use strict';
/* ── admin.js: Painel administrativo (CRUD completo) ────────────── */

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAdmin()) return;
  applyNavSession();
  setupHamburger();
  setupSidebar();
  showPanel('dashboard');

  document.getElementById('crudModalClose').onclick = closeCrudModal;
  document.getElementById('crudModal').addEventListener('click', e => {
    if (e.target.id === 'crudModal') closeCrudModal();
  });
});

/* ── Sidebar ────────────────────────────────────────────────────── */
function setupSidebar() {
  document.querySelectorAll('.admin-nav-link[data-panel]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      document.querySelectorAll('.admin-nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      showPanel(link.dataset.panel);
    });
  });
}

function showPanel(panel) {
  const panels = { dashboard, restaurants, dishes, users };
  (panels[panel] || dashboard)();
}

/* ── Dashboard ──────────────────────────────────────────────────── */
function dashboard() {
  const rests   = Restaurants.all();
  const allDish = Dishes.all();
  const usersList = (function(){ try{return JSON.parse(localStorage.getItem('sb_users'))||[];}catch{return []} })();
  const favMap  = (function(){ try{return JSON.parse(localStorage.getItem('sb_favorites'))||{};}catch{return {}} })();
  const totalFavs = Object.values(favMap).reduce((s,a) => s + a.length, 0);

  document.getElementById('adminContent').innerHTML = `
    <div class="eyebrow">📊 Visão geral</div>
    <h1>Dashboard</h1>
    <p class="lead">Bem-vindo ao painel administrativo do SafeBite.</p>

    <div class="kpis">
      <div class="kpi"><div class="kpi-label">Restaurantes</div><div class="kpi-value">${rests.length}</div></div>
      <div class="kpi"><div class="kpi-label">Pratos</div><div class="kpi-value">${allDish.length}</div></div>
      <div class="kpi"><div class="kpi-label">Usuários</div><div class="kpi-value">${usersList.length}</div></div>
      <div class="kpi"><div class="kpi-label">Favoritos (total)</div><div class="kpi-value">${totalFavs}</div></div>
    </div>

    <div class="grid" style="margin-top:0">
      <div class="card">
        <div class="card-head">
          <div><h3>Restaurantes recentes</h3><p class="card-sub">Últimos cadastrados</p></div>
          <button class="btn ghost" onclick="showPanel('restaurants')" style="padding:.4rem .8rem;font-size:.82rem">Ver todos</button>
        </div>
        ${rests.slice(-3).reverse().map(r => `
          <div class="summary-row">
            <span style="color:var(--text)">${esc(r.name)}</span>
            <span class="rest-card-badge ${r.open ? 'badge-open' : 'badge-closed'}">${r.open ? 'Aberto' : 'Fechado'}</span>
          </div>`).join('')}
      </div>
      <div class="card">
        <div class="card-head">
          <div><h3>Pratos recentes</h3><p class="card-sub">Últimos cadastrados</p></div>
          <button class="btn ghost" onclick="showPanel('dishes')" style="padding:.4rem .8rem;font-size:.82rem">Ver todos</button>
        </div>
        ${allDish.slice(-4).reverse().map(d => `
          <div class="summary-row">
            <span style="color:var(--text)">${esc(d.name)}</span>
            <span class="price" style="font-size:.9rem">${brl(d.price)}</span>
          </div>`).join('')}
      </div>
    </div>`;
}

/* ── Restaurantes CRUD ──────────────────────────────────────────── */
function restaurants() {
  const list = Restaurants.all();
  document.getElementById('adminContent').innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:1rem;margin-bottom:1.5rem">
      <div>
        <div class="eyebrow">🏪 Gestão</div>
        <h1 style="margin:0">Restaurantes</h1>
      </div>
      <button class="btn primary" id="btnNewRest">+ Novo restaurante</button>
    </div>
    <div class="table-container">
      <table>
        <thead><tr>
          <th>Nome</th><th>Cozinha</th><th>Cidade</th><th>Status</th><th>Destaque</th><th>Ações</th>
        </tr></thead>
        <tbody>
          ${list.map(r => `
            <tr>
              <td style="color:var(--text);font-weight:500">${esc(r.name)}</td>
              <td>${esc(r.cuisine || '—')}</td>
              <td>${esc(r.city ? r.city + '/' + r.state : '—')}</td>
              <td><span class="rest-card-badge ${r.open ? 'badge-open' : 'badge-closed'}">${r.open ? 'Aberto' : 'Fechado'}</span></td>
              <td>${r.featured ? '<span class="tag">⭐ Sim</span>' : '<span style="color:var(--text-faint)">Não</span>'}</td>
              <td>
                <div style="display:flex;gap:.4rem">
                  <button class="btn ghost" data-id="${esc(r.id)}" onclick="editRestaurant('${esc(r.id)}')"
                    style="padding:.35rem .7rem;font-size:.8rem">Editar</button>
                  <button class="btn danger" data-id="${esc(r.id)}" onclick="deleteRestaurant('${esc(r.id)}')"
                    style="padding:.35rem .7rem;font-size:.8rem">Excluir</button>
                </div>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;

  document.getElementById('btnNewRest').onclick = () => openRestForm(null);
}

function openRestForm(r) {
  document.getElementById('crudModalTitle').textContent = r ? 'Editar restaurante' : 'Novo restaurante';
  document.getElementById('crudModalBody').innerHTML = `
    <form id="restForm" novalidate>
      <div class="field"><label>Nome <span class="req">*</span></label>
        <input class="input" id="rf-name" value="${esc(r?.name||'')}" required /></div>
      <div class="field"><label>Tipo de cozinha</label>
        <input class="input" id="rf-cuisine" value="${esc(r?.cuisine||'')}" /></div>
      <div class="row2">
        <div class="field"><label>Cidade</label><input class="input" id="rf-city" value="${esc(r?.city||'')}" /></div>
        <div class="field"><label>UF</label><input class="input" id="rf-state" value="${esc(r?.state||'')}" maxlength="2" placeholder="SP" /></div>
      </div>
      <div class="field"><label>Telefone</label>
        <input class="input" id="rf-phone" value="${esc(r?.phone||'')}" /></div>
      <div class="field"><label>URL da imagem (card)</label>
        <input class="input" id="rf-image" type="url" value="${esc(r?.image||'')}" /></div>
      <div class="field"><label>URL do banner</label>
        <input class="input" id="rf-banner" type="url" value="${esc(r?.banner||'')}" /></div>
      <div class="field"><label>Descrição</label>
        <textarea class="input" id="rf-desc" rows="3">${esc(r?.description||'')}</textarea></div>
      <div class="row2">
        <div class="field"><label>Tempo de entrega</label>
          <input class="input" id="rf-delivery" value="${esc(r?.deliveryTime||'30-45 min')}" /></div>
        <div class="field"><label>Faixa de preço</label>
          <select id="rf-price">
            <option value="$" ${r?.priceRange==='$'?'selected':''}>$ Econômico</option>
            <option value="$$" ${r?.priceRange==='$$'||!r?.priceRange?'selected':''}>$$ Moderado</option>
            <option value="$$$" ${r?.priceRange==='$$$'?'selected':''}>$$$ Premium</option>
          </select>
        </div>
      </div>
      <div class="row2">
        <div class="field">
          <label style="display:flex;align-items:center;gap:.6rem;cursor:pointer">
            <input type="checkbox" id="rf-open" ${r?.open!==false?'checked':''} style="width:18px;height:18px;accent-color:var(--green)"/>
            Aberto agora
          </label>
        </div>
        <div class="field">
          <label style="display:flex;align-items:center;gap:.6rem;cursor:pointer">
            <input type="checkbox" id="rf-featured" ${r?.featured?'checked':''} style="width:18px;height:18px;accent-color:var(--green)"/>
            Exibir no destaque (carrossel)
          </label>
        </div>
      </div>
      <div style="display:flex;gap:.75rem;margin-top:.5rem">
        <button type="button" class="btn ghost" onclick="closeCrudModal()">Cancelar</button>
        <button type="button" class="btn primary" id="restSaveBtn">Salvar</button>
      </div>
    </form>`;

  document.getElementById('restSaveBtn').onclick = () => {
    const name = document.getElementById('rf-name').value.trim();
    if (!name) { showToast('Nome é obrigatório', 'err'); return; }
    const data = {
      name, cuisine: document.getElementById('rf-cuisine').value.trim(),
      city:         document.getElementById('rf-city').value.trim(),
      state:        document.getElementById('rf-state').value.trim().toUpperCase(),
      phone:        document.getElementById('rf-phone').value.trim(),
      image:        document.getElementById('rf-image').value.trim(),
      banner:       document.getElementById('rf-banner').value.trim(),
      description:  document.getElementById('rf-desc').value.trim(),
      deliveryTime: document.getElementById('rf-delivery').value.trim(),
      priceRange:   document.getElementById('rf-price').value,
      open:         document.getElementById('rf-open').checked,
      featured:     document.getElementById('rf-featured').checked,
      restrictions: r?.restrictions || [],
      rating:       r?.rating || 4.5, reviewCount: r?.reviewCount || 0, minOrder: r?.minOrder || 25,
    };
    if (r) Restaurants.update(r.id, data);
    else   Restaurants.create(data);
    closeCrudModal();
    showToast(r ? 'Restaurante atualizado!' : 'Restaurante cadastrado!');
    restaurants();
  };

  openCrudModal();
}

function editRestaurant(id) { openRestForm(Restaurants.byId(id)); }

function deleteRestaurant(id) {
  const r = Restaurants.byId(id);
  if (!r) return;
  if (!confirm(`Excluir "${r.name}" e todos os seus pratos?`)) return;
  Restaurants.remove(id);
  showToast('Restaurante excluído', 'err');
  restaurants();
}

/* ── Pratos CRUD ────────────────────────────────────────────────── */
function dishes() {
  const list  = Dishes.all();
  const rests = Restaurants.all();
  document.getElementById('adminContent').innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:1rem;margin-bottom:1.5rem">
      <div>
        <div class="eyebrow">🍽 Gestão</div>
        <h1 style="margin:0">Pratos</h1>
      </div>
      <button class="btn primary" id="btnNewDish">+ Novo prato</button>
    </div>
    <div class="table-container">
      <table>
        <thead><tr><th>Foto</th><th>Nome</th><th>Restaurante</th><th>Categoria</th><th>Preço</th><th>Ações</th></tr></thead>
        <tbody>
          ${list.map(d => {
            const rest = rests.find(r => r.id === d.restaurantId);
            return `
              <tr>
                <td>${d.image ? `<img src="${esc(d.image)}" style="width:44px;height:44px;object-fit:cover;border-radius:.4rem" alt="${esc(d.name)}" />` : '🍽'}</td>
                <td style="color:var(--text);font-weight:500">${esc(d.name)}</td>
                <td class="muted">${esc(rest?.name || '—')}</td>
                <td><span class="tag">${esc(d.category || '—')}</span></td>
                <td class="price">${brl(d.price)}</td>
                <td>
                  <div style="display:flex;gap:.4rem">
                    <button class="btn ghost" onclick="editDish('${esc(d.id)}')"
                      style="padding:.35rem .7rem;font-size:.8rem">Editar</button>
                    <button class="btn danger" onclick="deleteDish('${esc(d.id)}')"
                      style="padding:.35rem .7rem;font-size:.8rem">Excluir</button>
                  </div>
                </td>
              </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;

  document.getElementById('btnNewDish').onclick = () => openDishForm(null);
}

function openDishForm(d) {
  const rests = Restaurants.all();
  document.getElementById('crudModalTitle').textContent = d ? 'Editar prato' : 'Novo prato';
  document.getElementById('crudModalBody').innerHTML = `
    <form id="dishForm" novalidate>
      <div class="field"><label>Nome <span class="req">*</span></label>
        <input class="input" id="df-name" value="${esc(d?.name||'')}" required /></div>
      <div class="row2">
        <div class="field"><label>Restaurante <span class="req">*</span></label>
          <select id="df-rest">
            <option value="">Selecione…</option>
            ${rests.map(r => `<option value="${esc(r.id)}" ${d?.restaurantId===r.id?'selected':''}>${esc(r.name)}</option>`).join('')}
          </select>
        </div>
        <div class="field"><label>Categoria</label>
          <select id="df-cat">
            ${['Entradas','Pratos Principais','Sobremesas','Bebidas','Lanches'].map(c =>
              `<option ${d?.category===c?'selected':''}>${c}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="field"><label>Descrição</label>
        <textarea class="input" id="df-desc" rows="2">${esc(d?.description||'')}</textarea></div>
      <div class="row2">
        <div class="field"><label>Preço (R$) <span class="req">*</span></label>
          <input class="input" id="df-price" type="number" step="0.01" min="0" value="${d?.price||''}" required /></div>
        <div class="field"><label>Calorias</label>
          <input class="input" id="df-cal" type="number" min="0" value="${d?.calories||''}" /></div>
      </div>
      <div class="field"><label>Alergênicos</label>
        <input class="input" id="df-aller" value="${esc(d?.allergens||'')}" /></div>
      <div class="field"><label>URL da imagem</label>
        <input class="input" id="df-img" type="url" value="${esc(d?.image||'')}" /></div>
      <div class="field">
        <label style="display:flex;align-items:center;gap:.6rem;cursor:pointer">
          <input type="checkbox" id="df-featured" ${d?.featured?'checked':''} style="width:18px;height:18px;accent-color:var(--green)"/>
          Exibir como prato em destaque
        </label>
      </div>
      <div style="display:flex;gap:.75rem;margin-top:.5rem">
        <button type="button" class="btn ghost" onclick="closeCrudModal()">Cancelar</button>
        <button type="button" class="btn primary" id="dishSaveBtn">Salvar</button>
      </div>
    </form>`;

  document.getElementById('dishSaveBtn').onclick = () => {
    const name   = document.getElementById('df-name').value.trim();
    const restId = document.getElementById('df-rest').value;
    const price  = parseFloat(document.getElementById('df-price').value);
    if (!name || !restId || isNaN(price)) { showToast('Preencha os campos obrigatórios', 'err'); return; }
    const data = {
      name, restaurantId: restId, category: document.getElementById('df-cat').value,
      description: document.getElementById('df-desc').value.trim(),
      price, calories: parseInt(document.getElementById('df-cal').value) || 0,
      allergens: document.getElementById('df-aller').value.trim(),
      image:     document.getElementById('df-img').value.trim(),
      featured:  document.getElementById('df-featured').checked,
      restrictions: d?.restrictions || [],
    };
    if (d) Dishes.update(d.id, data);
    else   Dishes.create(data);
    closeCrudModal();
    showToast(d ? 'Prato atualizado!' : 'Prato cadastrado!');
    dishes();
  };

  openCrudModal();
}

function editDish(id)   { openDishForm(Dishes.byId(id)); }
function deleteDish(id) {
  const d = Dishes.byId(id);
  if (!confirm(`Excluir "${d?.name}"?`)) return;
  Dishes.remove(id);
  showToast('Prato excluído', 'err');
  dishes();
}

/* ── Usuários (visualização) ────────────────────────────────────── */
function users() {
  const list = (function(){ try{return JSON.parse(localStorage.getItem('sb_users'))||[];}catch{return []} })();
  document.getElementById('adminContent').innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:1rem;margin-bottom:1.5rem">
      <div>
        <div class="eyebrow">👤 Gestão</div>
        <h1 style="margin:0">Usuários</h1>
      </div>
    </div>
    <div class="table-container">
      <table>
        <thead><tr><th>Nome</th><th>Login</th><th>E-mail</th><th>Perfil</th><th>Ações</th></tr></thead>
        <tbody>
          ${list.map(u => `
            <tr>
              <td style="color:var(--text);font-weight:500">${esc(u.nome)}</td>
              <td class="muted">${esc(u.login)}</td>
              <td class="muted">${esc(u.email)}</td>
              <td>${u.admin
                ? '<span class="tag" style="color:#fcd34d;background:rgba(245,158,11,.1);border-color:rgba(245,158,11,.2)">⭐ Admin</span>'
                : '<span class="tag">👤 Usuário</span>'}</td>
              <td>
                <button class="btn ${u.admin?'danger':'ghost'}" onclick="toggleAdmin('${esc(u.id)}')"
                  style="padding:.35rem .7rem;font-size:.8rem">
                  ${u.admin ? 'Remover admin' : 'Tornar admin'}
                </button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

function toggleAdmin(uid) {
  const list = (function(){ try{return JSON.parse(localStorage.getItem('sb_users'))||[];}catch{return []} })();
  const idx  = list.findIndex(u => u.id === uid);
  if (idx < 0) return;
  list[idx].admin = !list[idx].admin;
  localStorage.setItem('sb_users', JSON.stringify(list));
  showToast(list[idx].admin ? 'Usuário promovido a admin' : 'Admin removido');
  users();
}

/* ── Modal helpers ───────────────────────────────────────────────── */
function openCrudModal()  { document.getElementById('crudModal').classList.add('open'); }
function closeCrudModal() { document.getElementById('crudModal').classList.remove('open'); }

function setupHamburger() {
  const btn   = document.getElementById('hamburger');
  const links = document.getElementById('navLinks');
  if (btn && links) btn.onclick = () => links.classList.toggle('open');
}
