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
