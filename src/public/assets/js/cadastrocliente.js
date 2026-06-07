const KEY = "safebite_clients";
const RESTRICTIONS = [
  ["vegano", "Vegano"],
  ["vegetariano", "Vegetariano"],
  ["semgluten", "Sem glúten"],
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
    id: "c1",
    name: "Camila Souza",
    email: "camila@example.com",
    phone: "(11) 91234-5678",
    birthDate: "1992-04-15",
    street: "Rua das Acácias",
    number: "245",
    complement: "Apto 12",
    neighborhood: "Vila Madalena",
    city: "São Paulo",
    state: "SP",
    zip: "01234-567",
    restrictions: ["sem-lactose", "vegetariano"]
  }
];

function load() {
  const r = localStorage.getItem(KEY);
  if (!r) {
    localStorage.setItem(KEY, JSON.stringify(SEED));
    return SEED.slice();
  }
  try {
    return JSON.parse(r);
  } catch (e) {
    return SEED.slice();
  }
}

function save(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

function esc(s) {
  return String(s || "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

function labelOf(id) {
  const found = RESTRICTIONS.find(([k]) => k === id);
  return found ? found[1] : id;
}

let records = load();
let selected = new Set();

const chipsEl = document.getElementById("chips");
if (chipsEl) {
  RESTRICTIONS.forEach(([id, label]) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.textContent = label;
    b.addEventListener("click", () => {
      if (selected.has(id)) {
        selected.delete(id);
        b.classList.remove("active");
      } else {
        selected.add(id);
        b.classList.add("active");
      }
    });
    b.dataset.id = id;
    chipsEl.appendChild(b);
  });
}

function render() {
  const countEl = document.getElementById("count");
  if (countEl) countEl.textContent = String(records.length);

  const list = document.getElementById("list");
  if (!list) return;

  if (!records.length) {
    list.innerHTML = '<div class="empty">Nenhum cliente cadastrado.</div>';
    return;
  }

  list.innerHTML = records
    .map((c) => {
      const address = c.street
        ? `${esc(c.street)}, ${esc(c.number)} — ${esc(c.neighborhood)}, ${esc(c.city)}/${esc(c.state)}`
        : "Endereço não informado";

      const tags = (c.restrictions && c.restrictions.length)
        ? `<div class="tags">${c.restrictions.map(x => `<span class="tag">${esc(labelOf(x))}</span>`).join("")}</div>`
        : "";

      return `
        <div class="item">
          <div class="item-body">
            <p class="item-title">${esc(c.name)}</p>
            <p class="item-sub">${esc(c.email)} · ${esc(c.phone || "—")}</p>
            <p class="item-meta">📍 ${address}</p>
            ${tags}
          </div>
          <button class="remove" data-id="${esc(c.id)}">🗑</button>
        </div>`;
    })
    .join("");

  list.querySelectorAll(".remove").forEach((b) => {
    b.addEventListener("click", () => {
      const id = b.dataset.id;
      records = records.filter((x) => x.id !== id);
      save(records);
      render();
    });
  });
}

const form = document.getElementById("form");
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    const msg = document.getElementById("msg");

    const name = (f.name && f.name.value || "").trim();
    const email = (f.email && f.email.value || "").trim();

    if (!name || !email) {
      if (msg) msg.innerHTML = '<p class="msg err">Preencha nome e e-mail.</p>';
      return;
    }

    const newRecord = {
      id: "c-" + Date.now(),
      name: name,
      email: email,
      phone: (f.phone && f.phone.value) || "",
      birthDate: (f.birthDate && f.birthDate.value) || "",
      street: (f.street && f.street.value) || "",
      number: (f.number && f.number.value) || "",
      complement: (f.complement && f.complement.value) || "",
      neighborhood: (f.neighborhood && f.neighborhood.value) || "",
      city: (f.city && f.city.value) || "",
      state: (f.state && f.state.value) ? f.state.value.toUpperCase() : "",
      zip: (f.zip && f.zip.value) || "",
      restrictions: Array.from(selected)
    };

    records.unshift(newRecord);
    save(records);

    f.reset();
    selected.clear();
    chipsEl && chipsEl.querySelectorAll(".chip.active").forEach(c => c.classList.remove("active"));

    if (msg) msg.innerHTML = '<p class="msg ok">Cliente cadastrado com sucesso!</p>';
    render();
  });
}

render();
