
const DATA = {
  hero: {
    title: "Coma com segurança, descubra com",
    titleAccent: "confiança.",
    lead:
      "SafeBite reúne restaurantes parceiros que respeitam restrições alimentares. Filtre por dieta, alergia ou preferência e encontre exatamente o que você pode comer."
  },

  stats: [
    { value: "12+", label: "Tipos de restrição" },
    { value: "3", label: "Restaurantes parceiros" },
    { value: "4", label: "Pratos curados" },
    { value: "100%", label: "Informação clara" }
  ],

  categories: [
    { id: "vegano",        name: "Vegano",        icon: "🌱" },
    { id: "vegetariano",   name: "Vegetariano",   icon: "🥗" },
    { id: "sem-gluten",    name: "Sem glúten",    icon: "🌾" },
    { id: "sem-lactose",   name: "Sem lactose",   icon: "🥛" },
    { id: "kosher",        name: "Kosher",        icon: "✡️" },
    { id: "halal",         name: "Halal",         icon: "☪️" },
    { id: "organico",      name: "Orgânico",      icon: "🍃" },
    { id: "diabetico",     name: "Diabético",     icon: "💧" }
  ],

  how: [
    {
      step: 1,
      title: "Defina suas restrições",
      text:
        "No seu perfil, marque alergias, dietas e preferências para receber sugestões personalizadas."
    },
    {
      step: 2,
      title: "Explore o cardápio",
      text:
        "Pesquise por nome, preço ou tipo de cozinha — todos os pratos exibem suas restrições atendidas."
    },
    {
      step: 3,
      title: "Veja os alergênicos",
      text:
        "Cada prato lista alergênicos e observações importantes do estabelecimento."
    },
    {
      step: 4,
      title: "Peça com confiança",
      text:
        "Acompanhe o pedido em tempo real e confirme que sua refeição é compatível."
    }
  ],

  legal: {
    copyright: "© 2026 SafeBite. Todos os direitos reservados.",

    terms: {
      title: "Termos de uso",
      content: [
        {
          h: "1. Aceitação",
          p:
            "Ao acessar o SafeBite, você concorda com estes termos. Esta é uma plataforma educacional e demonstrativa, sem fins comerciais."
        },
        {
          h: "2. Uso permitido",
          p:
            "Você pode navegar livremente, cadastrar dados fictícios e interagir com as funcionalidades. Não utilize dados reais sensíveis."
        },
        {
          h: "3. Informações alimentares",
          p:
            "As restrições e alergênicos exibidos são de responsabilidade dos estabelecimentos cadastrados. Sempre confirme diretamente com o restaurante antes de consumir, especialmente em casos de alergia grave."
        },
        {
          h: "4. Propriedade intelectual",
          p:
            "A marca, o layout e o código deste projeto pertencem aos seus autores. O conteúdo demonstrativo pode ser reutilizado para fins educacionais com atribuição."
        },
        {
          h: "5. Limitação de responsabilidade",
          p:
            "O SafeBite não se responsabiliza por reações alérgicas, prejuízos ou divergências entre o que é exibido e o que é servido."
        }
      ]
    },

    privacy: {
      title: "Política de privacidade",
      content: [
        {
          h: "Dados coletados",
          p:
            "Esta versão demonstrativa armazena dados apenas no navegador do usuário (localStorage). Nada é enviado para servidores externos."
        },
        {
          h: "Cookies",
          p:
            "Não utilizamos cookies de rastreamento. Toda persistência é local e pode ser apagada limpando o armazenamento do navegador."
        },
        {
          h: "Compartilhamento",
          p:
            "Não compartilhamos dados com terceiros. Como tudo é armazenado localmente, você controla 100% das informações."
        },
        {
          h: "Seus direitos",
          p:
            "Você pode apagar todos os dados a qualquer momento limpando o localStorage nas configurações do navegador."
        }
      ]
    },

    cookies: {
      title: "Política de cookies",
      content: [
        {
          h: "O que usamos",
          p:
            "Esta plataforma demonstrativa não utiliza cookies de rastreamento, analytics ou publicidade."
        },
        {
          h: "Armazenamento local",
          p:
            "Usamos apenas localStorage para guardar seu cadastro e preferências no próprio navegador. Esses dados não saem do seu dispositivo."
        },
        {
          h: "Como remover",
          p:
            "Acesse as configurações do navegador → Privacidade → Limpar dados de navegação para apagar todas as informações armazenadas."
        }
      ]
    }
  }
};

// ============================================================
// CHAVES DO LOCALSTORAGE
// ============================================================

const RKEY = "safebite_restaurants";
const DKEY = "safebite_dishes";
const CART = "safebite_cart";

// ============================================================
// DADOS INICIAIS (SEED)
// ============================================================

const SEED_R = [
  {
    id: "rt1",
    name: "Verde Vivo",
    cuisine: "Vegano contemporâneo",
    city: "São Paulo",
    state: "SP",
    restrictions: ["vegano", "sem-lactose", "sem-gluten"]
  },
  {
    id: "rt2",
    name: "Trigo Livre",
    cuisine: "Italiana sem glúten",
    city: "Rio de Janeiro",
    state: "RJ",
    restrictions: ["sem-gluten", "vegetariano"]
  },
  {
    id: "rt3",
    name: "Sabor Kosher",
    cuisine: "Mediterrânea kosher",
    city: "Curitiba",
    state: "PR",
    restrictions: ["kosher", "sem-lactose"]
  }
];

const SEED_D = [
  {
    id: "d1",
    name: "Lasanha de Berinjela",
    description: "Camadas de berinjela grelhada com molho caseiro.",
    price: 42.9,
    restaurantId: "rt1",
    restrictions: ["sem-gluten", "vegetariano"],
    allergens: ""
  },
  {
    id: "d2",
    name: "Pizza Margherita SG",
    description: "Massa 100% sem glúten com mussarela de búfala.",
    price: 58.0,
    restaurantId: "rt2",
    restrictions: ["sem-gluten", "vegetariano"],
    allergens: "Contém lactose"
  },
  {
    id: "d3",
    name: "Bowl Mediterrâneo",
    description: "Grão-de-bico assado, hummus e tabule.",
    price: 46.5,
    restaurantId: "rt3",
    restrictions: ["kosher", "vegetariano", "sem-lactose"],
    allergens: ""
  },
  {
    id: "d4",
    name: "Salada do Verde",
    description: "Mix de folhas orgânicas e abacate.",
    price: 32.0,
    restaurantId: "rt1",
    restrictions: ["vegano", "sem-gluten", "organico"],
    allergens: ""
  }
];