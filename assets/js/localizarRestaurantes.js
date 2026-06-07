/* ─────────────────────────────────────────────
   SafeBite — Localizar Restaurantes
   ───────────────────────────────────────────── */

const RKEY    = "safebite_restaurants";
const FAVKEY  = "safebite_fav_restaurants";
const HISTKEY = "safebite_search_history";
const PROFKEY = "safebite_user_profile";

/* ── Restrições suportadas ── */
const RESTRICTIONS = [
    ["vegano",            "Vegano"],
    ["vegetariano",       "Vegetariano"],
    ["sem-gluten",        "Sem glúten"],
    ["sem-lactose",       "Sem lactose"],
    ["sem-amendoim",      "Sem amendoim"],
    ["sem-frutos-do-mar", "Sem frutos do mar"],
    ["sem-ovo",           "Sem ovo"],
    ["sem-soja",          "Sem soja"],
    ["kosher",            "Kosher"],
    ["halal",             "Halal"],
    ["organico",          "Orgânico"],
    ["diabetico",         "Diabético"]
];

/* ── Dados seed (usados se localStorage estiver vazio) ── */
const SEED_R = [
    {
        id: "rt1",
        name: "Verde Vivo",
        cuisine: "Vegano contemporâneo",
        city: "São Paulo",
        state: "SP",
        neighborhood: "Pinheiros",
        cep: "05422-000",
        address: "Rua dos Pinheiros, 520 – Pinheiros, São Paulo/SP",
        phone: "(11) 3456-7890",
        hours: "Seg–Sex 11h–22h | Sáb–Dom 10h–23h",
        restrictions: ["vegano", "vegetariano", "sem-gluten", "sem-lactose", "organico"],
        allergenInfo: "Alto controle de alergênicos. Sem glúten ou laticínios na cozinha.",
        rating: 4.7,
        ratingCount: 218,
        safebite: true,
        distance: null,
        menu: [
            { name: "Lasanha de Berinjela",   price: 42.90, tags: ["vegano","sem-gluten"] },
            { name: "Salada do Verde",         price: 32.00, tags: ["vegano","organico"] },
            { name: "Bowl de Quinoa",          price: 38.50, tags: ["vegano","sem-lactose"] }
        ],
        comments: [
            { author: "Ana P.",  text: "Melhor lasanha vegana que já comi. Ambiente acolhedor!" },
            { author: "Carlos M.", text: "Perfeito para celíacos. Nunca tive reação." }
        ]
    },
    {
        id: "rt2",
        name: "Trigo Livre",
        cuisine: "Italiana sem glúten",
        city: "Rio de Janeiro",
        state: "RJ",
        neighborhood: "Ipanema",
        cep: "22420-020",
        address: "Av. Vieira Souto, 110 – Ipanema, Rio de Janeiro/RJ",
        phone: "(21) 2345-6789",
        hours: "Ter–Dom 12h–23h",
        restrictions: ["sem-gluten", "vegetariano"],
        allergenInfo: "Cozinha 100% livre de glúten. Contém laticínios.",
        rating: 4.5,
        ratingCount: 134,
        safebite: true,
        distance: null,
        menu: [
            { name: "Pizza Margherita SG",    price: 58.00, tags: ["sem-gluten","vegetariano"] },
            { name: "Risoto de Cogumelos",     price: 52.00, tags: ["sem-gluten"] },
            { name: "Tiramisu SG",             price: 24.00, tags: ["sem-gluten"] }
        ],
        comments: [
            { author: "Juliana R.", text: "A massa sem glúten é incrível, não parece!" },
            { author: "Marcos F.",  text: "Atendimento excelente e muita atenção a alergias." }
        ]
    },
    {
        id: "rt3",
        name: "Sabor Kosher",
        cuisine: "Mediterrânea kosher",
        city: "Curitiba",
        state: "PR",
        neighborhood: "Batel",
        cep: "80420-090",
        address: "Rua Bispo Dom José, 876 – Batel, Curitiba/PR",
        phone: "(41) 3234-5678",
        hours: "Dom–Sex 12h–21h | Sáb fechado",
        restrictions: ["kosher", "vegetariano", "sem-lactose"],
        allergenInfo: "Certificação kosher ativa. Contém gergelim.",
        rating: 4.3,
        ratingCount: 87,
        safebite: true,
        distance: null,
        menu: [
            { name: "Bowl Mediterrâneo",  price: 46.50, tags: ["kosher","vegetariano","sem-lactose"] },
            { name: "Falafel Artesanal",  price: 28.00, tags: ["kosher","vegano"] },
            { name: "Hummus Especial",    price: 19.90, tags: ["kosher","vegano"] }
        ],
        comments: [
            { author: "David L.", text: "Autêntico e delicioso. Ótima opção kosher em Curitiba." }
        ]
    },
    {
        id: "rt4",
        name: "Raízes Brasileiras",
        cuisine: "Brasileira",
        city: "Belo Horizonte",
        state: "MG",
        neighborhood: "Savassi",
        cep: "30112-020",
        address: "Rua Pernambuco, 640 – Savassi, Belo Horizonte/MG",
        phone: "(31) 3344-5566",
        hours: "Seg–Sáb 11h30–15h | 18h–22h",
        restrictions: ["sem-lactose", "sem-gluten"],
        allergenInfo: "⚠ Informações incompletas sobre alergênicos. Consulte o atendimento.",
        rating: 3.9,
        ratingCount: 52,
        safebite: false,
        distance: null,
        menu: [
            { name: "Feijão Tropeiro",    price: 34.00, tags: ["sem-lactose"] },
            { name: "Frango Caipira",     price: 48.00, tags: [] },
            { name: "Arroz com Pequi",    price: 38.00, tags: ["sem-gluten","sem-lactose"] }
        ],
        comments: [
            { author: "Fernanda T.", text: "Comida gostosa mas não souberam dizer sobre glúten nos molhos." }
        ]
    },
    {
        id: "rt5",
        name: "Umami",
        cuisine: "Japonesa",
        city: "São Paulo",
        state: "SP",
        neighborhood: "Liberdade",
        cep: "01513-010",
        address: "Rua Galvão Bueno, 96 – Liberdade, São Paulo/SP",
        phone: "(11) 3277-4455",
        hours: "Ter–Dom 12h–23h",
        restrictions: ["sem-amendoim", "sem-lactose"],
        allergenInfo: "Contém peixe, frutos do mar e soja. Sem amendoim.",
        rating: 4.6,
        ratingCount: 310,
        safebite: true,
        distance: null,
        menu: [
            { name: "Sashimi Premium",   price: 68.00, tags: ["sem-lactose","sem-amendoim"] },
            { name: "Temaki de Salmão",  price: 29.00, tags: ["sem-lactose"] },
            { name: "Gyoza Vegetal",     price: 24.00, tags: ["vegano"] }
        ],
        comments: [
            { author: "Kenji A.",   text: "Melhor japonês de SP! Atenção total com alergias." },
            { author: "Patrícia V.", text: "Sempre informam claramente os ingredientes." }
        ]
    },
    {
        id: "rt6",
        name: "Al Farouk",
        cuisine: "Árabe",
        city: "São Paulo",
        state: "SP",
        neighborhood: "Brás",
        cep: "03027-000",
        address: "Rua do Oriente, 342 – Brás, São Paulo/SP",
        phone: "(11) 3101-2233",
        hours: "Seg–Dom 11h–22h",
        restrictions: ["halal", "sem-lactose"],
        allergenInfo: "Certificação halal. Contém gergelim e nozes.",
        rating: 4.4,
        ratingCount: 175,
        safebite: true,
        distance: null,
        menu: [
            { name: "Kafta Grelhada",  price: 39.00, tags: ["halal","sem-lactose"] },
            { name: "Esfiha Aberta",   price: 12.00, tags: ["halal"] },
            { name: "Coalhada Seca",   price: 18.00, tags: ["halal","vegetariano"] }
        ],
        comments: [
            { author: "Ibrahim N.", text: "Autêntico e saboroso. Certificação halal confiável." }
        ]
    }
];

