function abrirModal() {
    document.getElementById('modal-editar').style.display = 'block';
}

function fecharModal() {
    document.getElementById('modal-editar').style.display = 'none';
}

function previewFoto(event) {
    const preview = document.getElementById('fotoPreview');
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        preview.style.backgroundImage = `url(${e.target.result})`;
    }
    reader.readAsDataURL(file);
}

document.getElementById('form-editar').addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = new FormData(this);

    fetch('/editar_perfil', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.mensagem) {
            alert(data.mensagem);
            location.reload();
        } else if (data.erro) {
            alert('Erro: ' + data.erro);
        }
    })
    .catch(error => {
        console.error('Erro:', error);
    });
});
