function ativarBuscaVideos() {
  const inputBusca = document.querySelector('.input-topo');
  const cards = document.querySelectorAll('.video-card');

  inputBusca.addEventListener('input', () => {
    const termo = inputBusca.value.toLowerCase().trim();

    cards.forEach(card => {
      const titulo = card.querySelector('.titulo-video').textContent.toLowerCase();

      if (titulo.includes(termo)) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  });
}

function ativarFavoritos() {
  document.querySelectorAll('.favoritar-video').forEach(favDiv => {
    favDiv.addEventListener('click', () => {
      const videoId = favDiv.dataset.id;

      fetch('/favoritar', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ video_id: videoId })
      })
      .then(res => res.json())
      .then(data => {
        if(data.status === 'adicionado') {
          favDiv.classList.add('favorito-ativo');
          favDiv.querySelector('i').classList.replace('far', 'fas');
        } else if(data.status === 'removido') {
          favDiv.classList.remove('favorito-ativo');
          favDiv.querySelector('i').classList.replace('fas', 'far');
        }
      })
      .catch(console.error);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  ativarBuscaVideos();
  ativarFavoritos();
});
