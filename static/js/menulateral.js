const menuBtn = document.querySelector('.icon-menu');
const menuLateral = document.getElementById('menuLateral');
const fecharBtn = document.getElementById('fecharMenu');
const overlay = document.getElementById('overlay');

function abrirMenu() {
    menuLateral.classList.add('menu-aberto');
    overlay.classList.add('ativa');  
}

function fecharMenu() {
    menuLateral.classList.remove('menu-aberto');
    overlay.classList.remove('ativa');
}

menuBtn.addEventListener('click', abrirMenu);
fecharBtn.addEventListener('click', fecharMenu);
overlay.addEventListener('click', fecharMenu);

document.querySelectorAll('.icons-menu').forEach(menuItem => {
    menuItem.addEventListener('click', () => {
        const link = menuItem.querySelector('a');
        if (link) {
            fecharMenu();
            window.location.href = link.href;
        }
    });
});
