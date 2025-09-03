function inicializarPagina(casaId) {
  const API_URL = `http://localhost:3000/api/rooms`;

  const cardsContainer = document.getElementById('cards');
  const mensagem = document.getElementById('mensagem');
  const modal = document.getElementById('modal');
  const nomeInput = document.getElementById('nome');
  const modalEditar = document.getElementById('modal-editar');
  const nomeEditar = document.getElementById('edit-nome');

  let idComodoEditando = null;
  let comodos = [];

  // ================== MODAIS ==================
  function abrirModal() {
    modal.style.display = 'block';
  }

  function fecharModal() {
    modal.style.display = 'none';
    nomeInput.value = '';
  }

  function abrirModalEditar(id) {
    const comodo = comodos.find(c => c.id === id);
    if (!comodo) return;

    idComodoEditando = id;
    nomeEditar.value = comodo.nome;

    modalEditar.style.display = 'block';
  }

  function fecharModalEditar() {
    modalEditar.style.display = 'none';
    nomeEditar.value = '';
    idComodoEditando = null;
  }

  window.onclick = function (event) {
    if (event.target === modal) fecharModal();
    if (event.target === modalEditar) fecharModalEditar();
  };

  // ================== CRUD COMODOS ==================
  function cadastrarComodo() {
    const nome = nomeInput.value.trim();

    if (nome === '') {
      alert("Por favor, preencha o nome do cômodo.");
      return;
    }

    const dataSend = { name: nome, id_house: casaId }

    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataSend)
    })
      .then(res => res.json())
      .then(data => {
        comodos.push({
          id: data.id_room,
          nome: data.name
        });
        renderizarComodos();
        fecharModal();
      })
      .catch(error => {
        console.error("Erro ao cadastrar cômodo:", error);
        alert("Erro ao cadastrar cômodo");
      });
  }

  function salvarEdicaoComodo() {
    const novoNome = nomeEditar.value.trim();

    if (novoNome === '') {
      alert("Preencha o campo.");
      return;
    }

    const comodoIndex = comodos.findIndex(c => c.id === idComodoEditando);
    if (comodoIndex === -1) return;

    fetch(`${API_URL}/${idComodoEditando}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: novoNome })
    })
      .then(res => {
        if (!res.ok) throw new Error("Erro ao editar");
        return res.json();
      })
      .then(() => {
        comodos[comodoIndex].nome = novoNome;
        fecharModalEditar();
        renderizarComodos();
      })
      .catch(err => {
        console.error(err);
        alert("Erro ao editar cômodo");
      });
  }

  function excluirComodo() {
    if (!confirm("Tem certeza que deseja excluir este cômodo?")) return;

    fetch(`${API_URL}/${idComodoEditando}`, { method: 'DELETE' })
      .then(res => {
        if (!res.ok) throw new Error("Erro ao excluir");
        return res.json();
      })
      .then(() => {
        comodos = comodos.filter(c => c.id !== idComodoEditando);
        fecharModalEditar();
        renderizarComodos();
      })
      .catch(err => {
        console.error(err);
        alert("Erro ao excluir cômodo");
      });
  }

  // ================== RENDERIZAÇÃO ==================
  function renderizarComodos() {
    cardsContainer.innerHTML = '';

    if (comodos.length === 0) {
      mensagem.style.display = 'block';
    } else {
      mensagem.style.display = 'none';

      comodos.forEach(comodo => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <div class="card-editar" onclick="abrirModalEditar(${comodo.id})">
            <span class="material-symbols-outlined">edit</span>
          </div>
          <span class="card-icon material-symbols-outlined">meeting_room</span>
          <div class="card-text">
            <strong>${comodo.nome}</strong>
          </div>
        `;
        cardsContainer.appendChild(card);
      });
    }

    const botaoAdicionar = document.createElement('div');
    botaoAdicionar.className = 'card';
    botaoAdicionar.onclick = abrirModal;
    botaoAdicionar.innerHTML = `
      <div class="card-icon">＋</div>
      <div class="card-text">Adicionar</div>
    `;
    cardsContainer.appendChild(botaoAdicionar);
  }

  function getComodos() {
    fetch(`${API_URL}/house/${casaId}`)
      .then(response => response.json())
      .then(data => {
        comodos = data.map(c => ({
          id: c.id_room,
          nome: c.name
        }));
        renderizarComodos();
      })
      .catch(error => console.error("Erro ao buscar cômodos:", error));
  }

  // ================== VINCULAR BOTÕES ==================
  window.cadastrarComodo = cadastrarComodo;
  window.salvarEdicaoComodo = salvarEdicaoComodo;
  window.excluirComodo = excluirComodo;
  window.abrirModalEditar = abrirModalEditar;

  // ================== INICIALIZAÇÃO ==================
  getComodos();
}
