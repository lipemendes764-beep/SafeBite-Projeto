const DKEY = "safebite_dishes";
const RKEY = "safebite_restaurants";

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

const SEED_R = [
    {
        id: "rt1",
        name: "Verde Vivo",
        cuisine: "Vegano contemporâneo",
        city: "São Paulo",
        state: "SP"
    },

    {
        id: "rt2",
        name: "Trigo Livre",
        cuisine: "Italiana sem glúten",
        city: "Rio de Janeiro",
        state: "RJ"
    },

    {
        id: "rt3",
        name: "Sabor Kosher",
        cuisine: "Mediterrânea kosher",
        city: "Curitiba",
        state: "PR"
    }
];

const SEED_D = [
    {
        id: "d1",
        name: "Lasanha de Berinjela",
        description:
            "Camadas de berinjela grelhada com molho de tomate caseiro e manjericão fresco.",
        price: 42.9,
        restaurantId: "rt1",
        restrictions: ["sem-gluten", "vegetariano"],
        allergens: "Pode conter traços de castanhas"
    },

    {
        id: "d2",
        name: "Pizza Margherita SG",
        description:
            "Massa 100% sem glúten com mussarela de búfala, tomate San Marzano e azeite extra virgem.",
        price: 58,
        restaurantId: "rt2",
        restrictions: ["sem-gluten", "vegetariano"],
        allergens: "Contém lactose"
    },

    {
        id: "d3",
        name: "Bowl Mediterrâneo",
        description:
            "Grão-de-bico assado, hummus, tabule e pão pita kosher.",
        price: 46.5,
        restaurantId: "rt3",
        restrictions: ["kosher", "vegetariano", "sem-lactose"],
        allergens: "Contém gergelim"
    },

    {
        id: "d4",
        name: "Salada do Verde",
        description:
            "Mix de folhas orgânicas, abacate, sementes e molho de limão siciliano.",
        price: 32,
        restaurantId: "rt1",
        restrictions: [
            "vegano",
            "sem-gluten",
            "sem-lactose",
            "organico"
        ],
        allergens: ""
    }
];

function load(key, seed) {
    const raw = localStorage.getItem(key);

    if (!raw) {
        localStorage.setItem(key, JSON.stringify(seed));
        return seed.slice();
    }

    try {
        return JSON.parse(raw);
    } catch {
        return seed.slice();
    }
}

function esc(str) {
    return String(str || "").replace(
        /[&<>"']/g,
        c => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[c])
    );
}

function brl(value) {
    return "R$ " + value.toFixed(2).replace(".", ",");
}

function labelOf(id) {
    const found = RESTRICTIONS.find(([key]) => key === id);
    return found ? found[1] : id;
}

const restaurants = load(RKEY, SEED_R);
const dishes = load(DKEY, SEED_D);

const CART = "safebite_cart";

let query = "";
let maxPrice = "";
let restId = "";
let sortMode = "relevance";

const selected = new Set();

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

        render();
    };

    chipsEl.appendChild(button);
});

const restSel = document.getElementById("restFilter");

restSel.innerHTML += restaurants
    .map(
        r => `
        <option value="${r.id}" style="background:#161c18">
            ${esc(r.name)}
            ${r.city ? " — " + esc(r.city) : ""}
        </option>
    `
    )
    .join("");

document
    .getElementById("q")
    .addEventListener("input", e => {

        query = e.target.value.toLowerCase();
        render();
    });

document
    .getElementById("maxPrice")
    .addEventListener("input", e => {

        maxPrice = e.target.value;
        render();
    });

restSel.addEventListener("change", e => {

    restId = e.target.value;
    render();
});

document
    .querySelectorAll(".sort button")
    .forEach(button => {

        button.onclick = () => {

            document
                .querySelectorAll(".sort button")
                .forEach(btn => btn.classList.remove("active"));

            button.classList.add("active");

            sortMode = button.dataset.sort;

            render();
        };
    });

