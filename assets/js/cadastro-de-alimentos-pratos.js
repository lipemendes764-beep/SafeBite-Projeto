const KEY = "safebite_dishes";
const RKEY = "safebite_restaurants";

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

const SEED_R = [
    {
        id: "rt1",
        name: "Verde Vivo",
        cuisine: "Vegano",
        restrictions: ["vegano", "sem-lactose", "semgluten"]
    },
    {
        id: "rt2",
        name: "Trigo Livre",
        cuisine: "Italiana SG",
        restrictions: ["sem-gluten", "vegetariano"]
    }
];

const SEED_D = [
    {
        id: "d1",
        name: "Lasanha de Berinjela",
        description: "Camadas de berinjela grelhada com molho caseiro.",
        price: 42.9,
        restaurantId: "rt1",
        restrictions: ["semgluten", "vegetariano"],
        allergens: "Pode conter traços de castanhas"
    },
    {
        id: "d2",
        name: "Pizza Margherita SG",
        description: "Massa 100% sem glúten com mussarela de búfala.",
        price: 58,
        restaurantId: "rt2",
        restrictions: ["semgluten", "vegetariano"],
        allergens: "Contém lactose"
    }
];

function load(key, seed) {

    const result = localStorage.getItem(key);

    if (!result) {
        localStorage.setItem(key, JSON.stringify(seed));
        return seed.slice();
    }

    try {
        return JSON.parse(result);
    } catch {
        return seed.slice();
    }
}

function save(key, list) {
    localStorage.setItem(key, JSON.stringify(list));
}

function esc(str) {

    return String(str || "").replace(/[&<>"']/g, c => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
    }[c]));
}

function labelOf(id) {

    const found = RESTRICTIONS.find(([key]) => key === id);

    return found ? found[1] : id;
}

const restaurants = load(RKEY, SEED_R);

let dishes = load(KEY, SEED_D);

let selected = new Set();

const sel = document.getElementById("restaurantSel");

sel.innerHTML = restaurants.length
    ? restaurants.map(r => `
        <option value="${r.id}" style="background:#161c18">
            ${esc(r.name)}
        </option>
    `).join("")
    : '<option value="">Cadastre um restaurante</option>';


const chipsEl = document.getElementById("chips");

RESTRICTIONS.forEach(([id, label]) => {

    const button = document.createElement("button");

    button.type = "button";
    button.className = "chip";
    button.textContent = label;

    button.onclick = () => {

        if (selected.has(id)) {

            selected.delete(id);
            button.classList.remove("active");

        } else {

            selected.add(id);
            button.classList.add("active");
        }
    };

    chipsEl.appendChild(button);
});

function rname(id) {

    return restaurants.find(r => r.id === id)?.name || "—";
}

function render() {

    document.getElementById("count").textContent = dishes.length;

    const list = document.getElementById("list");

    if (!dishes.length) {

        list.innerHTML = `
            <div class="empty">
                Nenhum prato cadastrado.
            </div>
        `;

        return;
    }

    list.innerHTML = dishes.map(d => `

        <div class="item">

            <div class="item-body">

                <div style="display:flex;justify-content:space-between;align-items:flex-start">

                    <p class="item-title">
                        ${esc(d.name)}
                    </p>

                    <span class="price">
                        R$ ${d.price.toFixed(2)}
                    </span>

                </div>

                <p class="item-sub">
                    ${esc(rname(d.restaurantId))}
                </p>

                ${d.description ? `
                    <p class="item-desc">
                        ${esc(d.description)}
                    </p>
                ` : ""}

                ${d.restrictions.length ? `
                    <div class="tags">

                        ${d.restrictions.map(x => `
                            <span class="tag">
                                ${esc(labelOf(x))}
                            </span>
                        `).join("")}

                    </div>
                ` : ""}

                ${d.allergens ? `
                    <div>
                        <span class="aller">
                            ⚠ ${esc(d.allergens)}
                        </span>
                    </div>
                ` : ""}

            </div>

            <button class="remove" data-id="${d.id}">
                🗑
            </button>

        </div>

    `).join("");

    /* Remover prato */
    list.querySelectorAll(".remove").forEach(button => {

        button.onclick = () => {

            dishes = dishes.filter(x => x.id !== button.dataset.id);

            save(KEY, dishes);

            render();
        };
    });
}


document.getElementById("form").addEventListener("submit", event => {

    event.preventDefault();

    const form = event.target;

    const msg = document.getElementById("msg");

    const price = parseFloat(form.price.value);

    if (
        !form.name.value.trim()
        || isNaN(price)
        || !form.restaurantId.value
    ) {

        msg.innerHTML = `
            <p class="msg err">
                Preencha nome, preço válido e restaurante.
            </p>
        `;

        return;
    }

    dishes.unshift({

        id: "d-" + Date.now(),

        name: form.name.value,

        description: form.description.value,

        price: price,

        restaurantId: form.restaurantId.value,

        allergens: form.allergens.value,

        restrictions: Array.from(selected)
    });

    save(KEY, dishes);

    /* Reset */
    form.reset();

    selected.clear();

    chipsEl.querySelectorAll(".chip.active").forEach(chip => {
        chip.classList.remove("active");
    });

    msg.innerHTML = `
        <p class="msg ok">
            Prato cadastrado com sucesso!
        </p>
    `;

    render();
});

render();