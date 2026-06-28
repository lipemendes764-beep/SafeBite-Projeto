/**
 * SafeBite — Core: dados, autenticação e helpers
 * Centraliza LocalStorage, SessionStorage, seeds e utilitários.
 */
'use strict';

/* ── Chaves de storage ─────────────────────────────────────────── */
const KEYS = {
  users:       'sb_users',
  restaurants: 'sb_restaurants',
  dishes:      'sb_dishes',
  favorites:   'sb_favorites',
  cart:        'sb_cart',
  session:     'sb_session',          // sessionStorage
};

/* ── Dados iniciais (seeds) ────────────────────────────────────── */
const SEEDS = {
  users: [
    {
      id: 'u-admin',
      login: 'admin',
      senha: '123',
      nome: 'Administrador SafeBite',
      email: 'admin@safebite.app',
      admin: true,
      avatar: '',
      bio: 'Gerenciador da plataforma SafeBite.',
      curso: 'Sistemas de Informação',
      turma: '2025/1',
      redes: { instagram: '@safebite', linkedin: 'safebite' }
    },
    {
      id: 'u-user',
      login: 'user',
      senha: '123',
      nome: 'Maria Clara',
      email: 'maria@email.com',
      admin: false,
      avatar: '',
      bio: 'Apaixonada por comida saudável.',
      curso: '',
      turma: '',
      redes: {}
    }
  ],
  restaurants: [
    {
      id: 'rt1',
      name: 'Verde Vivo',
      lat: -23.5630, lng: -46.6543, address: 'Rua Augusta, 1200 — Consolação, São Paulo/SP',
      cuisine: 'Vegano contemporâneo',
      description: 'O Verde Vivo é o refúgio perfeito para quem busca uma alimentação 100% vegetal sem abrir mão do sabor. Nossos chefs criam experiências gastronômicas únicas com ingredientes orgânicos selecionados.',
      city: 'São Paulo', state: 'SP',
      phone: '(11) 99999-1234',
      rating: 4.8, reviewCount: 312,
      priceRange: '$$',
      deliveryTime: '30–45 min',
      minOrder: 25,
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
      banner: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&q=80',
      restrictions: ['vegano', 'sem-lactose', 'sem-gluten'],
      featured: true,
      open: true
    },
    {
      id: 'rt2',
      name: 'Trigo Livre',
      lat: -22.9068, lng: -43.1729, address: 'Rua Visconde de Pirajá, 414 — Ipanema, Rio de Janeiro/RJ',
      cuisine: 'Italiana sem glúten',
      description: 'Especializada em culinária italiana autêntica adaptada para pessoas com intolerância ao glúten. Massas frescas, pizzas e risottos feitos com amor e sem glúten.',
      city: 'Rio de Janeiro', state: 'RJ',
      phone: '(21) 98888-5678',
      rating: 4.6, reviewCount: 198,
      priceRange: '$$$',
      deliveryTime: '40–55 min',
      minOrder: 35,
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80',
      banner: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80',
      restrictions: ['sem-gluten', 'vegetariano'],
      featured: true,
      open: true
    },
    {
      id: 'rt3',
      name: 'Sabor Kosher',
      lat: -25.4290, lng: -49.2713, address: 'Rua XV de Novembro, 700 — Centro, Curitiba/PR',
      cuisine: 'Mediterrânea kosher',
      description: 'Tradição e sabor da culinária mediterrânea com certificação kosher. Pratos que respeitam a cultura e trazem o melhor da gastronomia do Mediterrâneo para sua mesa.',
      city: 'Curitiba', state: 'PR',
      phone: '(41) 97777-9090',
      rating: 4.7, reviewCount: 156,
      priceRange: '$$$',
      deliveryTime: '35–50 min',
      minOrder: 40,
      image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80',
      banner: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80',
      restrictions: ['kosher', 'sem-lactose'],
      featured: true,
      open: true
    },
    {
      id: 'rt4',
      name: 'NaturalFit',
      lat: -19.9167, lng: -43.9345, address: 'Av. Afonso Pena, 1500 — Centro, Belo Horizonte/MG',
      cuisine: 'Fit & Low Carb',
      description: 'Cardápio focado em saúde e performance. Pratos nutritivos, low carb e fitness para quem cuida do corpo sem perder o prazer à mesa.',
      city: 'Belo Horizonte', state: 'MG',
      phone: '(31) 96666-4321',
      rating: 4.5, reviewCount: 89,
      priceRange: '$$',
      deliveryTime: '25–40 min',
      minOrder: 30,
      image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80',
      banner: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1200&q=80',
      restrictions: ['sem-gluten', 'diabetico', 'organico'],
      featured: false,
      open: true
    },
    {
      id: 'rt5',
      name: 'Halal Grill',
      lat: -23.5489, lng: -46.6388, address: 'Av. Paulista, 900 — Bela Vista, São Paulo/SP',
      cuisine: 'Árabe & Grelhados',
      description: 'Autêntica culinária árabe com certificação halal. Grelhados, esfihas, kibes e muito mais, preparados com os temperos tradicionais do Oriente Médio.',
      city: 'São Paulo', state: 'SP',
      phone: '(11) 95555-7890',
      rating: 4.9, reviewCount: 445,
      priceRange: '$$',
      deliveryTime: '30–45 min',
      minOrder: 20,
      image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&q=80',
      banner: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&q=80',
      restrictions: ['halal', 'sem-lactose'],
      featured: true,
      open: false
    }
  ],
  dishes: [
    // Verde Vivo
    { id: 'd1', restaurantId: 'rt1', name: 'Lasanha de Berinjela', category: 'Pratos Principais',
      description: 'Camadas de berinjela grelhada com molho de tomate artesanal e manjericão fresco, gratinada com queijo de caju.',
      price: 42.90, image: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=600&q=80',
      restrictions: ['vegano', 'sem-gluten', 'sem-lactose'], allergens: 'Pode conter castanhas.', calories: 380, featured: true },
    { id: 'd2', restaurantId: 'rt1', name: 'Salada do Verde', category: 'Entradas',
      description: 'Mix de folhas orgânicas, abacate, sementes de girassol e molho de limão siciliano.',
      price: 32.00, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
      restrictions: ['vegano', 'sem-gluten', 'sem-lactose', 'organico'], allergens: '', calories: 210, featured: true },
    { id: 'd3', restaurantId: 'rt1', name: 'Açaí Power Bowl', category: 'Sobremesas',
      description: 'Açaí cremoso com granola sem glúten, banana, morango e mel de abelha nativa.',
      price: 28.50, image: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=600&q=80',
      restrictions: ['vegano', 'sem-gluten', 'sem-lactose'], allergens: '', calories: 290, featured: false },
    { id: 'd4', restaurantId: 'rt1', name: 'Suco Detox Verde', category: 'Bebidas',
      description: 'Couve, pepino, gengibre, limão e hortelã. Refrescante e nutritivo.',
      price: 16.00, image: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=600&q=80',
      restrictions: ['vegano', 'sem-gluten', 'sem-lactose', 'organico'], allergens: '', calories: 80, featured: false },
    // Trigo Livre
    { id: 'd5', restaurantId: 'rt2', name: 'Pizza Margherita SG', category: 'Pratos Principais',
      description: 'Massa 100% sem glúten com mussarela de búfala, tomate San Marzano e azeite extra virgem.',
      price: 58.00, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80',
      restrictions: ['sem-gluten', 'vegetariano'], allergens: 'Contém lactose.', calories: 520, featured: true },
    { id: 'd6', restaurantId: 'rt2', name: 'Fettuccine ao Funghi', category: 'Pratos Principais',
      description: 'Massa fresca de arroz ao molho de cogumelos selvagens com trufa negra e parmesão.',
      price: 64.90, image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&q=80',
      restrictions: ['sem-gluten', 'vegetariano'], allergens: 'Contém lactose e ovos.', calories: 610, featured: true },
    { id: 'd7', restaurantId: 'rt2', name: 'Tiramisu SG', category: 'Sobremesas',
      description: 'Clássico italiano releitura sem glúten com biscoito de amêndoas, mascarpone e café espresso.',
      price: 22.00, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&q=80',
      restrictions: ['sem-gluten', 'vegetariano'], allergens: 'Contém lactose e ovos.', calories: 340, featured: false },
    // Sabor Kosher
    { id: 'd8', restaurantId: 'rt3', name: 'Bowl Mediterrâneo', category: 'Pratos Principais',
      description: 'Grão-de-bico assado, hummus cremoso, tabule de quinoa, azeitonas e pão pita kosher.',
      price: 46.50, image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80',
      restrictions: ['kosher', 'vegetariano', 'sem-lactose'], allergens: 'Contém gergelim.', calories: 450, featured: true },
    { id: 'd9', restaurantId: 'rt3', name: 'Salmão Grelhado', category: 'Pratos Principais',
      description: 'Filé de salmão certificado kosher grelhado com ervas finas, limão e aspargos.',
      price: 72.00, image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&q=80',
      restrictions: ['kosher', 'sem-gluten', 'sem-lactose'], allergens: 'Contém peixe.', calories: 390, featured: true },
    // NaturalFit
    { id: 'd10', restaurantId: 'rt4', name: 'Frango Fit Grelhado', category: 'Pratos Principais',
      description: 'Peito de frango orgânico grelhado com batata doce, brócolis e vinagrete fit.',
      price: 38.00, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80',
      restrictions: ['sem-gluten', 'sem-lactose', 'organico'], allergens: '', calories: 320, featured: true },
    { id: 'd11', restaurantId: 'rt4', name: 'Bowl Proteico', category: 'Pratos Principais',
      description: 'Atum, ovos, quinoa, espinafre, cenoura e molho de iogurte grego com ervas.',
      price: 42.00, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
      restrictions: ['sem-gluten', 'diabetico'], allergens: 'Contém peixe, ovos e lactose.', calories: 410, featured: false },
    // Halal Grill
    { id: 'd12', restaurantId: 'rt5', name: 'Kafta na Brasa', category: 'Pratos Principais',
      description: 'Espetos de kafta temperados com especiarias árabes, servidos com arroz, homus e pão sírio.',
      price: 44.00, image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&q=80',
      restrictions: ['halal', 'sem-lactose'], allergens: 'Contém glúten (pão sírio).', calories: 580, featured: true },
    { id: 'd13', restaurantId: 'rt5', name: 'Esfiha Aberta Halal', category: 'Entradas',
      description: 'Esfiha aberta de carne bovina moída temperada com pimentão, cebola e especiarias, assada na pedra.',
      price: 12.00, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80',
      restrictions: ['halal'], allergens: 'Contém glúten e ovos.', calories: 220, featured: true },
  ],
  favorites: {},   // { userId: [dishId, ...] }
  cart: []
};

