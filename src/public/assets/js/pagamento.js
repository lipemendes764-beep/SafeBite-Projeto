const CKEY = "safebite_clients";
const ACTIVE = "safebite_active_client";
const CART = "safebite_cart";

function load(key) {
    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
        return [];
    }
}

function save(key, value) {
    localStorage.setItem(
        key,
        JSON.stringify(value)
    );
}

function brl(value) {
    return "R$ " + value.toFixed(2).replace(".", ",");
}

/* Cliente */

const clients = load(CKEY);

const activeId =
    localStorage.getItem(ACTIVE) ||
    clients[0]?.id;

const client =
    clients.find(c => c.id === activeId) || {
        name: "Convidado"
    };

/* Endereço */

document.getElementById("address").innerHTML = `
    <p>${client.name}</p>
`;

/* Carrinho */

let cart = load(CART);

function renderItems() {

    const itemsEl =
        document.getElementById("items");

    let subtotal = 0;

    itemsEl.innerHTML = cart.map(item => {

        subtotal += item.price * item.quantity;

        return `
            <div>
                <p>${item.name}</p>
                <span>
                    ${item.quantity}x
                </span>
            </div>
        `;
    }).join("");

    document.getElementById("subtotal")
        .textContent = brl(subtotal);

    document.getElementById("total")
        .textContent = brl(subtotal);
}

/* Métodos */

document.querySelectorAll(".method")
.forEach(button => {

    button.onclick = () => {

        document.querySelectorAll(".method")
        .forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        document.getElementById("submit-text")
            .textContent =
            "Pagar com " +
            button.dataset.method;
    };
});

/* Finalizar */

document.getElementById("form")
.addEventListener("submit", e => {

    e.preventDefault();

    alert("Pedido confirmado!");
});

renderItems();