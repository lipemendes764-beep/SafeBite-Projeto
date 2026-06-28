'use strict';
/* ── mapa.js: Mapa interativo de restaurantes com Leaflet ──────── */

let map;
let markers     = {};   // { restId: L.Marker }
let activeId    = null;
let queryText   = '';
const activeChips = new Set();

/* ── Inicialização ──────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  applyNavSession();
  setupHamburger();
  initMap();
  buildChips();
  render();

  document.getElementById('sidebarQ').addEventListener('input', e => {
    queryText = e.target.value.toLowerCase().trim();
    render();
  });
});

/* ── Inicializa o mapa Leaflet ──────────────────────────────────── */
function initMap() {
  // Centro do Brasil como ponto inicial
  map = L.map('map', {
    center: [-15.78, -47.93],
    zoom: 4,
    zoomControl: true,
    attributionControl: true,
  });

  // Tile layer — OpenStreetMap (sem API key)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map);

  // Legenda
  const legend = L.control({ position: 'bottomright' });
  legend.onAdd = () => {
    const div = L.DomUtil.create('div', 'map-legend');
    div.innerHTML = `
      <div class="map-legend-item">
        <span class="map-legend-dot" style="background:#10b981"></span> Aberto agora
      </div>
      <div class="map-legend-item">
        <span class="map-legend-dot" style="background:#57534e"></span> Fechado
      </div>`;
    return div;
  };
  legend.addTo(map);

  // Botão "minha localização"
  const locBtn = L.control({ position: 'topleft' });
  locBtn.onAdd = () => {
    const btn = L.DomUtil.create('button', '');
    btn.title = 'Ir para minha localização';
    btn.style.cssText = `
      background:#161c18; border:1px solid rgba(255,255,255,.12);
      color:#fff; border-radius:.6rem; padding:.5rem .8rem;
      font-size:.82rem; cursor:pointer; display:flex; align-items:center; gap:.4rem;
      box-shadow:0 2px 8px rgba(0,0,0,.4);
    `;
    btn.innerHTML = '📍 Minha localização';
    L.DomEvent.on(btn, 'click', goToMyLocation);
    return btn;
  };
  locBtn.addTo(map);
}

/* ── Cria o ícone customizado ───────────────────────────────────── */
function createIcon(open) {
  return L.divIcon({
    className: '',
    html: `<div class="custom-marker${open ? '' : ' closed'}">
             <span class="custom-marker-inner">🍽</span>
           </div>`,
    iconSize:   [36, 36],
    iconAnchor: [18, 36],
    popupAnchor:[0, -38],
  });
}

/* ── Renderiza lista + marcadores ───────────────────────────────── */
function render() {
  const all      = Restaurants.all();
  const filtered = filter(all);

  renderSidebarList(filtered);
  renderMarkers(filtered, all);
  updateCount(filtered.length, all.length);

  // Ajusta o viewport do mapa para os resultados filtrados
  if (filtered.length) {
    const valid = filtered.filter(r => r.lat && r.lng);
    if (valid.length === 1) {
      map.setView([valid[0].lat, valid[0].lng], 14, { animate: true });
    } else if (valid.length > 1) {
      const bounds = L.latLngBounds(valid.map(r => [r.lat, r.lng]));
      map.fitBounds(bounds.pad(0.25), { animate: true, maxZoom: 13 });
    }
  }
}

function filter(all) {
  return all.filter(r => {
    const matchText = !queryText ||
      normalize(r.name).includes(normalize(queryText)) ||
      normalize(r.city || '').includes(normalize(queryText)) ||
      normalize(r.cuisine || '').includes(normalize(queryText));

    const matchChips = activeChips.size === 0 ||
      [...activeChips].every(id => (r.restrictions || []).includes(id));

    return matchText && matchChips;
  });
}

