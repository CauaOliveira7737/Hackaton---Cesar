document.addEventListener("DOMContentLoaded", function () {
    const filtros = document.querySelectorAll(".navegacao-reels");
    const cards = document.querySelectorAll(".video-card");
    const inputBusca = document.querySelector(".input-topo");

    let filtroAtivo = null;

    function aplicarFiltros() {
        const termoBusca = inputBusca.value.toLowerCase().trim();
        const categoria = filtroAtivo ? filtroAtivo.querySelector(".texto-nav").innerText.trim() : "Todos";

        cards.forEach(card => {
            const cardCategoria = card.getAttribute("data-categoria").trim();
            const titulo = card.querySelector(".titulo-video").textContent.toLowerCase();

            const categoriaOk = (categoria === "Todos") || (cardCategoria === categoria);
            const buscaOk = titulo.includes(termoBusca);

            if (categoriaOk && buscaOk) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }
        });
    }

    filtros.forEach(filtro => {
        filtro.addEventListener("click", () => {
            if (filtroAtivo === filtro) {
                filtro.classList.remove("ativo-filtro");
                filtroAtivo = null;
            } else {
                filtros.forEach(f => f.classList.remove("ativo-filtro"));
                filtro.classList.add("ativo-filtro");
                filtroAtivo = filtro;
            }
            aplicarFiltros();
        });
    });

    inputBusca.addEventListener("input", () => {
        aplicarFiltros();
    });

    aplicarFiltros();
});
