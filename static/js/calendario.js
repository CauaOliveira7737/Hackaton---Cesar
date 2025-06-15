let atividades = [];

function mostrarFormulario() {
  const f = document.getElementById('formulario');
  f.style.display = f.style.display === 'none' ? 'block' : 'none';
}

function mostrarMensagem(texto, sucesso = true) {
  const msg = document.getElementById('mensagem-feedback');
  msg.innerText = texto;
  msg.style.display = 'block';
  msg.style.background = sucesso ? '#d1fae5' : '#fee2e2';
  msg.style.color = sucesso ? '#065f46' : '#991b1b';
  setTimeout(() => {
    msg.style.display = 'none';
  }, 3000);
}

function carregarAtividades() {
  fetch('/atividades').then(res => res.json()).then(data => {
    atividades = data;
    filtrar('todas');
  });
}

function adicionarAtividade() {
  const nova = {
    titulo: document.getElementById('titulo').value,
    descricao: document.getElementById('descricao').value,
    categoria: document.getElementById('categoria').value,
    externa: document.getElementById('externa').checked,
    local: document.getElementById('local').value,
    data: document.getElementById('data').value,
    hora: document.getElementById('hora').value,
    duracao: parseInt(document.getElementById('duracao').value)
  };

  fetch('/atividades', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(nova)
  })
    .then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(() => {
      mostrarMensagem("Atividade salva com sucesso!", true);
      limparFormulario();
      carregarAtividades();
    })
    .catch(() => {
      mostrarMensagem("Erro ao salvar atividade.", false);
    });
}

function limparFormulario() {
  document.getElementById('titulo').value = '';
  document.getElementById('descricao').value = '';
  document.getElementById('categoria').value = 'matematica';
  document.getElementById('externa').checked = false;
  document.getElementById('local').value = '';
  document.getElementById('local').style.display = 'none';
  document.getElementById('data').value = '';
  document.getElementById('hora').value = '';
  document.getElementById('duracao').value = '';
}

function filtrar(tipo) {
  const hoje = new Date().toISOString().split('T')[0];
  let lista = atividades;
  if (tipo === 'hoje') lista = atividades.filter(a => a.data === hoje && !a.concluida);
  if (tipo === 'proximas') lista = atividades.filter(a => a.data > hoje && !a.concluida);
  if (tipo === 'concluidas') lista = atividades.filter(a => a.concluida);
  if (tipo === 'todas') lista = atividades.filter(a => !a.concluida);
  renderizar(lista);
  document.querySelectorAll('.abas button').forEach(btn => btn.classList.remove('active'));
  document.getElementById('btn-' + tipo).classList.add('active');
}

function renderizar(lista) {
  const container = document.getElementById('atividades');
  container.innerHTML = '';
  if (lista.length === 0) return container.innerHTML = '<p>Nenhuma atividade</p>';
  lista.forEach(a => {
    const el = document.createElement('div');
    el.className = 'card' + (a.concluida ? ' completed' : '');
    el.innerHTML = `
      <strong>${a.titulo}</strong> - ${a.data} ${a.hora}<br>
      ${a.descricao || ''}<br>
      ${a.duracao} min<br>
      ${a.externa ? ('📍 ' + a.local + '<br>') : ''}Categoria: ${a.categoria}<br>
      <button onclick="toggle(${a.id})">${a.concluida ? 'Desfazer' : 'Concluir'}</button>
      <button onclick="remover(${a.id})">Excluir</button>
    `;
    container.appendChild(el);
  });
}

function toggle(id) {
  fetch(`/atividades/${id}/toggle`, { method: 'POST' }).then(() => carregarAtividades());
}

function remover(id) {
  fetch(`/atividades/${id}`, { method: 'DELETE' }).then(() => carregarAtividades());
}

document.addEventListener('DOMContentLoaded', carregarAtividades);