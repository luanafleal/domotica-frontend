function inicializarPagina(casaId) {
    const API_URL = `http://localhost:3000/api`;

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
        fecharSidebar();
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

        fetch(API_URL + "/rooms", {
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

        fetch(`${API_URL}/rooms/${idComodoEditando}`, {
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

        fetch(`${API_URL}/rooms/${idComodoEditando}`, { method: 'DELETE' })
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
          <div class="card-editar">
            <span class="material-symbols-outlined">edit</span>
          </div>
          <span class="card-icon material-symbols-outlined">meeting_room</span>
          <div class="card-text">
            <strong>${comodo.nome}</strong>
          </div>
        `;
                cardsContainer.appendChild(card);

                card.addEventListener("click", () => {
                    abrirSidebarDispositivos(comodo.id);
                });

                // editar (sem disparar o clique do card)
                card.querySelector('.card-editar').addEventListener('click', (e) => {
                    e.stopPropagation();
                    abrirModalEditar(comodo.id);
                });

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
        fetch(`${API_URL}/rooms/house/${casaId}`)
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

    // ================== SIDEBAR DE DISPOSITIVOS ==================

    let idComodoSelecionado = null; // guarda qual cômodo está aberto

    function abrirSidebarDispositivos(idComodo) {
        const sidebar = document.getElementById('sidebar-dispositivos');
        const lista = document.getElementById('lista-dispositivos');
        lista.innerHTML = "Carregando...";

        idComodoSelecionado = idComodo;

        sidebar.classList.add('ativa');

        fetch(`${API_URL}/devices/room/${idComodo}`)
            .then(res => res.json())
            .then(devices => {
                const doComodo = devices.filter(d => d.id_room === idComodo);

                if (doComodo.length === 0) {
                    lista.innerHTML = "<p>Nenhum dispositivo.</p>";
                    return;
                }

                lista.innerHTML = "";
                doComodo.forEach(dev => {
                    const card = document.createElement("div");
                    card.className = "device-card";
                    card.innerHTML = `
                                    <div class="device-info">
                                    <strong>${dev.name}</strong><br>
                                    <small>${dev.type}</small>
                                    </div>
                                    <div class="device-actions">
                                    <button class="btn-toggle">${dev.state ? "Desligar" : "Ligar"}</button>
                                    <button class="btn-delete" title="Excluir">🗑</button>
                                    </div>
                                `;

                    // Ligar/Desligar (evita propagar o clique)
                    card.querySelector(".btn-toggle").addEventListener("click", (e) => {
                        e.stopPropagation();
                        const novoEstado = !dev.state;
                        fetch(`${API_URL}/devices/${dev.id_device}/state`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ state: novoEstado })
                        })
                            .then(r => r.json())
                            .then(() => abrirSidebarDispositivos(idComodo)); // recarrega lista
                    });

                    // Excluir (evita propagar o clique)
                    card.querySelector(".btn-delete").addEventListener("click", (e) => {
                        e.stopPropagation();
                        excluirDispositivo(dev.id_device, idComodo);
                    });

                    lista.appendChild(card);
                });

            })
            .catch(err => {
                lista.innerHTML = "<p>Erro ao carregar dispositivos</p>";
                console.error(err);
            });
    }

    function fecharSidebar() {
        document.getElementById('sidebar-dispositivos').classList.remove('ativa');
        idComodoSelecionado = null;
    }

    // ================== MODAL NOVO DISPOSITIVO ==================
    function abrirModalNovoDispositivo() {
        document.getElementById('modal-dispositivo').style.display = 'flex';
    }
    function fecharModalNovoDispositivo() {
        document.getElementById('modal-dispositivo').style.display = 'none';
        document.getElementById('device-nome').value = '';
        document.getElementById('device-tipo').value = '';
    }
    function salvarNovoDispositivo() {
        const nome = document.getElementById('device-nome').value.trim();
        const tipo = document.getElementById('device-tipo').value.trim();

        if (!nome || !tipo) {
            alert("Preencha todos os campos.");
            return;
        }

        fetch(`${API_URL}/devices`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: nome,
                type: tipo,
                state: false,
                id_room: idComodoSelecionado
            })
        })
            .then(r => r.json())
            .then(() => {
                fecharModalNovoDispositivo();
                abrirSidebarDispositivos(idComodoSelecionado); // recarrega lista
            })
            .catch(err => {
                alert("Erro ao salvar dispositivo");
                console.error(err);
            });
    }

    function excluirDispositivo(idDevice, idComodo) {
        if (!confirm("Tem certeza que deseja excluir este dispositivo?")) return;

        fetch(`${API_URL}/devices/${idDevice}`, {
            method: "DELETE"
        })
            .then(res => {
                if (!res.ok) throw new Error("Erro ao excluir dispositivo");
                // algumas APIs retornam vazio no DELETE; proteja o .json()
                return res.text().then(t => t ? JSON.parse(t) : {});
            })
            .then(() => {
                abrirSidebarDispositivos(idComodo); // recarrega lista
            })
            .catch(err => {
                console.error(err);
                alert("Erro ao excluir dispositivo");
            });
    }


    // ================== VINCULAR BOTÕES ==================
    window.cadastrarComodo = cadastrarComodo;
    window.salvarEdicaoComodo = salvarEdicaoComodo;
    window.excluirComodo = excluirComodo;
    window.abrirModalEditar = abrirModalEditar;
    window.fecharSidebar = fecharSidebar;
    window.abrirModalNovoDispositivo = abrirModalNovoDispositivo;
    window.salvarNovoDispositivo = salvarNovoDispositivo;

    // ================== INICIALIZAÇÃO ==================
    getComodos();
}