document.getElementById("clear").onclick = () => {

    query = "";
    maxPrice = "";
    restId = "";

    selected.clear();

    document.getElementById("q").value = "";
    document.getElementById("maxPrice").value = "";

    restSel.value = "";

    chipsEl
        .querySelectorAll(".chip.active")
        .forEach(chip => chip.classList.remove("active"));

    render();
};

function rname(id) {
    return restaurants.find(r => r.id === id)?.name || "—";
}

function loadCart() {

    const raw = localStorage.getItem(CART);

    try {
        return raw ? JSON.parse(raw) : [];

    } catch {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(CART, JSON.stringify(cart));
}

function orderDish(dishId) {

    const cart = loadCart();

    const item = cart.find(x => x.dishId === dishId);

    if (item) {
        item.quantity += 1;

    } else {
        cart.push({
            dishId,
            quantity: 1
        });
    }

    saveCart(cart);

    // Caso exista a tela:
    // window.location.href = "pagamento.html";
}

function render() {

    const max = parseFloat(maxPrice);

    let filtered = dishes.filter(dish => {

        const q =
            !query ||
            dish.name.toLowerCase().includes(query) ||
            (dish.description || "")
                .toLowerCase()
                .includes(query);

        const p =
            isNaN(max) ||
            dish.price <= max;

        const r =
            !restId ||
            dish.restaurantId === restId;

        const rs =
            selected.size === 0 ||
            Array.from(selected).every(restriction =>
                dish.restrictions.includes(restriction)
            );

        return q && p && r && rs;
    });

    // Ordenação
    if (sortMode === "price-asc") {

        filtered.sort((a, b) => a.price - b.price);

    } else if (sortMode === "price-desc") {

        filtered.sort((a, b) => b.price - a.price);

    } else if (sortMode === "name") {

        filtered.sort((a, b) =>
            a.name.localeCompare(b.name, "pt-BR")
        );
    }

    // KPIs
    document.getElementById("kpi-total").textContent =
        dishes.length;

    document.getElementById("kpi-results").textContent =
        filtered.length;

    const avg =
        filtered.length
            ? filtered.reduce((acc, dish) =>
                acc + dish.price, 0
            ) / filtered.length
            : 0;

    document.getElementById("kpi-avg").textContent =
        brl(avg);

    document.getElementById("kpi-rest").textContent =
        new Set(
            filtered.map(d => d.restaurantId)
        ).size;

    const list = document.getElementById("list");

    // Estado vazio
    if (!filtered.length) {

        list.innerHTML = `
            <div class="empty" style="grid-column:1/-1">

                <div class="empty-icon">
                    🍽
                </div>

                Nenhum prato encontrado com esses filtros.
            </div>
        `;

        return;
    }

    // Render cards
    list.innerHTML = filtered
        .map(dish => `

            <article class="dish">

                <div class="dish-head">

                    <div style="min-width:0">

                        <h3 class="dish-title">
                            ${esc(dish.name)}
                        </h3>

                        <p class="dish-rest">
                            ${esc(rname(dish.restaurantId))}
                        </p>

                    </div>

                    <span class="price">
                        ${brl(dish.price)}
                    </span>

                </div>

                ${dish.description
                    ? `
                        <p class="dish-desc">
                            ${esc(dish.description)}
                        </p>
                    `
                    : ""
                }

                ${dish.restrictions.length
                    ? `
                        <div class="tags">

                            ${dish.restrictions
                                .map(
                                    restriction => `
                                    <span class="tag">
                                        ${esc(labelOf(restriction))}
                                    </span>
                                `
                                )
                                .join("")}

                        </div>
                    `
                    : ""
                }

                ${dish.allergens
                    ? `
                        <span class="aller">
                            ⚠ ${esc(dish.allergens)}
                        </span>
                    `
                    : ""
                }

                <button
                    type="button"
                    class="order-btn"
                    onclick="orderDish('${dish.id}')"
                >
                    Pedir
                </button>

            </article>

        `)
        .join("");
}

render();