/* ── Helpers ── */
function esc(str) {
    return String(str || "").replace(/[&<>"']/g, c => ({
        "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    }[c]));
}

function labelOf(id) {
    const found = RESTRICTIONS.find(([key]) => key === id);
    return found ? found[1] : id;
}

function starsHTML(rating) {
    const full  = Math.round(rating);
    const empty = 5 - full;
    return "★".repeat(full).split("").map(s => `<span class="star-filled">${s}</span>`).join("") +
           "★".repeat(empty).split("").map(s => `<span class="star-empty">${s}</span>`).join("");
}

/* ── Estado ── */
let query    = "";
let location = "";
let cuisine  = "";
let sortMode = "relevance";
const selected = new Set(); // filtros ativos por restrição

/* ── Dados ── */
function loadJSON(key, seed) {
    const raw = localStorage.getItem(key);
    if (!raw) { localStorage.setItem(key, JSON.stringify(seed)); return seed.slice(); }
    try { return JSON.parse(raw); } catch { return seed.slice(); }
}
function saveJSON(key, data) { localStorage.setItem(key, JSON.stringify(data)); }

const restaurants = loadJSON(RKEY, SEED_R);
let   favs        = loadJSON(FAVKEY, []);
let   history     = loadJSON(HISTKEY, []);
let   userProfile = loadJSON(PROFKEY, []);  // array de restriction ids

/* ── Geolocalização simulada ── */
let userLocation = null; // { lat, lng, label }

function haversine(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 +
              Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
              Math.sin(dLng/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// Coordenadas aproximadas por cidade (seed)
const CITY_COORDS = {
    "São Paulo":         { lat: -23.5505, lng: -46.6333 },
    "Rio de Janeiro":    { lat: -22.9068, lng: -43.1729 },
    "Curitiba":          { lat: -25.4284, lng: -49.2733 },
    "Belo Horizonte":    { lat: -19.9167, lng: -43.9345 },
};

function calcDistances() {
    if (!userLocation) { restaurants.forEach(r => r.distance = null); return; }
    restaurants.forEach(r => {
        const coords = CITY_COORDS[r.city];
        if (coords) {
            r.distance = haversine(userLocation.lat, userLocation.lng, coords.lat, coords.lng);
        } else {
            r.distance = null;
        }
    });
}

function requestGeo() {
    if (!navigator.geolocation) {
        alert("Geolocalização não suportada pelo seu navegador.");
        return;
    }
    navigator.geolocation.getCurrentPosition(pos => {
        userLocation = {
            lat:   pos.coords.latitude,
            lng:   pos.coords.longitude,
            label: "Localização atual"
        };
        calcDistances();
        showGeoInfo();
        render();
    }, () => {
        alert("Não foi possível obter a localização. Verifique as permissões do navegador.");
    });
}

function showGeoInfo() {
    let el = document.getElementById("geoInfo");
    if (!el) {
        el = document.createElement("div");
        el.id = "geoInfo";
        el.className = "geo-info";
        document.querySelector(".wrap").insertBefore(
            el,
            document.querySelector(".filters")
        );
    }
    el.innerHTML = `📍 Usando sua localização atual — distâncias calculadas`;
}

/* ── Histórico de buscas ── */
function addHistory(term) {
    if (!term || term.length < 2) return;
    history = [term, ...history.filter(h => h !== term)].slice(0, 10);
    saveJSON(HISTKEY, history);
}

/* ── Perfil de restrições ── */
function applyProfile() {
    userProfile.forEach(id => selected.add(id));
    syncChips();
    updateProfileBanner();
}

function updateProfileBanner() {
    const sub = document.getElementById("profileSub");
    if (userProfile.length === 0) {
        sub.textContent = "Nenhuma restrição configurada";
    } else {
        sub.textContent = userProfile.map(labelOf).join(" · ");
    }
}

/* ── Chips de filtro (barra) ── */
const chipsEl = document.getElementById("chips");
const chipBtns = {};

RESTRICTIONS.forEach(([id, label]) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip";
    btn.textContent = label;
    btn.onclick = () => {
        selected.has(id) ? selected.delete(id) : selected.add(id);
        syncChips();
        render();
    };
    chipsEl.appendChild(btn);
    chipBtns[id] = btn;
});

function syncChips() {
    RESTRICTIONS.forEach(([id]) => {
        chipBtns[id]?.classList.toggle("active", selected.has(id));
    });
}

/* ── Chips do modal de perfil ── */
const profileChipsEl = document.getElementById("profileChips");
const profileChipBtns = {};

RESTRICTIONS.forEach(([id, label]) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip";
    btn.textContent = label;
    btn.onclick = () => {
        if (userProfile.includes(id)) {
            userProfile = userProfile.filter(x => x !== id);
        } else {
            userProfile.push(id);
        }
        syncProfileChips();
    };
    profileChipsEl.appendChild(btn);
    profileChipBtns[id] = btn;
});

function syncProfileChips() {
    RESTRICTIONS.forEach(([id]) => {
        profileChipBtns[id]?.classList.toggle("active", userProfile.includes(id));
    });
}

/* ── Modal perfil ── */
document.getElementById("btnProfile").onclick = () => {
    syncProfileChips();
    document.getElementById("modalOverlay").classList.add("open");
};
document.getElementById("modalClose").onclick = () => {
    document.getElementById("modalOverlay").classList.remove("open");
};
document.getElementById("modalOverlay").onclick = e => {
    if (e.target === document.getElementById("modalOverlay"))
        document.getElementById("modalOverlay").classList.remove("open");
};
document.getElementById("saveProfile").onclick = () => {
    saveJSON(PROFKEY, userProfile);
    selected.clear();
    applyProfile();
    render();
    document.getElementById("modalOverlay").classList.remove("open");
};

/* ── Geolocalização botão ── */
document.getElementById("btnGeo").onclick = requestGeo;

/* ── Inputs ── */
document.getElementById("q").addEventListener("input", e => {
    query = e.target.value.toLowerCase().trim();
    addHistory(query);
    render();
});

document.getElementById("location").addEventListener("input", e => {
    location = e.target.value.toLowerCase().trim();
    render();
});

document.getElementById("cuisineFilter").addEventListener("change", e => {
    cuisine = e.target.value;
    render();
});

document.querySelectorAll(".sort button").forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll(".sort button").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        sortMode = btn.dataset.sort;
        render();
    };
});

