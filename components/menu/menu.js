class MenuComponent extends HTMLElement {
  connectedCallback() {
    fetch("components/menu/menu.html")
      .then(res => res.text())
      .then(html => {
        this.innerHTML = html;

        // Após carregar o HTML, adiciona os eventos
        const links = this.querySelectorAll('.menu-link');

        links.forEach(link => {
          link.addEventListener('click', (e) => {
            e.preventDefault();

            const pagina = link.getAttribute('data-page');
            carregarPagina(pagina, link);
          });
        });

        // Carrega a página inicial (link com .active)
        const linkInicial = this.querySelector('.menu-link.active');
        if (linkInicial) {
          const paginaInicial = linkInicial.getAttribute('data-page');
          carregarPagina(paginaInicial, linkInicial);
        }
      })
      .catch(err => console.error("Erro ao carregar menu:", err));
  }
}

customElements.define("menu-component", MenuComponent);

function carregarPagina(pagina, itemMenu, parametro = null) {
  fetch(pagina)
    .then(res => res.text())
    .then(html => {
      document.getElementById('conteudo').innerHTML = html;

      if (!!itemMenu) {
        // Atualizar destaque no menu
        document.querySelectorAll('.menu-link').forEach(link => link.classList.remove('active'));
        itemMenu.classList.add('active');

        // Atualizar cabeçalho
        const header = document.getElementById('header-topo');
        const headerIcone = document.getElementById('header-icone');
        const headerTitulo = document.getElementById('header-titulo');

        const spanIcone = itemMenu.querySelector('.material-symbols-outlined');
        const texto = itemMenu.querySelector('span:last-child')?.textContent.trim();

        if (header && headerIcone && headerTitulo && spanIcone && texto) {
          headerIcone.textContent = spanIcone.textContent;
          headerTitulo.textContent = texto;
        }
      }

      // Carregar script específico da página
      const script = document.createElement("script");
      // Convenção: script da página está no mesmo diretório que o HTML, mesmo nome, mas .js
      script.src = pagina.replace('.html', '.js');
      script.onload = () => {
        // Convenção: cada página deve exportar globalmente uma função chamada `inicializarPagina`
        if (typeof inicializarPagina === "function") {
          inicializarPagina(parametro);
          console.log('Será que foi pro else')
        }
      };

      document.body.appendChild(script);
    })
    .catch(err => console.error("Erro ao carregar página:", err));
}
