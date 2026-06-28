'use strict';
/* ── pagamento.js ───────────────────────────────────────────────── */

const DELIVERY_FEE = 6.90;
let method = 'pix';

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth('login.html?next=pagamento.html')) return;
  applyNavSession();
  setupHamburger();

  const cartItems = Cart.get();
  if (!cartItems.length) {
    renderEmpty();
    return;
  }

  renderPage(cartItems);
  switchPane(method);
});

/* ── Carrinho vazio ─────────────────────────────────────────────── */
function renderEmpty() {
  document.getElementById('pageContent').innerHTML = `
    <div class="empty-pay">
      <div class="ico">🛒</div>
      <h2>Seu carrinho está vazio</h2>
      <p>Adicione pratos antes de finalizar o pedido.</p>
      <a class="btn primary" href="index.html">Explorar restaurantes</a>
    </div>`;
}

/* ── Página completa ────────────────────────────────────────────── */
function renderPage(cartItems) {
  const user = Auth.current();

  document.getElementById('pageContent').innerHTML = `
    <form class="pay-grid" id="payForm" novalidate>

      <!-- Coluna esquerda -->
      <div>

        <!-- Endereço -->
        <div class="pay-card">
          <h2>
            <span class="pay-card-ico">📍</span>
            Endereço de entrega
          </h2>
          <div class="address-box">
            <div id="addressInfo"></div>
            <a class="address-edit" href="perfil.html">Alterar</a>
          </div>
        </div>

        <!-- Pagamento -->
        <div class="pay-card">
          <h2>
            <span class="pay-card-ico">💳</span>
            Forma de pagamento
          </h2>

          <div class="methods" id="methods" role="group" aria-label="Escolha o método de pagamento">
            <button type="button" class="method active" data-method="pix">
              <div class="method-ico">⚡</div>
              <div class="method-label">PIX</div>
              <div class="method-check" aria-hidden="true">✓</div>
            </button>
            <button type="button" class="method" data-method="credito">
              <div class="method-ico">💳</div>
              <div class="method-label">Crédito</div>
              <div class="method-check" aria-hidden="true">✓</div>
            </button>
            <button type="button" class="method" data-method="debito">
              <div class="method-ico">🏦</div>
              <div class="method-label">Débito</div>
              <div class="method-check" aria-hidden="true">✓</div>
            </button>
            <button type="button" class="method" data-method="dinheiro">
              <div class="method-ico">💵</div>
              <div class="method-label">Na entrega</div>
              <div class="method-check" aria-hidden="true">✓</div>
            </button>
          </div>

          <!-- Painel PIX -->
          <div id="pane-pix" class="pane-pix">
            <div class="pix-qr" aria-label="QR Code PIX">
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect width="100" height="100" fill="#fff"/>
                <g fill="#0f1410">
                  <rect x="5"  y="5"  width="22" height="22"/>
                  <rect x="10" y="10" width="12" height="12" fill="#fff"/>
                  <rect x="13" y="13" width="6"  height="6"/>
                  <rect x="73" y="5"  width="22" height="22"/>
                  <rect x="78" y="10" width="12" height="12" fill="#fff"/>
                  <rect x="81" y="13" width="6"  height="6"/>
                  <rect x="5"  y="73" width="22" height="22"/>
                  <rect x="10" y="78" width="12" height="12" fill="#fff"/>
                  <rect x="13" y="81" width="6"  height="6"/>
                  <rect x="35" y="10" width="5" height="5"/>
                  <rect x="45" y="5"  width="5" height="10"/>
                  <rect x="55" y="10" width="5" height="5"/>
                  <rect x="62" y="5"  width="5" height="5"/>
                  <rect x="30" y="22" width="5" height="5"/>
                  <rect x="40" y="22" width="10" height="5"/>
                  <rect x="55" y="22" width="5" height="5"/>
                  <rect x="65" y="20" width="5" height="7"/>
                  <rect x="10" y="35" width="5" height="5"/>
                  <rect x="20" y="32" width="5" height="8"/>
                  <rect x="32" y="35" width="8" height="5"/>
                  <rect x="45" y="32" width="5" height="8"/>
                  <rect x="55" y="35" width="10" height="5"/>
                  <rect x="70" y="32" width="5" height="8"/>
                  <rect x="82" y="35" width="8" height="5"/>
                  <rect x="5"  y="45" width="5" height="10"/>
                  <rect x="15" y="48" width="10" height="5"/>
                  <rect x="30" y="45" width="5" height="10"/>
                  <rect x="42" y="48" width="8" height="5"/>
                  <rect x="55" y="45" width="5" height="10"/>
                  <rect x="65" y="48" width="10" height="5"/>
                  <rect x="80" y="45" width="5" height="10"/>
                  <rect x="12" y="60" width="8" height="5"/>
                  <rect x="25" y="58" width="5" height="8"/>
                  <rect x="35" y="60" width="10" height="5"/>
                  <rect x="50" y="58" width="5" height="8"/>
                  <rect x="60" y="60" width="8" height="5"/>
                  <rect x="75" y="58" width="5" height="8"/>
                  <rect x="85" y="60" width="5" height="5"/>
                  <rect x="35" y="73" width="5" height="5"/>
                  <rect x="45" y="75" width="8" height="5"/>
                  <rect x="58" y="73" width="5" height="8"/>
                  <rect x="68" y="78" width="5" height="5"/>
                  <rect x="80" y="73" width="5" height="8"/>
                  <rect x="38" y="85" width="8" height="5"/>
                  <rect x="50" y="88" width="5" height="5"/>
                  <rect x="60" y="85" width="5" height="8"/>
                  <rect x="72" y="88" width="8" height="5"/>
                  <rect x="85" y="85" width="5" height="5"/>
                </g>
              </svg>
            </div>
            <div class="pix-code" id="pixCode" aria-label="Código PIX copia e cola">
              00020126360014BR.GOV.BCB.PIX0114SAFEBITE-DEMO5204000053039865802BR5913SafeBite App6009Sao Paulo62070503***6304ABCD
            </div>
            <button type="button" class="copy-btn" id="btnCopyPix">📋 Copiar código PIX</button>
            <p class="pix-discount">🎉 5% de desconto ao pagar com PIX!</p>
          </div>

          <!-- Painel Cartão (crédito/débito) -->
          <div id="pane-card" class="pane-card" style="display:none">
            <div class="card-fields">
              <div class="field">
                <label>Número do cartão <span class="req">*</span></label>
                <input class="input" id="cardNumber" name="cardNumber"
                  placeholder="0000 0000 0000 0000" inputmode="numeric" maxlength="19" autocomplete="cc-number"/>
              </div>
              <div class="field">
                <label>Nome impresso <span class="req">*</span></label>
                <input class="input" id="cardName" name="cardName"
                  placeholder="Como aparece no cartão" autocomplete="cc-name"/>
              </div>
              <div class="row3c">
                <div class="field">
                  <label>Validade <span class="req">*</span></label>
                  <input class="input" id="cardExp" name="cardExp"
                    placeholder="MM/AA" inputmode="numeric" maxlength="5" autocomplete="cc-exp"/>
                </div>
                <div class="field">
                  <label>CVV <span class="req">*</span></label>
                  <input class="input" id="cardCvv" name="cardCvv"
                    placeholder="000" inputmode="numeric" maxlength="4" autocomplete="cc-csc"/>
                </div>
                <div class="field">
                  <label>Parcelas</label>
                  <select class="input" id="installments" name="installments"></select>
                </div>
              </div>
            </div>
          </div>

          <!-- Painel Dinheiro -->
          <div id="pane-cash" class="pane-cash" style="display:none">
            <p>Você pagará ao entregador na chegada. Se precisar de troco, informe o valor abaixo.</p>
            <div class="field" style="max-width:220px">
              <label>Troco para (R$)</label>
              <input class="input" id="changeFor" name="changeFor"
                type="number" min="0" step="0.01" placeholder="Ex: 100,00"/>
            </div>
          </div>
        </div>

        <!-- Observações -->
        <div class="pay-card">
          <h2><span class="pay-card-ico">📝</span> Observações</h2>
          <textarea class="input obs-area" id="notes" name="notes" rows="3"
            placeholder="Avise sobre alergias, ponto de referência, sem cebola..."></textarea>
        </div>

      </div><!-- /coluna esquerda -->

      <!-- Coluna direita: Resumo -->
      <aside class="pay-summary">
        <div class="pay-card">
          <h2><span class="pay-card-ico">🧾</span> Resumo do pedido</h2>
          <div id="summaryItems"></div>
          <div class="summary-totals">
            <div class="summary-line">
              <span>Subtotal</span>
              <span class="val" id="sumSubtotal">R$ 0,00</span>
            </div>
            <div class="summary-line">
              <span>Entrega</span>
              <span class="val" id="sumDelivery">${brl(DELIVERY_FEE)}</span>
            </div>
            <div class="summary-line" id="discountRow" style="display:none">
              <span>Desconto PIX (5%)</span>
              <span class="val val-discount" id="sumDiscount">— R$ 0,00</span>
            </div>
            <div class="summary-line final">
              <span>Total</span>
              <span class="val" id="sumTotal">R$ 0,00</span>
            </div>
          </div>
          <button type="submit" class="pay-btn" id="payBtn">
            <span id="payIcon">⚡</span>
            <span id="payText">Pagar com PIX</span>
          </button>
          <p class="pay-note">
            🔒 Pagamento simulado — demonstração didática.<br>
            Nenhum dado financeiro real é enviado.
          </p>
        </div>
      </aside>

    </form>`;

  // Preenche endereço
  renderAddress(user);

  // Preenche resumo de itens
  recalc(cartItems);

  // Listeners de método
  document.querySelectorAll('.method').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.method').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      method = btn.dataset.method;
      switchPane(method);
      recalc(cartItems);
    });
  });

  // Formatação automática do cartão
  setupCardFormatting();

  // Copiar PIX
  document.getElementById('btnCopyPix').addEventListener('click', copyPix);

  // Submit
  document.getElementById('payForm').addEventListener('submit', e => {
    e.preventDefault();
    handleSubmit(cartItems);
  });
}

