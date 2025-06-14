const formArea = document.getElementById('formArea');
const formLogin = document.getElementById('formLogin');
const formRegistro = document.getElementById('formRegistro');
const linkToRegistro = document.getElementById('linkToRegistro');
const linkToLogin = document.getElementById('linkToLogin');

linkToRegistro.addEventListener('click', function (e) {
    e.preventDefault();
    formLogin.classList.remove('ativo');
    formRegistro.classList.add('ativo');
    formArea.classList.add('mover');
});

linkToLogin.addEventListener('click', function (e) {
    e.preventDefault();
    formRegistro.classList.remove('ativo');
    formLogin.classList.add('ativo');
    formArea.classList.remove('mover');
});