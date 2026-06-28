'use strict';
/* ── cadastro-usuario.js ────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  if (Auth.current()) { location.href = 'index.html'; return; }

  document.getElementById('regForm').addEventListener('submit', e => {
    e.preventDefault();
    const msg   = document.getElementById('regMsg');
    const nome  = document.getElementById('regNome').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const login = document.getElementById('regLogin').value.trim();
    const senha = document.getElementById('regSenha').value;

    if (!nome || !email || !login || !senha) {
      msg.className = 'msg err'; msg.textContent = 'Preencha todos os campos obrigatórios.'; msg.style.display = '';
      return;
    }
    if (senha.length < 3) {
      msg.className = 'msg err'; msg.textContent = 'Senha deve ter no mínimo 3 caracteres.'; msg.style.display = '';
      return;
    }

    const result = Auth.register({ nome, email, login, senha });
    if (!result.ok) {
      msg.className = 'msg err'; msg.textContent = result.error; msg.style.display = '';
      return;
    }

    msg.className = 'msg ok';
    msg.textContent = 'Conta criada com sucesso! Redirecionando…';
    msg.style.display = '';
    setTimeout(() => location.href = 'login.html', 1500);
  });
});
