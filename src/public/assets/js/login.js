'use strict';
/* ── login.js ───────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  // Se já logado, redireciona
  if (Auth.current()) {
    location.href = new URLSearchParams(location.search).get('next') || 'index.html';
    return;
  }

  document.getElementById('loginForm').addEventListener('submit', e => {
    e.preventDefault();
    const login = document.getElementById('loginField').value.trim();
    const senha = document.getElementById('senhaField').value;
    const msg   = document.getElementById('loginMsg');

    if (!login || !senha) {
      msg.className = 'msg err'; msg.textContent = 'Preencha login e senha.'; msg.style.display = '';
      return;
    }

    const result = Auth.login(login, senha);
    if (!result.ok) {
      msg.className = 'msg err'; msg.textContent = result.error; msg.style.display = '';
      return;
    }

    const next = new URLSearchParams(location.search).get('next') || 'index.html';
    location.href = next;
  });
});
