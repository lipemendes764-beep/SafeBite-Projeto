const STORAGE_KEY = "safebite_restaurants";

const MENU_BY_RESTAURANT = [

    {
        restauranteId: "rt1",

        pratos: [

            {
                nome: "Lasanha de Berinjela",
                descricao: "Camadas de berinjela grelhada com molho caseiro.",
                categoria: "Prato Principal",
                preco:  42.9,
                imagem: "https://picsum.photos/400/250?1"
            }

        ]
    },
    {
        restauranteId: "rt2",

        pratos: [

            {
                nome: "Pizza Margherita SG",
                descricao: "Massa 100% sem glúten com mussarela de búfala.",
                categoria: "Prato Principal",
                preco: 49.90,
                imagem: "https://picsum.photos/400/250?3"
            },

        ]
    },

    {
        restauranteId: "rt3",

        pratos: [

            {
                nome: "Bowl Mediterrâneo",
                descricao: "Grão-de-bico assado, hummus, tabule e pão pita kosher.",
                categoria: "Entrada",
                preco: 46.5,
                imagem: "https://picsum.photos/400/250?5"
            }

        ]
    }

];

function loadRestaurants() {

    const data =
        localStorage.getItem(STORAGE_KEY);

    if (!data) return [];

    return JSON.parse(data);
}

const restaurants =
    loadRestaurants();

const select =
    document.getElementById(
        "restaurantSelect"
    );

const cardapio =
    document.getElementById(
        "cardapio"
    );

const count =
    document.getElementById(
        "count"
    );

restaurants.forEach(restaurante => {

    select.innerHTML += `
        <option value="${restaurante.id}">
            ${restaurante.name}
        </option>
    `;
console.log(select);
console.log(select.innerHTML);
});

select.addEventListener("change", () => {

    const id =
        select.value;

    const menu =
        MENU_BY_RESTAURANT.find(
            item =>
                item.restauranteId === id
        );

    if (!menu) {

        cardapio.innerHTML = `
            <div class="empty">
                Nenhum prato encontrado.
            </div>
        `;

        count.textContent =
            "0 pratos";

        return;
    }

    count.textContent =
        `${menu.pratos.length} pratos`;

    cardapio.innerHTML =
        menu.pratos.map(prato => `

        <div class="prato">

            <img
                src="${prato.imagem}"
                alt="${prato.nome}"
            >

            <div class="prato-info">

                <h3 class="prato-titulo">
                    ${prato.nome}
                </h3>

                <p class="prato-desc">
                    ${prato.descricao}
                </p>

                <p class="prato-meta">
                    Categoria:
                    ${prato.categoria}
                </p>

                <span class="tag">
                    Disponível
                </span>

                <div class="prato-preco">
                    R$ ${prato.preco.toFixed(2)}
                </div>

            </div>

        </div>

    `).join("");

});