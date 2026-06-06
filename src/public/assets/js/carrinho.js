const STORAGE_KEY = "safebite_cart";
const LEGACY_STORAGE_KEY = "safebite-cart";

const CARRINHO_INICIAL = {
  id: 1,
  cliente: "Maria Silva",
  taxaEntrega: 6.90,
  itens: [
    {
      id: 101,
      nome: "Hambúrguer Vegano",
      descricao: "Hambúrguer vegetal artesanal com queijo de castanhas",
      preco: 32.90,
      imagem: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=300&fit=crop",
      quantidade: 2,
      restaurante: "Verde & Cia",
      restricoes: ["vegano", "sem-lactose"]
    },
    {
      id: 102,
      nome: "Pizza Sem Glúten",
      descricao: "Pizza artesanal sem lactose com mussarela vegetal",
      preco: 49.90,
      imagem: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=300&fit=crop",
      quantidade: 1,
      restaurante: "Massa Madre",
      restricoes: ["sem-gluten", "sem-lactose"]
    },
    {
      id: 103,
      nome: "Bowl de Quinoa",
      descricao: "Quinoa, abacate, grão de bico e tahine",
      preco: 28.50,
      imagem: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=300&fit=crop",
      quantidade: 1,
      restaurante: "Verde Folha",
      restricoes: ["vegano", "sem-gluten"]
    }
  ]
};

const fmt = (n) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

let state = { itens: [], taxaEntrega: CARRINHO_INICIAL.taxaEntrega };

function normalizeState(raw) {
  const safeItens = Array.isArray(raw?.itens) ? raw.itens : CARRINHO_INICIAL.itens;
  const safeTaxa = Number.isFinite(raw?.taxaEntrega) ? raw.taxaEntrega : CARRINHO_INICIAL.taxaEntrega;

  return {
    itens: safeItens.map((item) => ({
      ...item,
      id: Number(item.id) || item.id,
      preco: Number(item.preco) || 0,
      quantidade: Math.max(1, Number(item.quantidade) || 1),
      restricoes: Array.isArray(item.restricoes) ? item.restricoes : []
    })),
    taxaEntrega: safeTaxa
  };
}

function init() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    state = saved ? normalizeState(JSON.parse(saved)) : {
      itens: CARRINHO_INICIAL.itens,
      taxaEntrega: CARRINHO_INICIAL.taxaEntrega
    };
  } catch (e) {
    console.error("Falha ao carregar carrinho", e);
    state = {
      itens: CARRINHO_INICIAL.itens,
      taxaEntrega: CARRINHO_INICIAL.taxaEntrega
    };
  }
  bind();
  render();
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(state));
}

function bind() {
  document.getElementById("btn-clear").addEventListener("click", () => {
    if (confirm("Limpar todos os itens do carrinho?")) {
      state.itens = [];
      save();
      render();
    }
  });
  document.getElementById("btn-checkout").addEventListener("click", () => {
    if (state.itens.length === 0) return;
    alert("Pedido enviado! Total: " + fmt(getTotal()));
    state.itens = [];
    save();
    render();
  });
}

function changeQty(id, delta) {
  const item = state.itens.find((i) => i.id === id);
  if (!item) return;
  item.quantidade = Math.max(0, item.quantidade + delta);
  if (item.quantidade === 0) {
    state.itens = state.itens.filter((i) => i.id !== id);
  }
  save();
  render();
}

function removeItem(id) {
  state.itens = state.itens.filter((i) => i.id !== id);
  save();
  render();
}

function getSubtotal() {
  return state.itens.reduce((a, i) => a + i.preco * i.quantidade, 0);
}

function getTotal() {
  return state.itens.length === 0 ? 0 : getSubtotal() + state.taxaEntrega;
}

function render() {
  const list = document.getElementById("cart-list");
  const empty = document.getElementById("empty-state");
  const subtitle = document.getElementById("cart-subtitle");
  const tpl = document.getElementById("item-template");

  if (!list || !empty || !subtitle || !tpl) return;

  list.innerHTML = "";
  const totalQtd = state.itens.reduce((a, i) => a + i.quantidade, 0);
  subtitle.textContent =
    totalQtd === 0
      ? "Nenhum item no carrinho."
      : `${totalQtd} ${totalQtd === 1 ? "item" : "itens"} prontos para finalizar.`;

  empty.hidden = state.itens.length > 0;

  state.itens.forEach((item) => {
    const node = tpl.content.cloneNode(true);
    const li = node.querySelector(".cart-item");
    li.dataset.id = item.id;
    node.querySelector(".item-image").src = item.imagem;
    node.querySelector(".item-image").alt = item.nome;
    node.querySelector(".item-restaurant").textContent = item.restaurante;
    node.querySelector(".item-name").textContent = item.nome;
    node.querySelector(".item-desc").textContent = item.descricao;
    node.querySelector(".item-price").textContent =
      fmt(item.preco * item.quantidade) +
      (item.quantidade > 1 ? ` · ${fmt(item.preco)} cada` : "");
    node.querySelector(".qty-value").textContent = item.quantidade;

    const tags = node.querySelector(".item-tags");
    (item.restricoes || []).forEach((r) => {
      const span = document.createElement("span");
      span.className = "tag";
      span.textContent = r;
      tags.appendChild(span);
    });

    node.querySelector(".qty-dec").addEventListener("click", () => changeQty(item.id, -1));
    node.querySelector(".qty-inc").addEventListener("click", () => changeQty(item.id, +1));
    node.querySelector(".item-remove").addEventListener("click", () => removeItem(item.id));

    list.appendChild(node);
  });

  document.getElementById("sum-subtotal").textContent = fmt(getSubtotal());
  document.getElementById("sum-delivery").textContent =
    state.itens.length === 0 ? fmt(0) : fmt(state.taxaEntrega);
  document.getElementById("sum-total").textContent = fmt(getTotal());

  document.getElementById("btn-checkout").disabled = state.itens.length === 0;
}

init();