/* ── Endereço ───────────────────────────────────────────────────── */
function renderAddress(user) {
  const el = document.getElementById('addressInfo');
  if (!el) return;

  // Tenta usar dados do perfil do usuário
  const hasAddress = user.street && user.street !== '—';
  if (hasAddress) {
    const addr = `${user.street}, ${user.number || 's/n'}${user.complement ? ' — ' + user.complement : ''}`;
    const city = `${user.neighborhood ? user.neighborhood + ', ' : ''}${user.city}/${user.state}${user.zip ? ' · CEP ' + user.zip : ''}`;
    el.innerHTML = `
      <p class="address-name">${esc(user.nome)}</p>
      <p class="address-meta">${esc(addr)}</p>
      <p class="address-meta">${esc(city)}</p>`;
  } else {
    el.innerHTML = `
      <p class="address-name">${esc(user.nome)}</p>
      <p class="address-meta" style="color:var(--text-faint)">
        Endereço não cadastrado.<br>
        <a href="perfil.html" style="color:var(--green-light)">Adicione no perfil</a> para exibir aqui.
      </p>`;
  }
}

/* ── Recalcula totais ───────────────────────────────────────────── */
function recalc(cartItems) {
  const dishes = Dishes.all();
  const rests  = Restaurants.all();
  let subtotal = 0;
  const itemsEl = document.getElementById('summaryItems');
  if (!itemsEl) return;

  itemsEl.innerHTML = cartItems.map(item => {
    const d = dishes.find(x => x.id === item.dishId);
    if (!d) return '';
    const rest    = rests.find(r => r.id === d.restaurantId);
    const lineVal = d.price * item.qty;
    subtotal += lineVal;
    return `
      <div class="summary-item">
        <div style="min-width:0">
          <p class="summary-item-name">${esc(d.name)}</p>
          <p class="summary-item-rest">${esc(rest?.name || '')}</p>
          <p class="summary-item-qty">Qtd ${item.qty} · ${brl(d.price)} cada</p>
        </div>
        <span class="summary-item-price">${brl(lineVal)}</span>
      </div>`;
  }).join('');

  const discount    = method === 'pix' ? subtotal * 0.05 : 0;
  const total       = subtotal + DELIVERY_FEE - discount;
  const discountRow = document.getElementById('discountRow');

  document.getElementById('sumSubtotal').textContent = brl(subtotal);
  document.getElementById('sumTotal').textContent    = brl(total);
  if (discountRow) discountRow.style.display         = discount > 0 ? '' : 'none';
  const sumDiscount = document.getElementById('sumDiscount');
  if (sumDiscount) sumDiscount.textContent           = '— ' + brl(discount);

  // Parcelas (cartão crédito)
  if (method === 'credito') renderInstallments(total);

  return { subtotal, discount, total };
}