/* ── Storage helpers ───────────────────────────────────────────── */
function lsGet(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
}
function lsSet(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}
function ssGet(key) {
  try { return JSON.parse(sessionStorage.getItem(key)); } catch { return null; }
}
function ssSet(key, val) {
  sessionStorage.setItem(key, JSON.stringify(val));
}
function ssRemove(key) {
  sessionStorage.removeItem(key);
}

/* ── Seed automático na primeira visita ────────────────────────── */
function initSeeds() {
  if (!lsGet(KEYS.users))       lsSet(KEYS.users,       SEEDS.users);
  if (!lsGet(KEYS.restaurants)) lsSet(KEYS.restaurants, SEEDS.restaurants);
  if (!lsGet(KEYS.dishes))      lsSet(KEYS.dishes,      SEEDS.dishes);
  if (!lsGet(KEYS.favorites))   lsSet(KEYS.favorites,   SEEDS.favorites);
  if (!lsGet(KEYS.cart))        lsSet(KEYS.cart,         SEEDS.cart);
}
initSeeds();

/* ── Auth API ──────────────────────────────────────────────────── */
const Auth = {
  /** Retorna o usuário logado (sessionStorage) ou null */
  current() {
    return ssGet(KEYS.session);
  },
  /** Tenta logar; retorna { ok, user, error } */
  login(loginVal, senha) {
    const users = lsGet(KEYS.users) || [];
    const user = users.find(u => u.login === loginVal && u.senha === senha);
    if (!user) return { ok: false, error: 'Login ou senha incorretos.' };
    ssSet(KEYS.session, user);
    return { ok: true, user };
  },
  logout() {
    ssRemove(KEYS.session);
  },
  /** Cadastra novo usuário */
  register(data) {
    const users = lsGet(KEYS.users) || [];
    if (users.find(u => u.login === data.login))
      return { ok: false, error: 'Login já está em uso.' };
    if (users.find(u => u.email === data.email))
      return { ok: false, error: 'E-mail já cadastrado.' };
    const user = {
      id:    'u-' + Date.now(),
      login: data.login,
      senha: data.senha,
      nome:  data.nome,
      email: data.email,
      admin: false,
      avatar: '', bio: '', curso: '', turma: '', redes: {},
      restrictions:   [],   // restrições alimentares do perfil
      favRestaurants: []    // IDs de restaurantes favoritos
    };
    users.push(user);
    lsSet(KEYS.users, users);
    return { ok: true, user };
  },
  /** Atualiza campos do usuário logado no localStorage e sessionStorage */
  updateCurrent(fields) {
    const users   = lsGet(KEYS.users) || [];
    const current = this.current();
    if (!current) return false;
    const idx = users.findIndex(u => u.id === current.id);
    if (idx < 0) return false;
    users[idx] = { ...users[idx], ...fields };
    lsSet(KEYS.users, users);
    ssSet(KEYS.session, users[idx]);
    return users[idx];
  },
  isAdmin() {
    return !!this.current()?.admin;
  }
};

