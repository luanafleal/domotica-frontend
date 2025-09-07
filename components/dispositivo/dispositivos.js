function inicializarPagina() {   
    const API_URL = "http://localhost:3001/api";

    const cardsCasas = document.getElementById("cards-casas");
    const sidebar = document.getElementById("sidebar");
    const sidebarLista = document.getElementById("sidebar-lista");
    const comodoContainer = document.getElementById("comodo-container");
    const selectComodos = document.getElementById("select-comodos");
    const dispositivosContainer = document.getElementById("dispositivos-container");

    let casas = [];
    let comodos = [];
    let dispositivos = [];
    let casaSelecionada = null;

    // ====== CARREGAR CASAS ======
    function getCasas() {
        fetch(`${API_URL}/houses`)
            .then(res => res.json())
            .then(data => {
                console.log('Aqui!')
                casas = data.map(c => ({ id: c.id_house, nome: c.name }));
                renderizarCasas();
            })
            .catch(err => console.error(err));
    }

    function renderizarCasas() {
        cardsCasas.innerHTML = "";
        casas.forEach(casa => {
            const card = document.createElement("div");
            card.className = "card";
            card.innerHTML = `<span class="material-symbols-outlined card-icon">home</span><span class="card-text">${casa.nome}</span>`;
            card.addEventListener("click", () => {
                casaSelecionada = casa.id;
                abrirSidebar();
                carregarComodos(casa.id);
            });
            cardsCasas.appendChild(card);
        });
    }

    // ====== ABRIR / FECHAR SIDEBAR ======
    function abrirSidebar() {
        sidebar.classList.add("ativa");
        comodoContainer.classList.add("hidden");
        dispositivosContainer.classList.add("hidden");
        sidebarLista.innerHTML = "";
    }

    document.getElementById("fechar-sidebar").addEventListener("click", () => {
        sidebar.classList.remove("ativa");
    });

    // ====== CARREGAR CÔMODOS ======
    function carregarComodos(casaId) {
        fetch(`${API_URL}/rooms/house/${casaId}`)
            .then(res => res.json())
            .then(data => {
                comodos = data.map(c => ({ id: c.id_room, nome: c.name }));
                renderComodos();
            })
            .catch(err => console.error(err));
    }

    function renderComodos() {
        selectComodos.innerHTML = `<option value="">Selecione um cômodo</option>`;
        comodos.forEach(c => {
            const opt = document.createElement("option");
            opt.value = c.id;
            opt.textContent = c.nome;
            selectComodos.appendChild(opt);
        });
        comodoContainer.classList.remove("hidden");
        dispositivosContainer.classList.add("hidden");
    }

    // ====== CARREGAR DISPOSITIVOS ======
    selectComodos.addEventListener("change", () => {
        const comodoId = selectComodos.value;
        if (!comodoId) {
            dispositivosContainer.classList.add("hidden");
            return;
        }

        fetch(`${API_URL}/devices/room/${comodoId}`)
            .then(res => res.json())
            .then(data => {
                dispositivos = data.map(d => ({ nome: d.name, tipo: d.type }));
                renderDispositivos();
            })
            .catch(err => console.error(err));
    });

    function renderDispositivos() {
        sidebarLista.innerHTML = "";

        if (dispositivos.length === 0) {
            sidebarLista.textContent = "Nenhum dispositivo neste cômodo.";
        } else {
            dispositivos.forEach(d => {
                const card = document.createElement("div");
                card.className = "device-card";
                card.innerHTML = `<strong class="device-nome">${d.nome}</strong><small class="device-tipo">${d.tipo}</small>`;
                sidebarLista.appendChild(card);
            });
        }

        dispositivosContainer.classList.remove("hidden");
    }

    // ====== INICIALIZAÇÃO ======
    getCasas();
}