/* ── Parcelas ───────────────────────────────────────────────────── */
function renderInstallments(total) {
  const sel = document.getElementById('installments');
  if (!sel) return;
  sel.innerHTML = '';
  for (let i = 1; i <= 6; i++) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.style.background = '#161c18';
    opt.textContent = `${i}x de ${brl(total / i)}${i === 1 ? ' (à vista)' : ''}`;
    sel.appendChild(opt);
  }
}

/* ── Troca painel de pagamento ──────────────────────────────────── */
function switchPane(m) {
  document.getElementById('pane-pix').style.display  = m === 'pix'     ? '' : 'none';
  document.getElementById('pane-card').style.display = (m === 'credito' || m === 'debito') ? '' : 'none';
  document.getElementById('pane-cash').style.display = m === 'dinheiro' ? '' : 'none';

  const LABELS = {
    pix:      { icon: '⚡', text: 'Pagar com PIX'       },
    credito:  { icon: '💳', text: 'Pagar com crédito'   },
    debito:   { icon: '🏦', text: 'Pagar com débito'    },
    dinheiro: { icon: '💵', text: 'Pagar na entrega'    },
  };
  const l = LABELS[m];
  document.getElementById('payIcon').textContent = l.icon;
  document.getElementById('payText').textContent = l.text;
}

