const API_URL = "http://localhost:3000/api/houses";

const cardsContainer = document.getElementById('cards');
const mensagem = document.getElementById('mensagem');
const modal = document.getElementById('modal');
const nomeInput = document.getElementById('nome');
const enderecoInput = document.getElementById('endereco');
const modalEditar = document.getElementById('modal-editar');
const nomeEditar = document.getElementById('edit-nome');
const enderecoEditar = document.getElementById('edit-endereco');
let idCasaEditando = null;
let casas = [];

getCasas();

function abrirModal() {
    modal.style.display = 'block';
}

function fecharModal() {
    modal.style.display = 'none';
    nomeInput.value = '';
    enderecoInput.value = '';
}

window.onclick = function (event) {
    if (event.target === modal) {
        fecharModal();
    }
}

function cadastrarCasa() {
    const nome = nomeInput.value.trim();
    const endereco = enderecoInput.value.trim();

    if (nome === '' || endereco === '') {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    // Enviar para a API
    fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: nome,
            address: endereco
        })
    })
    .then(res => res.json())
    .then(data => {
        // Adiciona a casa retornada na lista
        casas.push({
            id: data.id_house,
            nome: data.name,
            endereco: data.address
        });
        renderizarCasas();
        fecharModal();
    })
    .catch(error => {
        console.error("Erro ao cadastrar casa:", error);
        alert("Erro ao cadastrar casa");
    });
}

function renderizarCasas() {
    cardsContainer.innerHTML = '';

    if (casas.length === 0) {
        mensagem.style.display = 'block';
    } else {
        mensagem.style.display = 'none';

        casas.forEach(casa => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-editar" onclick="abrirModalEditar(${casa.id})">
                    <span class="material-symbols-outlined">edit</span>
                </div>
                <span class="card-icon material-symbols-outlined">home</span>
                <div class="card-text"><strong>${casa.nome}</strong><br><small>${casa.endereco}</small></div>
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

function getCasas() {
    fetch('http://localhost:3000/api/houses')
        .then(response => response.json())
        .then(data => {
            console.log("Casas recebidas da API:", data);

            casas = data.map(casa => ({ id: casa.id_house, nome: casa.name, endereco: casa.address }))
            renderizarCasas();
        })
        .catch(error => {
            console.error("Erro ao buscar casas:", error);
        });
}

function abrirModalEditar(id) {
    const casa = casas.find(c => c.id === id);
    if (!casa) return;

    idCasaEditando = id;
    nomeEditar.value = casa.nome;
    enderecoEditar.value = casa.endereco;

    modalEditar.style.display = 'block';
}

function fecharModalEditar() {
    modalEditar.style.display = 'none';
    nomeEditar.value = '';
    enderecoEditar.value = '';
    idCasaEditando = null;
}

function salvarEdicao() {
    const novoNome = nomeEditar.value.trim();
    const novoEndereco = enderecoEditar.value.trim();

    if (novoNome === '' || novoEndereco === '') {
        alert("Preencha todos os campos.");
        return;
    }

    const casaIndex = casas.findIndex(c => c.id === idCasaEditando);
    if (casaIndex === -1) return;

    // Atualiza na API
    fetch(`${API_URL}/${idCasaEditando}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: novoNome,
            address: novoEndereco
        })
    })
    .then(res => {
        if (!res.ok) throw new Error("Erro ao editar");
        return res.json();
    })
    .then(() => {
        // Atualiza localmente
        casas[casaIndex].nome = novoNome;
        casas[casaIndex].endereco = novoEndereco;
        fecharModalEditar();
        renderizarCasas();
    })
    .catch(err => {
        console.error(err);
        alert("Erro ao editar casa");
    });
}

function excluirCasa() {
    if (!confirm("Tem certeza que deseja excluir esta casa?")) return;

    fetch(`${API_URL}/${idCasaEditando}`, {
        method: 'DELETE'
    })
    .then(res => {
        if (!res.ok) throw new Error("Erro ao excluir");
        return res.json();
    })
    .then(() => {
        casas = casas.filter(c => c.id !== idCasaEditando);
        fecharModalEditar();
        renderizarCasas();
    })
    .catch(err => {
        console.error(err);
        alert("Erro ao excluir casa");
    });
}