/* ── Restaurants API ───────────────────────────────────────────── */
const Restaurants = {
  all()       { return lsGet(KEYS.restaurants) || []; },
  save(list)  { lsSet(KEYS.restaurants, list); },
  byId(id)    { return this.all().find(r => r.id === id) || null; },
  featured()  { return this.all().filter(r => r.featured); },
  create(data) {
    const list = this.all();
    const item = { ...data, id: 'rt-' + Date.now() };
    list.push(item);
    this.save(list);
    return item;
  },
  update(id, data) {
    const list = this.all();
    const idx  = list.findIndex(r => r.id === id);
    if (idx < 0) return false;
    list[idx] = { ...list[idx], ...data };
    this.save(list);
    return true;
  },
  remove(id) {
    this.save(this.all().filter(r => r.id !== id));
    // remove pratos associados
    Dishes.save(Dishes.all().filter(d => d.restaurantId !== id));
  }
};

/* ── Dishes API ────────────────────────────────────────────────── */
const Dishes = {
  all()            { return lsGet(KEYS.dishes) || []; },
  save(list)       { lsSet(KEYS.dishes, list); },
  byId(id)         { return this.all().find(d => d.id === id) || null; },
  byRestaurant(rid){ return this.all().filter(d => d.restaurantId === rid); },
  featured()       { return this.all().filter(d => d.featured); },
  create(data) {
    const list = this.all();
    const item = { ...data, id: 'd-' + Date.now() };
    list.push(item);
    this.save(list);
    return item;
  },
  update(id, data) {
    const list = this.all();
    const idx  = list.findIndex(d => d.id === id);
    if (idx < 0) return false;
    list[idx] = { ...list[idx], ...data };
    this.save(list);
    return true;
  },
  remove(id) {
    this.save(this.all().filter(d => d.id !== id));
  }
};

