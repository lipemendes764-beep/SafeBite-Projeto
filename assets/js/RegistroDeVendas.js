const KEY = "safebite_sales", CKEY = "safebite_clients", DKEY = "safebite_dishes";

function load(k, seed) {
    const r = localStorage.getItem(k);
    if (!r) {
        if (seed) localStorage.setItem(k, JSON.stringify(seed));
        return seed ? seed.slice() : [];
    }
    try {
        return JSON.parse(r);
    } catch {
        return seed ? seed.slice() : [];
    }
}

function save(k, v) {
    localStorage.setItem(k, JSON.stringify(v));
}

function esc(s) {
    return String(s || "").replace(/[&<>"']/g, c => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
    }[c]));
}

function brl(n) {
    return "R$ " + n.toFixed(2).replace(".", ",");
}

const METH = {
    pix: "PIX", 
    credito: "Crédito", 
    debito: "Débito", 
    dinheiro: "Dinheiro"
};

const clients = load(CKEY, [
    { id: "c1", name: "Camila Souza" }
]);

const dishes = load(DKEY, [
    { id: "d1", name: "Lasanha de Berinjela", price: 42.9 },
    { id: "d2", name: "Pizza Margherita SG", price: 58 }
]);

let sales = load(KEY, []);

const cli = document.getElementById("cli"),
      dish = document.getElementById("dish");

cli.innerHTML = clients.length ? 
    clients.map(c => `<option value="${c.id}" style="background:#161c18">${esc(c.name)}</option>`).join("") : 
    '<option value="">Cadastre um cliente</option>';

dish.innerHTML = dishes.length ? 
    dishes.map(d => `<option value="${d.id}" data-price="${d.price}" style="background: #161c18">${esc(d.name)} - ${brl(d.price)}</option>`).join("") : 
    '<option value="">Cadastre um prato</option>';

const form = document.getElementById("form");
const totalEl = document.getElementById("total");

function calcTotal() {
    const opt = dish.options[dish.selectedIndex];
    const price = parseFloat(opt?.dataset?.price || "0");
    const qty = parseInt(form.quantity.value || "0", 10) || 0;
    totalEl.textContent = brl(price * qty);
}

form.addEventListener("input", calcTotal);
calcTotal();

function nameById(arr, id) {
    return arr.find(x => x.id === id)?.name || "-";
}

function priceById(id) {
    return dishes.find(x => x.id === id)?.price || 0;
}

function renderKPIs() {
    const total = sales.reduce((a, s) => a + s.total, 0);
    const paid = sales.filter(s => s.paid).reduce((a, s) => a + s.total, 0);
    
    document.getElementById("kpi-total").textContent = brl(total);
    document.getElementById("kpi-paid").textContent = brl(paid);
    document.getElementById("kpi-due").textContent = brl(total - paid);
    document.getElementById("kpi-count").textContent = sales.length;
}

function render() {
    renderKPIs();
    document.getElementById("count").textContent = sales.length;
    
    const list = document.getElementById("list");
    
    if (!sales.length) {
        list.innerHTML = '<div class="empty">Nenhuma venda registrada.</div>'; 
        return;
    }
    
    list.innerHTML = sales.map(s => `
        <div class="item">
            <div class="item-body">
                <div style="display: flex; justify-content: space-between; align-items:flex-start">
                    <p class="item-title">${esc(nameById(dishes, s.dishId))} x ${s.quantity}</p>
                    <span class="price">${brl(s.total)}</span>
                </div>
                <p class="item-sub">${esc(nameById(clients, s.clientId))} - ${new Date(s.date).toLocaleString("pt-BR")}</p>
                <span class="pill meth">${METH[s.paymentMethod]}</span>
                <span class="pill ${s.paid ? "paid" : "due"}">${s.paid ? "Pago" : "A receber"}</span>
            </div>
            <button class="remove" data-id="${s.id}">X</button>
        </div>
    `).join("");

    list.querySelectorAll(".remove").forEach(b => {
        b.onclick = () => {
            sales = sales.filter(x => x.id !== b.dataset.id); 
            save(KEY, sales); 
            render();
        }
    });
}

form.addEventListener("submit", e => {
    e.preventDefault();
    const msg = document.getElementById("msg");
    
    if (!form.clientId.value || !form.dishId.value) {
        msg.innerHTML = '<p class="msg err">Selecione cliente e prato.</p>'; 
        return;
    }
    
    const qty = parseInt(form.quantity.value, 10) || 1;
    
    sales.unshift({
        id: "s-" + Date.now(), 
        clientId: form.clientId.value,
        dishId: form.dishId.value,
        quantity: qty, 
        total: priceById(form.dishId.value) * qty,
        paymentMethod: form.paymentMethod.value, 
        paid: form.paid.checked,
        date: new Date().toISOString()
    });
    
    save(KEY, sales);
    form.reset(); 
    form.quantity.value = 1; 
    calcTotal();
    
    msg.innerHTML = '<p class="msg ok">Venda registrada com sucesso!</p>';
    render();
});

render();