/* ── Chips de restrição ─────────────────────────────────────────── */
function buildChips() {
  const container = document.getElementById('mapaChips');
  RESTRICTIONS_MAP.slice(0, 8).forEach(([id, label, icon]) => {
    const btn = document.createElement('button');
    btn.className   = 'mapa-chip';
    btn.type        = 'button';
    btn.textContent = icon + ' ' + label;
    btn.addEventListener('click', () => {
      if (activeChips.has(id)) { activeChips.delete(id); btn.classList.remove('active'); }
      else                     { activeChips.add(id);    btn.classList.add('active');    }
      render();
    });
    container.appendChild(btn);
  });
}

/* ── Contador ───────────────────────────────────────────────────── */
function updateCount(shown, total) {
  document.getElementById('mapaCount').innerHTML =
    `Exibindo <strong>${shown}</strong> de ${total} restaurante${total !== 1 ? 's' : ''}`;
}

/* ── Lista lateral ──────────────────────────────────────────────── */
function renderSidebarList(list) {
  const el = document.getElementById('mapaList');

  if (!list.length) {
    el.innerHTML = `<div class="mapa-empty">
      🔍 Nenhum restaurante encontrado.<br>
      <span style="font-size:.78rem;color:var(--text-faint)">Tente outros filtros.</span>
    </div>`;
    return;
  }

  el.innerHTML = list.map(r => {
    const thumb = r.image
      ? `<img class="mapa-rest-thumb" src="${esc(r.image)}" alt="${esc(r.name)}" loading="lazy" />`
      : `<div class="mapa-rest-thumb">🍽</div>`;
    return `
      <div class="mapa-rest-item${activeId === r.id ? ' active' : ''}"
           role="listitem" data-id="${esc(r.id)}" tabindex="0"
           aria-label="${esc(r.name)}">
        ${thumb}
        <div class="mapa-rest-body">
          <p class="mapa-rest-name">${esc(r.name)}</p>
          <p class="mapa-rest-cuisine">${esc(r.cuisine || '')} ·
            <span style="color:${r.open ? 'var(--green-light)' : 'var(--text-faint)'}">
              ${r.open ? '● Aberto' : '● Fechado'}
            </span>
          </p>
          ${r.address ? `<p class="mapa-rest-addr">📍 ${esc(r.address)}</p>` : ''}
          <div class="mapa-rest-meta">
            <span class="mapa-rest-rating">★ ${r.rating || '—'}</span>
            <span>${esc(r.deliveryTime || '')}</span>
            <span>${esc(r.priceRange || '')}</span>
          </div>
        </div>
      </div>`;
  }).join('');

  // click em item → foca marcador
  el.querySelectorAll('.mapa-rest-item').forEach(item => {
    const handler = () => focusRestaurant(item.dataset.id);
    item.addEventListener('click',  handler);
    item.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') handler(); });
  });
}

/* ── Marcadores do mapa ─────────────────────────────────────────── */
function renderMarkers(filtered, all) {
  // Remove marcadores antigos não filtrados
  Object.keys(markers).forEach(id => {
    if (!filtered.find(r => r.id === id)) {
      map.removeLayer(markers[id]);
      delete markers[id];
    }
  });

  // Adiciona/atualiza marcadores
  filtered.forEach(r => {
    if (!r.lat || !r.lng) return;

    if (!markers[r.id]) {
      const marker = L.marker([r.lat, r.lng], { icon: createIcon(r.open) });
      marker.addTo(map);
      marker.bindPopup(buildPopup(r), {
        maxWidth: 260,
        minWidth: 240,
        closeButton: true,
      });
      marker.on('click', () => {
        setActive(r.id);
        scrollSidebarTo(r.id);
      });
      markers[r.id] = marker;
    }
  });
}