/* ── Favorites API ─────────────────────────────────────────────── */
const Favorites = {
  _map() { return lsGet(KEYS.favorites) || {}; },
  _save(m){ lsSet(KEYS.favorites, m); },
  ofUser(uid) {
    return this._map()[uid] || [];
  },
  toggle(uid, dishId) {
    const m = this._map();
    m[uid] = m[uid] || [];
    const idx = m[uid].indexOf(dishId);
    if (idx >= 0) m[uid].splice(idx, 1);
    else m[uid].push(dishId);
    this._save(m);
    return idx < 0; // true = agora é favorito
  },
  isFav(uid, dishId) {
    return this.ofUser(uid).includes(dishId);
  }
};

/* ── Cart API ──────────────────────────────────────────────────── */
const Cart = {
  get()        { return lsGet(KEYS.cart) || []; },
  save(list)   { lsSet(KEYS.cart, list); },
  count()      { return this.get().reduce((s, i) => s + i.qty, 0); },
  add(dishId, qty = 1) {
    const c = this.get();
    const i = c.find(x => x.dishId === dishId);
    if (i) i.qty += qty; else c.push({ dishId, qty });
    this.save(c);
  },
  remove(dishId) { this.save(this.get().filter(x => x.dishId !== dishId)); },
  setQty(dishId, qty) {
    const c = this.get();
    if (qty <= 0) return this.remove(dishId);
    const i = c.find(x => x.dishId === dishId);
    if (i) i.qty = qty; else c.push({ dishId, qty });
    this.save(c);
  },
  clear() { this.save([]); }
};

