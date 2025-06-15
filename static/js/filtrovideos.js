document.addEventListener("DOMContentLoaded", function () {
    const filtros = document.querySelectorAll(".navegacao-reels");
    const cards = document.querySelectorAll(".video-card");

    let filtroAtivo = null;

    filtros.forEach(filtro => {
        filtro.addEventListener("click", () => {
            const categoria = filtro.querySelector(".texto-nav").innerText.trim();

            // Se o filtro clicado já estiver ativo, remove o filtro (mostra todos)
            if (filtroAtivo === filtro) {
                cards.forEach(card => {
                    card.style.display = "block";
                });
                filtro.classList.remove("ativo-filtro");
                filtroAtivo = null;
            } else {
                // Aplica o novo filtro
                filtros.forEach(f => f.classList.remove("ativo-filtro"));
                filtro.classList.add("ativo-filtro");
                filtroAtivo = filtro;

                cards.forEach(card => {
                    const cardCategoria = card.getAttribute("data-categoria").trim();

                    if (categoria === "Todos" || cardCategoria === categoria) {
                        card.style.display = "block";
                    } else {
                        card.style.display = "none";
                    }
                });
            }
        });
    });
});