/* ── Copiar PIX ─────────────────────────────────────────────────── */
async function copyPix() {
  const code = document.getElementById('pixCode').textContent.trim();
  try { await navigator.clipboard.writeText(code); } catch (_) {}
  const btn = document.getElementById('btnCopyPix');
  const old = btn.textContent;
  btn.textContent = '✓ Código copiado!';
  setTimeout(() => { btn.textContent = old; }, 2000);
}

/* ── Formatação do número do cartão ────────────────────────────── */
function setupCardFormatting() {
  const num = document.getElementById('cardNumber');
  const exp = document.getElementById('cardExp');
  if (!num || !exp) return;

  num.addEventListener('input', () => {
    let v = num.value.replace(/\D/g, '').slice(0, 16);
    num.value = v.replace(/(.{4})/g, '$1 ').trim();
  });

  exp.addEventListener('input', () => {
    let v = exp.value.replace(/\D/g, '').slice(0, 4);
    if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
    exp.value = v;
  });
}

/* ── Submit / Confirmar pagamento ───────────────────────────────── */
function handleSubmit(cartItems) {
  const user = Auth.current();
  if (!user) {
    location.href = 'login.html?next=pagamento.html';
    return;
  }

  // Validação: cartão
  if (method === 'credito' || method === 'debito') {
    const num  = document.getElementById('cardNumber')?.value.replace(/\s/g, '');
    const name = document.getElementById('cardName')?.value.trim();
    const exp  = document.getElementById('cardExp')?.value.trim();
    const cvv  = document.getElementById('cardCvv')?.value.trim();

    if (!num || num.length < 13) {
      showToast('Número do cartão inválido.', 'err'); return;
    }
    if (!name) {
      showToast('Informe o nome impresso no cartão.', 'err'); return;
    }
    if (!exp || exp.length < 5) {
      showToast('Data de validade inválida.', 'err'); return;
    }
    if (!cvv || cvv.length < 3) {
      showToast('CVV inválido.', 'err'); return;
    }
  }

  // Calcula totais
  const dishes   = Dishes.all();
  let subtotal   = 0;
  cartItems.forEach(item => {
    const d = dishes.find(x => x.id === item.dishId);
    if (d) subtotal += d.price * item.qty;
  });
  const discount = method === 'pix' ? subtotal * 0.05 : 0;
  const total    = subtotal + DELIVERY_FEE - discount;

  // Registra vendas no localStorage (compatível com painel admin)
  const sales  = JSON.parse(localStorage.getItem('sb_sales') || '[]');
  const orderId = 'ord-' + Date.now();

  cartItems.forEach(item => {
    const d = dishes.find(x => x.id === item.dishId);
    if (!d) return;
    sales.unshift({
      id:            orderId + '-' + item.dishId,
      orderId,
      userId:        user.id,
      userName:      user.nome,
      dishId:        item.dishId,
      dishName:      d.name,
      qty:           item.qty,
      unitPrice:     d.price,
      lineTotal:     d.price * item.qty,
      paymentMethod: method,
      paid:          method !== 'dinheiro',
      discount:      discount,
      deliveryFee:   DELIVERY_FEE,
      orderTotal:    total,
      notes:         document.getElementById('notes')?.value.trim() || '',
      date:          new Date().toISOString(),
    });
  });
  localStorage.setItem('sb_sales', JSON.stringify(sales));

  // Limpa carrinho
  Cart.clear();
  updateCartBadge();

  // Exibe modal de sucesso
  const METHOD_NAMES = {
    pix:      '⚡ PIX (5% desconto)',
    credito:  '💳 Cartão de crédito',
    debito:   '🏦 Cartão de débito',
    dinheiro: '💵 Dinheiro na entrega',
  };
  document.getElementById('successTotal').textContent =
    `Total: ${brl(total)}`;
  document.getElementById('successMethod').textContent =
    METHOD_NAMES[method];
  document.getElementById('successModal').classList.add('open');
}

/* ── Hamburger ──────────────────────────────────────────────────── */
function setupHamburger() {
  const btn   = document.getElementById('hamburger');
  const links = document.getElementById('navLinks');
  if (btn && links) btn.onclick = () => links.classList.toggle('open');
}
