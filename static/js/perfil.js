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
            mostrarToastPerfil(data.mensagem, true);
            setTimeout(() => {
                fecharModal();
                location.reload();
            }, 1200);
        } else if (data.erro) {
            mostrarToastPerfil('Erro: ' + data.erro, false);
        }
    })
    .catch(error => {
        mostrarToastPerfil('Erro ao salvar.', false);
        console.error('Erro:', error);
    });
});

function mostrarToastPerfil(texto, sucesso = true) {
    const toast = document.getElementById('toast-perfil');
    toast.innerText = texto;
    toast.className = 'toast-perfil' + (sucesso ? '' : ' erro');
    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 2000);
}