document.getElementById("clear").onclick = () => {
    query = ""; location = ""; cuisine = "";
    selected.clear();
    document.getElementById("q").value = "";
    document.getElementById("location").value = "";
    document.getElementById("cuisineFilter").value = "";
    syncChips();
    render();
};

/* ── Favoritos ── */
function isFav(id) { return favs.includes(id); }
function toggleFav(id) {
    favs = isFav(id) ? favs.filter(f => f !== id) : [...favs, id];
    saveJSON(FAVKEY, favs);
    render();
}

/* ── Abrir no mapa (Google Maps) ── */
function openRoute(address) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
    window.open(url, "_blank");
}

/* ── Modal detalhes ── */
function openDetail(id) {
    const r = restaurants.find(x => x.id === id);
    if (!r) return;
    document.getElementById("detailName").textContent = r.name;

    const safeIcon  = r.safebite ? `<span class="safebite-seal">✔ Selo SafeBite</span>` : "";
    const alertIcon = !r.safebite
        ? `<div class="alert-risk">⚠ ${esc(r.allergenInfo)}</div>` : "";

    const menuHTML = r.menu.map(item => `
        <div class="detail-menu-item">
            <span>${esc(item.name)}
                ${item.tags.map(t => `<span class="tag" style="margin-left:.3rem">${esc(labelOf(t))}</span>`).join("")}
            </span>
            <span class="detail-menu-price">R$ ${item.price.toFixed(2).replace(".",",")}</span>
        </div>
    `).join("");

    const commentsHTML = r.comments.length
        ? r.comments.map(c => `
            <div class="comment-item">
                <div class="comment-author">${esc(c.author)}</div>
                <div class="comment-text">${esc(c.text)}</div>
            </div>
        `).join("")
        : `<p style="color:#78716c;font-size:.88rem">Nenhum comentário ainda.</p>`;

    document.getElementById("detailBody").innerHTML = `
        ${safeIcon}
        ${alertIcon}

        <div class="detail-section">
            <div class="detail-section-title">Informações</div>
            <div class="detail-row"><span class="detail-label">Culinária</span><span>${esc(r.cuisine)}</span></div>
            <div class="detail-row"><span class="detail-label">Endereço</span><span>${esc(r.address)}</span></div>
            <div class="detail-row"><span class="detail-label">Telefone</span><span>${esc(r.phone)}</span></div>
            <div class="detail-row"><span class="detail-label">Horários</span><span>${esc(r.hours)}</span></div>
            <div class="detail-row"><span class="detail-label">Alergênicos</span><span>${esc(r.allergenInfo)}</span></div>
        </div>

        <div class="detail-section">
            <div class="detail-section-title">Restrições atendidas</div>
            <div class="tags">${r.restrictions.map(x => `<span class="tag">${esc(labelOf(x))}</span>`).join("")}</div>
        </div>

        <div class="detail-section">
            <div class="detail-section-title">Cardápio (destaques)</div>
            ${menuHTML}
        </div>

        <div class="detail-section">
            <div class="detail-section-title">Avaliações (${r.ratingCount})</div>
            <div class="stars" style="margin-bottom:.75rem">
                ${starsHTML(r.rating)}
                <span class="rating-val">${r.rating.toFixed(1)}</span>
            </div>
            ${commentsHTML}
        </div>

        <button class="btn-detail" style="width:100%;margin-top:.5rem" onclick="openRoute('${esc(r.address)}')">
            🗺 Traçar rota no Google Maps
        </button>
    `;

    document.getElementById("detailOverlay").classList.add("open");
}

