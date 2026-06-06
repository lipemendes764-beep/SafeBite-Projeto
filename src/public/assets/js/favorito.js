const NAV_ITEMS = ['Início','Restaurantes','Cadastro','Alimentos','Clientes','Pratos','Vendas','Favoritos','Perfil'];

const SECTIONS = {
  foods: { storageKey: 'favs_foods', tag: 'Receita' },
  restaurants: { storageKey: 'favs_restaurants', tag: 'Restaurante' },
};

const state = { foods: [], restaurants: [] };

function renderNav() {
  document.getElementById('nav').innerHTML = NAV_ITEMS.map(n =>
    `<button class="${n==='Favoritos'?'active':''}">${n}</button>`
  ).join('');
}

function load() {
  for (const key of Object.keys(SECTIONS)) {
    try {
      const raw = localStorage.getItem(SECTIONS[key].storageKey);
      state[key] = raw ? JSON.parse(raw) : [];
    } catch { state[key] = []; }
  }
}

function save(key) {
  localStorage.setItem(SECTIONS[key].storageKey, JSON.stringify(state[key]));
}

function renderSection(key) {
  const items = state[key];
  document.getElementById(`count-${key}`).textContent = items.length;

  const empty = document.getElementById(`empty-${key}`);
  const grid = document.getElementById(`grid-${key}`);

  if (items.length === 0) {
    empty.classList.remove('hidden');
    grid.innerHTML = '';
    return;
  }
  empty.classList.add('hidden');

  grid.innerHTML = items.map(item => `
    <div class="card">
      <div class="card-top">
        <span class="card-tag">${item.tag}</span>
        <button class="card-remove" data-remove="${key}:${item.id}" aria-label="Remover">
          <i class="icon-heart-off"></i>
        </button>
      </div>
      <p class="card-name">${escapeHtml(item.name)}</p>
    </div>
  `).join('');

  grid.querySelectorAll('[data-remove]').forEach(btn => {
    btn.onclick = () => {
      const [sec, id] = btn.dataset.remove.split(':');
      state[sec] = state[sec].filter(i => i.id !== id);
      save(sec); renderSection(sec);
    };
  });
}

function addItem(key) {
  const input = document.getElementById(`input-${key}`);
  const name = input.value.trim();
  if (!name || name.length > 40) return;
  state[key].push({
    id: Date.now().toString(),
    name,
    tag: SECTIONS[key].tag,
  });
  save(key);
  input.value = '';
  renderSection(key);
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}

document.querySelectorAll('[data-add]').forEach(btn => {
  btn.onclick = () => addItem(btn.dataset.add);
});
Object.keys(SECTIONS).forEach(key => {
  document.getElementById(`input-${key}`).addEventListener('keydown', e => {
    if (e.key === 'Enter') addItem(key);
  });
});

renderNav();
load();
Object.keys(SECTIONS).forEach(renderSection);