/* ── Foca um restaurante (sidebar + mapa) ───────────────────────── */
function focusRestaurant(id) {
  const r = Restaurants.byId(id);
  if (!r) return;
  setActive(id);

  if (r.lat && r.lng) {
    map.flyTo([r.lat, r.lng], 15, { animate: true, duration: 0.8 });
    setTimeout(() => {
      if (markers[id]) markers[id].openPopup();
    }, 900);
  }
}

function setActive(id) {
  activeId = id;
  // atualiza sidebar sem re-renderizar tudo
  document.querySelectorAll('.mapa-rest-item').forEach(el => {
    el.classList.toggle('active', el.dataset.id === id);
  });
}

function scrollSidebarTo(id) {
  const item = document.querySelector(`.mapa-rest-item[data-id="${id}"]`);
  if (item) item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ── Popup HTML ─────────────────────────────────────────────────── */
function buildPopup(r) {
  const img = r.image
    ? `<img class="map-popup-img" src="${esc(r.image)}" alt="${esc(r.name)}" />`
    : `<div class="map-popup-img-placeholder">🍽</div>`;

  const tags = (r.restrictions || []).slice(0, 3)
    .map(x => `<span class="map-popup-tag">${esc(restrictionLabel(x))}</span>`)
    .join('');

  return `
    <div class="map-popup">
      ${img}
      <div class="map-popup-body">
        <p class="map-popup-name">${esc(r.name)}</p>
        <p class="map-popup-cuisine">${esc(r.cuisine || '')}</p>
        ${r.address ? `<p class="map-popup-addr">📍 ${esc(r.address)}</p>` : ''}
        <div class="map-popup-meta">
          <span class="map-popup-rating">★ ${r.rating || '—'}</span>
          <span>${esc(r.deliveryTime || '')}</span>
          <span>${esc(r.priceRange || '')}</span>
        </div>
        <span class="map-popup-status ${r.open ? 'map-popup-open' : 'map-popup-closed'}">
          ${r.open ? '● Aberto agora' : '● Fechado'}
        </span>
        ${tags ? `<div class="map-popup-tags">${tags}</div>` : ''}
        <a class="map-popup-btn" href="restaurante.html?id=${esc(r.id)}">
          Ver cardápio →
        </a>
      </div>
    </div>`;
}

/* ── Geolocalização ─────────────────────────────────────────────── */
function goToMyLocation() {
  if (!navigator.geolocation) {
    showToast('Geolocalização não suportada neste navegador.', 'err');
    return;
  }
  showToast('📍 Buscando sua localização…');
  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude: lat, longitude: lng } = pos.coords;
      map.flyTo([lat, lng], 14, { animate: true, duration: 1 });

      // Marca a posição do usuário
      const userIcon = L.divIcon({
        className: '',
        html: `<div style="
          width:16px;height:16px;border-radius:50%;
          background:#3b82f6;border:3px solid #fff;
          box-shadow:0 0 0 4px rgba(59,130,246,.3);
        "></div>`,
        iconSize: [16, 16], iconAnchor: [8, 8],
      });

      // Remove marcador anterior se existir
      if (window._userMarker) map.removeLayer(window._userMarker);
      window._userMarker = L.marker([lat, lng], { icon: userIcon })
        .bindPopup('<div style="color:#161c18;font-size:.85rem;padding:.25rem">📍 Você está aqui</div>')
        .addTo(map)
        .openPopup();

      showToast('📍 Localização encontrada!');
    },
    err => {
      const msgs = {
        1: 'Permissão negada para acessar a localização.',
        2: 'Localização indisponível.',
        3: 'Tempo esgotado ao buscar localização.',
      };
      showToast(msgs[err.code] || 'Erro ao obter localização.', 'err');
    },
    { timeout: 10000, enableHighAccuracy: true }
  );
}

/* ── Hamburger ──────────────────────────────────────────────────── */
function setupHamburger() {
  const btn   = document.getElementById('hamburger');
  const links = document.getElementById('navLinks');
  if (btn && links) btn.onclick = () => links.classList.toggle('open');
}