document.getElementById("detailClose").onclick = () => {
    document.getElementById("detailOverlay").classList.remove("open");
};
document.getElementById("detailOverlay").onclick = e => {
    if (e.target === document.getElementById("detailOverlay"))
        document.getElementById("detailOverlay").classList.remove("open");
};

/* ── Render ── */
function render() {
    let filtered = restaurants.filter(r => {

        // Busca por nome
        const qMatch = !query ||
            r.name.toLowerCase().includes(query) ||
            r.cuisine.toLowerCase().includes(query);

        // Localização (cidade, bairro ou CEP)
        const locMatch = !location ||
            r.city.toLowerCase().includes(location) ||
            (r.neighborhood || "").toLowerCase().includes(location) ||
            (r.cep || "").replace(/\D/g,"").includes(location.replace(/\D/g,"")) ||
            (r.state || "").toLowerCase().includes(location);

        // Culinária
        const cuisMatch = !cuisine || r.cuisine === cuisine;

        // Restrições (todas devem estar presentes)
        const restMatch = selected.size === 0 ||
            Array.from(selected).every(id => r.restrictions.includes(id));

        return qMatch && locMatch && cuisMatch && restMatch;
    });

    // Ordenação
    if (sortMode === "name") {
        filtered.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    } else if (sortMode === "rating") {
        filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortMode === "distance") {
        filtered.sort((a, b) => {
            if (a.distance === null && b.distance === null) return 0;
            if (a.distance === null) return 1;
            if (b.distance === null) return -1;
            return a.distance - b.distance;
        });
    } else {
        // Relevância: SafeBite primeiro, depois nota
        filtered.sort((a, b) => {
            if (b.safebite !== a.safebite) return b.safebite ? 1 : -1;
            return b.rating - a.rating;
        });
    }

    // KPIs
    document.getElementById("kpi-total").textContent   = restaurants.length;
    document.getElementById("kpi-results").textContent = filtered.length;
    document.getElementById("kpi-safe").textContent    = filtered.filter(r => r.safebite).length;

    const cities = [...new Set(filtered.map(r => r.city))];
    document.getElementById("kpi-city").textContent =
        cities.length === 1 ? cities[0] :
        cities.length  > 1 ? `${cities.length} cidades` : "—";

    const list = document.getElementById("list");

    if (!filtered.length) {
        list.innerHTML = `
            <div class="empty" style="grid-column:1/-1">
                <div class="empty-icon">🍽</div>
                Nenhum restaurante encontrado com esses filtros.
            </div>`;
        return;
    }

    list.innerHTML = filtered.map(r => {
        const distBadge = r.distance !== null
            ? `<span class="distance-badge">📍 ${r.distance < 1
                ? (r.distance * 1000).toFixed(0) + " m"
                : r.distance.toFixed(1) + " km"} de distância</span>`
            : "";

        const sealBadge = r.safebite
            ? `<div class="safebite-seal">✔ Selo SafeBite</div>` : "";

        const alertBadge = !r.safebite
            ? `<div class="alert-risk">⚠ Informações de alergênicos incompletas</div>` : "";

        const tagList = r.restrictions.slice(0, 4)
            .map(x => `<span class="tag">${esc(labelOf(x))}</span>`).join("");

        const favActive = isFav(r.id) ? "fav-active" : "";

        return `
        <article class="rest-card">
            ${sealBadge}

            <div class="card-head">
                <h3 class="card-name">${esc(r.name)}</h3>
                <div class="card-cuisine">${esc(r.cuisine)}</div>
            </div>

            <div class="card-address">
                <span class="card-address-icon">📌</span>
                <span>${esc(r.city)} / ${esc(r.state)} · ${esc(r.neighborhood || "")}</span>
            </div>

            ${distBadge}

            <div class="stars">
                ${starsHTML(r.rating)}
                <span class="rating-val">${r.rating.toFixed(1)}</span>
                <span class="rating-count">(${r.ratingCount})</span>
            </div>

            <div class="tags">${tagList}</div>

            ${alertBadge}

            <div class="card-footer">
                <button class="btn-detail" onclick="openDetail('${r.id}')">Ver detalhes</button>
                <button class="btn-fav ${favActive}" onclick="toggleFav('${r.id}')" title="Favoritar">
                    ${isFav(r.id) ? "★" : "☆"}
                </button>
                <button class="btn-route" onclick="openRoute('${esc(r.address)}')" title="Traçar rota">
                    🗺
                </button>
            </div>
        </article>`;
    }).join("");
}

/* ── Init ── */
updateProfileBanner();
applyProfile();
render();