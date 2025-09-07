function inicializarPagina(casaInfo) {
    const API_URL = `http://localhost:3001/api`;

    const casaId = casaInfo.id;
    const casaNome = casaInfo.nome;

    const titulo = document.querySelector("h1");
    if (titulo) {
        titulo.innerText = `Cômodos de "${casaNome}"`;
    }

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
                            <label class="switch">
                                <input type="checkbox" class="toggle-switch" ${dev.state ? "checked" : ""}>
                                <span class="slider round"></span>
                            </label>
                            <button class="btn-delete" title="Excluir">🗑</button>
                        </div>
                    `;

                    // Ligar/Desligar dispositivo sem recarregar toda a lista
                    const toggle = card.querySelector(".toggle-switch");
                    toggle.addEventListener("change", (e) => {
                        const novoEstado = e.target.checked;

                        fetch(`${API_URL}/devices/${dev.id_device}/state`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ state: novoEstado })
                        })
                        .then(r => r.json())
                        .then(() => {
                            // Atualiza apenas o objeto local
                            dev.state = novoEstado;
                        })
                        .catch(err => {
                            console.error(err);
                            alert("Erro ao atualizar dispositivo");
                            // volta toggle para o estado anterior em caso de erro
                            e.target.checked = !novoEstado;
                        });
                    });

                    // Excluir dispositivo (evita propagar o clique)
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
        // idComodoSelecionado = null;
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

    // ================== MODAL CENAS ==================
    const modalCena = document.getElementById("modal-cena");
    const btnNovaCena = document.getElementById("btn-add-cena");
    const selectDispositivo = document.getElementById("select-dispositivo");
    const selectAcao = document.getElementById("select-acao");
    const inputDelay = document.getElementById("delay");
    const inputNomeCena = document.getElementById("cena-nome");
    const listaAcoes = document.getElementById("lista-acoes");

    let acoesTemp = []; // guarda ações antes de salvar a cena

    function abrirModalCena() {
        fecharSidebar();
        modalCena.style.display = "flex";
        inputNomeCena.value = "";
        listaAcoes.innerHTML = "";
        acoesTemp = [];

        // carregar dispositivos do cômodo atual
        fetch(`${API_URL}/devices/room/${idComodoSelecionado}`)
            .then(res => res.json())
            .then(devices => {
                selectDispositivo.innerHTML = "";
                devices.forEach(d => {
                    const opt = document.createElement("option");
                    opt.value = d.id_device;
                    opt.textContent = d.name;
                    selectDispositivo.appendChild(opt);
                });
            });
    }

    function fecharModalCena() {
        modalCena.style.display = "none";
    }

    // adicionar ação na lista temporária
    document.getElementById("btn-add-acao").addEventListener("click", () => {
        const dispositivoId = selectDispositivo.value;
        const dispositivoNome = selectDispositivo.options[selectDispositivo.selectedIndex].text;
        const acao = selectAcao.value;
        const delay = parseInt(inputDelay.value) || 0;

        const ordem = acoesTemp.length + 1;

        const acaoObj = { dispositivoId, dispositivoNome, acao, delay, ordem };
        acoesTemp.push(acaoObj);

        renderizarAcoesTemp();
    });

    function renderizarAcoesTemp() {
        listaAcoes.innerHTML = "";
        acoesTemp.forEach(a => {
            const div = document.createElement("div");
            div.className = "acao-card";
            div.innerHTML = `
                <span>${a.ordem} - [ +${a.delay}s ] - ${a.dispositivoNome} - ${a.acao === "turn_on" ? "Ligar" : "Desligar"}</span>
                <button onclick="removerAcao(${a.ordem})">x</button>
            `;
            listaAcoes.appendChild(div);
        });
    }

    window.removerAcao = (ordem) => {
        acoesTemp = acoesTemp.filter(a => a.ordem !== ordem);
        // reordenar
        acoesTemp = acoesTemp.map((a, i) => ({ ...a, ordem: i + 1 }));
        renderizarAcoesTemp();
    };

    // salvar cena
    document.getElementById("btn-salvar-cena").addEventListener("click", () => {
        const nomeCena = inputNomeCena.value.trim();
        if (!nomeCena) {
            alert("Digite o nome da cena");
            return;
        }

        // 1. Criar cena
        fetch(`${API_URL}/scenes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: nomeCena, is_active: true })
        })
            .then(res => res.json())
            .then(cena => {
                // 2. Criar ações da cena
                const promises = acoesTemp.map(a =>
                    fetch(`${API_URL}/scene-devices`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            id_scene: cena.id_scene,
                            id_device: a.dispositivoId,
                            action: a.acao,
                            order: a.ordem,
                            interval: a.delay
                        })
                    })
                );
                return Promise.all(promises).then(() => cena);
            })
            .then(cena => {
                fecharModalCena();
                carregarCenas(); // recarrega lista de cenas abaixo do cômodo
            })
            .catch(err => {
                console.error(err);
                alert("Erro ao salvar cena");
            });
    });

    // ================== LISTAR CENAS ==================
    function carregarCenas() {
        fetch(`${API_URL}/scenes`)
            .then(res => res.json())
            .then(data => {
                const lista = document.getElementById("lista-cenas");
                lista.innerHTML = "";
                data.forEach(cena => {
                    const card = document.createElement("div");
                    card.className = "card cena-card";
                    card.innerHTML = `
                        <span>${cena.name}</span>
                        <button class="btn-cena" onclick="executarCena(${cena.id_scene})">▶</button>
                    `;
                    lista.appendChild(card);
                });
            });
    }

    window.executarCena = (idCena) => {
        fetch(`${API_URL}/scenes/${idCena}/execute`, { method: "POST" })
            .then(res => res.json())
            .then(msg => alert(msg.message))
            .catch(err => {
                console.error(err);
                alert("Erro ao executar cena");
            });
    };

    // vincular botão nova cena
    btnNovaCena.addEventListener("click", abrirModalCena);

    carregarCenas();


    // ================== VINCULAR BOTÕES ==================
    window.cadastrarComodo = cadastrarComodo;
    window.salvarEdicaoComodo = salvarEdicaoComodo;
    window.excluirComodo = excluirComodo;
    window.abrirModalEditar = abrirModalEditar;
    window.fecharSidebar = fecharSidebar;
    window.abrirModalNovoDispositivo = abrirModalNovoDispositivo;
    window.salvarNovoDispositivo = salvarNovoDispositivo;
    window.fecharModalNovoDispositivo = fecharModalNovoDispositivo;
    window.fecharModalCena = fecharModalCena;

    // ================== INICIALIZAÇÃO ==================
    getComodos();
}
