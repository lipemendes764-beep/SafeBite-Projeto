const CKEY = "safebite_clients";
const SKEY = "safebite_sales";
const DKEY = "safebite_dishes";
const ACTIVE = "safebite_active_client";

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

/* ==========================================================
   HELPERS
========================================================== */
function load(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function esc(str) {
  return String(str || "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function brl(value) {
  return "R$ " + Number(value).toFixed(2).replace(".", ",");
}

function labelOf(id) {
  const found = RESTRICTIONS.find(([key]) => key === id);
  return found ? found[1] : id;
}

function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("pt-BR");
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 1500);
}

/* ==========================================================
   DADOS
========================================================== */
const clients = load(CKEY);
const dishes = load(DKEY);
const sales = load(SKEY);

const activeId =
  localStorage.getItem(ACTIVE) || (clients.length ? clients[0].id : null);

const client = clients.find(c => c.id === activeId);

/* ==========================================================
   RENDER
========================================================== */
function render() {
  const content = document.getElementById("content");
  if (!content) return;

  /* Sem cliente cadastrado */
  if (!client) {
    content.innerHTML = `
      <div class="empty">
        Você ainda não possui um cadastro de cliente.
        <br>
        <a href="cadastro-cliente.html">Cadastrar agora →</a>
      </div>
    `;
    return;
  }

  /* Iniciais do avatar */
  const initials = client.name
    .split(" ")
    .filter(Boolean)
    .map(part => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  /* Endereço */
  const address = client.street
    ? `${client.street}, ${client.number || "S/N"}${
        client.complement ? " — " + client.complement : ""
      }`
    : "—";

  const cityLine = client.city
    ? `${client.neighborhood || ""}${
        client.neighborhood ? ", " : ""
      }${client.city}/${client.state || ""} · CEP ${client.zip || "—"}`
    : "—";

  /* Últimos pedidos */
  const myOrders = sales
    .filter(order => order.clientId === client.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  /* HTML principal */
  content.innerHTML = `
    <div class="hero">
      <div class="avatar">${esc(initials)}</div>

      <div class="hero-info">
        <h2>${esc(client.name)}</h2>
        <p>📧 ${esc(client.email || "—")}</p>
        <p>📱 ${esc(client.phone || "—")}</p>
      </div>
    </div>

    <div class="grid">
      <div class="info">
        <div class="info-label">Data de nascimento</div>
        <div class="info-value">${esc(client.birthDate || "—")}</div>
      </div>

      <div class="info">
        <div class="info-label">CEP</div>
        <div class="info-value">${esc(client.zip || "—")}</div>
      </div>

      <div class="info" style="grid-column: 1 / -1;">
        <div class="info-label">Endereço</div>
        <div class="info-value">
          ${esc(address)}
          <br>
          <span style="color:#a8a29e;font-size:.85rem;">
            ${esc(cityLine)}
          </span>
        </div>
      </div>
    </div>

    <div class="card">
      <h3>Restrições alimentares</h3>
      <p class="hint">
        Selecione suas restrições. Os pratos do catálogo serão filtrados
        automaticamente conforme suas preferências.
      </p>

      <div class="chips" id="restrictions"></div>
    </div>

    <div class="card">
      <h3>Últimos pedidos</h3>

      ${
        myOrders.length
          ? myOrders.map(order => {
              const dish = dishes.find(d => d.id === order.dishId);

              return `
                <div class="order">
                  <div class="order-info">
                    <p class="order-name">
                      ${esc(dish?.name || "Prato removido")}
                      × ${order.quantity}
                    </p>

                    <p class="order-meta">
                      ${formatDate(order.date)} ·
                      ${order.paid ? "Pago" : "A receber"}
                    </p>
                  </div>

                  <span class="order-total">
                    ${brl(order.total)}
                  </span>
                </div>
              `;
            }).join("")
          : `
            <p style="color:#78716c;margin:0;">
              Nenhum pedido realizado ainda.
            </p>
          `
      }
    </div>
  `;

  renderRestrictionChips();
}

/* ==========================================================
   CHIPS DE RESTRIÇÕES
========================================================== */
function renderRestrictionChips() {
  const container = document.getElementById("restrictions");
  if (!container || !client) return;

  const current = new Set(client.restrictions || []);

  RESTRICTIONS.forEach(([id, label]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chip" + (current.has(id) ? " active" : "");
    button.textContent = label;

    button.addEventListener("click", () => {
      if (current.has(id)) {
        current.delete(id);
        button.classList.remove("active");
      } else {
        current.add(id);
        button.classList.add("active");
      }

      client.restrictions = Array.from(current);

      const index = clients.findIndex(c => c.id === client.id);
      if (index !== -1) {
        clients[index] = client;
        save(CKEY, clients);
      }

      showToast("Preferência atualizada com sucesso.");
    });

    container.appendChild(button);
  });
}

/* ==========================================================
   INIT
========================================================== */
render();