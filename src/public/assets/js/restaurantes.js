const STORAGE_KEY = "safebite_restaurants";

const RESTRICTIONS = [
  ["vegano", "Vegano"],
  ["vegetariano", "Vegetariano"],
  ["sem-gluten", "Sem glúten"],
  ["sem-lactose", "Sem lactose"],
  ["sem-amendoim", "Sem amendoim"],
  ["sem-frutos-do-mar", "Sem frutos do mar"],
  ["sem-ovo", "Sem ovo"],
  ["sem-soja", "Sem soja"],
  ["kosher", "Kosher"],
  ["halal", "Halal"],
  ["organico", "Orgânico"],
  ["diabetico", "Diabético"]
];

// ============================================================
// DADOS INICIAIS
// ============================================================

const SEED = [
  {
    id: "rt1",
    name: "Verde Vivo",
    cnpj: "12.345.678/0001-90",
    cuisine: "Vegano contemporâneo",
    city: "São Paulo",
    state: "SP",
    phone: "(11) 99999-1234",
    restrictions: ["vegano", "sem-lactose", "sem-gluten"]
  },
  {
    id: "rt2",
    name: "Trigo Livre",
    cnpj: "98.765.432/0001-10",
    cuisine: "Italiana sem glúten",
    city: "Rio de Janeiro",
    state: "RJ",
    phone: "(21) 98888-5678",
    restrictions: ["sem-gluten", "vegetariano"]
  },
  {
    id: "rt3",
    name: "Sabor Kosher",
    cnpj: "55.111.222/0001-33",
    cuisine: "Mediterrânea kosher",
    city: "Curitiba",
    state: "PR",
    phone: "(41) 97777-9090",
    restrictions: ["kosher", "sem-lactose"]
  }
];

// ============================================================
// FUNÇÕES DE LOCALSTORAGE
// ============================================================

function loadRestaurants() {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED));
    return [...SEED];
  }

  try {
    return JSON.parse(raw);
  } catch {
    return [...SEED];
  }
}

// ============================================================
// ESTADO
// ============================================================

let records = loadRestaurants();
let query = "";
let activeFilters = new Set();

// ============================================================
// ELEMENTOS
// ============================================================

const chipsEl = document.getElementById("chips");
const searchInput = document.getElementById("q");
const countEl = document.getElementById("count");
const listEl = document.getElementById("list");

// ============================================================
// HELPERS
// ============================================================

function labelOf(id) {
  const item = RESTRICTIONS.find(([key]) => key === id);
  return item ? item[1] : id;
}

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    return map[char];
  });
}

// ============================================================
// CRIAÇÃO DOS CHIPS DE FILTRO
// ============================================================

function createFilterChips() {
  RESTRICTIONS.forEach(([id, label]) => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "chip";
    button.textContent = label;

    button.addEventListener("click", () => {
      if (activeFilters.has(id)) {
        activeFilters.delete(id);
        button.classList.remove("active");
      } else {
        activeFilters.add(id);
        button.classList.add("active");
      }

      render();
    });

    chipsEl.appendChild(button);
  });
}

// ============================================================
// FILTRO DE RESTAURANTES
// ============================================================

function getFilteredRestaurants() {
  return records.filter((restaurant) => {
    const matchesQuery =
      !query ||
      restaurant.name.toLowerCase().includes(query) ||
      (restaurant.cuisine || "").toLowerCase().includes(query) ||
      (restaurant.city || "").toLowerCase().includes(query);

    const matchesRestrictions =
      activeFilters.size === 0 ||
      [...activeFilters].every((filter) =>
        restaurant.restrictions.includes(filter)
      );

    return matchesQuery && matchesRestrictions;
  });
}

// ============================================================
// RENDERIZAÇÃO
// ============================================================

function render() {
  const filtered = getFilteredRestaurants();

  countEl.textContent = `${filtered.length} ${
    filtered.length === 1 ? "restaurante" : "restaurantes"
  }`;

  if (filtered.length === 0) {
    listEl.innerHTML =
      '<div class="empty">Nenhum restaurante encontrado.</div>';
    return;
  }

  listEl.innerHTML = filtered
    .map(
      (restaurant) => `
      <article class="card">
        <h3>${esc(restaurant.name)}</h3>

        <p class="card-sub">
          ${esc(restaurant.cuisine || "—")}
        </p>

        <p class="card-meta">
          📍 ${esc(
            restaurant.city
              ? `${restaurant.city}/${restaurant.state}`
              : "—"
          )}
        </p>

        ${
          restaurant.restrictions?.length
            ? `
            <div class="tags">
              ${restaurant.restrictions
                .map(
                  (restriction) =>
                    `<span class="tag">${esc(
                      labelOf(restriction)
                    )}</span>`
                )
                .join("")}
            </div>
          `
            : ""
        }
      </article>
    `
    )
    .join("");
}

// ============================================================
// EVENTOS
// ============================================================

searchInput.addEventListener("input", (event) => {
  query = event.target.value.toLowerCase().trim();
  render();
});

// ============================================================
// INICIALIZAÇÃO
// ============================================================

createFilterChips();
render();