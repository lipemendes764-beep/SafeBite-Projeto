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

// =========================
// Local Storage
// =========================
function load() {
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

function save(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// =========================
// Estado
// =========================
let records = load();
let selected = new Set();

// =========================
// Elementos
// =========================
const chipsEl = document.getElementById("chips");
const form = document.getElementById("form");
const msg = document.getElementById("msg");

// =========================
// Renderizar chips
// =========================
RESTRICTIONS.forEach(([id, label]) => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "chip";
  button.textContent = label;

  button.addEventListener("click", () => {
    if (selected.has(id)) {
      selected.delete(id);
      button.classList.remove("active");
    } else {
      selected.add(id);
      button.classList.add("active");
    }
  });

  chipsEl.appendChild(button);
});

// =========================
// Utilitários
// =========================
function labelOf(id) {
  const item = RESTRICTIONS.find(([key]) => key === id);
  return item ? item[1] : id;
}

function esc(value) {
  return String(value || "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

// =========================
// Renderizar lista
// =========================
function render() {
  const countEl = document.getElementById("count");
  const listEl = document.getElementById("list");

  countEl.textContent = records.length;

  if (records.length === 0) {
    listEl.innerHTML = `
      <div class="empty">
        Nenhum restaurante cadastrado.
      </div>
    `;
    return;
  }

  listEl.innerHTML = records.map(r => `
    <div class="item">
      <div class="item-body">
        <p class="item-title">${esc(r.name)}</p>
        <p class="item-sub">${esc(r.cuisine || "—")}</p>
        <p class="item-meta">
          📍 ${esc(r.city ? `${r.city}/${r.state}` : "—")} ·
          CNPJ: ${esc(r.cnpj)}
        </p>

        ${
          r.restrictions && r.restrictions.length
            ? `
              <div class="tags">
                ${r.restrictions
                  .map(item => `<span class="tag">${esc(labelOf(item))}</span>`)
                  .join("")}
              </div>
            `
            : ""
        }
      </div>

      <button
        class="remove"
        title="Remover restaurante"
        data-id="${r.id}"
      >
        🗑
      </button>
    </div>
  `).join("");

  // Botões de remoção
  listEl.querySelectorAll(".remove").forEach(button => {
    button.addEventListener("click", () => {
      records = records.filter(item => item.id !== button.dataset.id);
      save(records);
      render();
    });
  });
}

// =========================
// Submit do formulário
// =========================
form.addEventListener("submit", event => {
  event.preventDefault();

  const data = new FormData(form);

  const name = data.get("name").trim();
  const cnpj = data.get("cnpj").trim();
  const cuisine = data.get("cuisine").trim();
  const city = data.get("city").trim();
  const state = data.get("state").trim().toUpperCase();
  const phone = data.get("phone").trim();

  if (!name || !cnpj) {
    msg.innerHTML = `
      <p class="msg err">
        Preencha pelo menos o nome e o CNPJ.
      </p>
    `;
    return;
  }

  const restaurant = {
    id: "rt-" + Date.now(),
    name,
    cnpj,
    cuisine,
    city,
    state,
    phone,
    restrictions: Array.from(selected)
  };

  records.unshift(restaurant);
  save(records);

  // Limpar formulário
  form.reset();
  selected.clear();

  // Remover seleção visual dos chips
  chipsEl
    .querySelectorAll(".chip.active")
    .forEach(chip => chip.classList.remove("active"));

  // Mensagem de sucesso
  msg.innerHTML = `
    <p class="msg ok">
      Restaurante cadastrado com sucesso!
    </p>
  `;

  render();
});

// =========================
// Inicialização
// =========================
render();