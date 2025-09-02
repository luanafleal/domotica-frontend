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

// Função global (pode ficar no index.html)
function carregarPagina(pagina, elemento) {
  // fetch(pagina)
  //   .then(res => res.text())
  //   .then(html => {
  //     document.getElementById('conteudo').innerHTML = html;

  //     // Atualizar destaque no menu
  //     document.querySelectorAll('.menu-link').forEach(link => {
  //       link.classList.remove('active');
  //     });
  //     elemento.classList.add('active');

  //     if (pagina.includes("casa")) {
  //       const script = document.createElement("script");
  //       script.src = "components/casa/casas.js";
  //       document.body.appendChild(script);
  //     }
  //   })
  //   .catch(err => console.error("Erro ao carregar página:", err));

  fetch(pagina)
    .then(res => res.text())
    .then(html => {
      document.getElementById('conteudo').innerHTML = html;

      // Atualizar destaque no menu
      document.querySelectorAll('.menu-link').forEach(link => {
        link.classList.remove('active');
      });
      elemento.classList.add('active');

      // Atualizar cabeçalho
      const header = document.getElementById('header-topo');
      const headerIcone = document.getElementById('header-icone');
      const headerTitulo = document.getElementById('header-titulo');

      const spanIcone = elemento.querySelector('.material-symbols-outlined');
      const texto = elemento.querySelector('span:last-child')?.textContent.trim();

      if (header && headerIcone && headerTitulo && spanIcone && texto) {
        headerIcone.textContent = spanIcone.textContent;
        headerTitulo.textContent = texto;
      }

      // Carregar scripts específicos
      if (pagina.includes("casa")) {
        const script = document.createElement("script");
        script.src = "components/casa/casas.js";
        document.body.appendChild(script);
      }
    })
    .catch(err => console.error("Erro ao carregar página:", err));
}