/* ── Utilidades gerais ─────────────────────────────────────────── */
function esc(s) {
  return String(s || '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function brl(n) {
  return 'R$ ' + Number(n || 0).toFixed(2).replace('.', ',');
}

function stars(n) {
  const full = Math.floor(n);
  const half = n - full >= 0.5;
  let s = '★'.repeat(full);
  if (half) s += '½';
  return s;
}

function normalize(str) {
  return String(str || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function genId() { return 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7); }

/* ── Navbar helper — injeta barra de nav em qualquer página ────── */
const RESTRICTIONS_MAP = [
  ['vegano', 'Vegano', '🌱'],
  ['vegetariano', 'Vegetariano', '🥗'],
  ['sem-gluten', 'Sem glúten', '🌾'],
  ['sem-lactose', 'Sem lactose', '🥛'],
  ['sem-amendoim', 'Sem amendoim', '🥜'],
  ['sem-frutos-do-mar', 'Sem frutos do mar', '🦐'],
  ['sem-ovo', 'Sem ovo', '🥚'],
  ['sem-soja', 'Sem soja', '🫘'],
  ['kosher', 'Kosher', '✡'],
  ['halal', 'Halal', '☪'],
  ['organico', 'Orgânico', '🍃'],
  ['diabetico', 'Diabético', '💧'],
];

function restrictionLabel(id) {
  const r = RESTRICTIONS_MAP.find(([k]) => k === id);
  return r ? r[1] : id;
}

/** Atualiza o contador do carrinho na navbar */
function updateCartBadge() {
  const el = document.getElementById('navCartCount');
  if (el) {
    const n = Cart.count();
    el.textContent = n;
    el.style.display = n > 0 ? 'grid' : 'none';
  }
}

/** Ajusta nav de acordo com sessão */
function applyNavSession() {
  const user = Auth.current();
  const menuFav    = document.getElementById('navFavoritos');
  const menuAdmin  = document.getElementById('navAdmin');
  const menuLogin  = document.getElementById('navLogin');
  const menuLogout = document.getElementById('navLogout');
  const menuUser   = document.getElementById('navUser');

  const menuPerfil = document.getElementById('navPerfil');

  if (user) {
    if (menuFav)    menuFav.style.display    = '';
    if (menuPerfil) menuPerfil.style.display = '';
    if (menuAdmin)  menuAdmin.style.display  = user.admin ? '' : 'none';
    if (menuLogin)  menuLogin.style.display  = 'none';
    if (menuLogout) menuLogout.style.display = '';
    if (menuUser)   menuUser.textContent     = user.nome.split(' ')[0];
  } else {
    if (menuFav)    menuFav.style.display    = 'none';
    if (menuPerfil) menuPerfil.style.display = 'none';
    if (menuAdmin)  menuAdmin.style.display  = 'none';
    if (menuLogin)  menuLogin.style.display  = '';
    if (menuLogout) menuLogout.style.display = 'none';
  }

  // logout handler
  if (menuLogout) {
    menuLogout.addEventListener('click', e => {
      e.preventDefault();
      Auth.logout();
      window.location.href = 'index.html';
    });
  }

  updateCartBadge();
}

/** Redireciona para login se não autenticado */
function requireAuth(redirect = 'login.html') {
  if (!Auth.current()) {
    window.location.href = redirect;
    return false;
  }
  return true;
}

/** Redireciona para home se não for admin */
function requireAdmin() {
  if (!Auth.isAdmin()) {
    window.location.href = 'index.html';
    return false;
  }
  return true;
}

/** Toast global */
function showToast(msg, type = 'ok') {
  let t = document.getElementById('globalToast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'globalToast';
    t.style.cssText = 'position:fixed;bottom:1.5rem;right:1.5rem;z-index:9999;padding:.75rem 1.25rem;border-radius:.6rem;font-size:.9rem;opacity:0;pointer-events:none;transition:opacity .2s,transform .2s;transform:translateY(.5rem)';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.background = type === 'ok'
    ? 'rgba(16,185,129,.15)' : 'rgba(244,63,94,.15)';
  t.style.border = `1px solid ${type === 'ok' ? 'rgba(16,185,129,.3)' : 'rgba(244,63,94,.3)'}`;
  t.style.color = type === 'ok' ? '#6ee7b7' : '#fda4af';
  t.style.opacity = '1';
  t.style.transform = 'translateY(0)';
  clearTimeout(t._to);
  t._to = setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateY(.5rem)';
  }, 2500);
}
