
    const menuBtn = document.querySelector('.icon-menu');
    const menuLateral = document.getElementById('menuLateral');
    const fecharBtn = document.getElementById('fecharMenu');
    const overlay = document.getElementById('overlay');

    function abrirMenu() {
        menuLateral.classList.add('menu-aberto');
        overlay.classList.add('visivel');
    }

    function fecharMenu() {
        menuLateral.classList.remove('menu-aberto');
        overlay.classList.remove('visivel');
    }

    menuBtn.addEventListener('click', abrirMenu);
    fecharBtn.addEventListener('click', fecharMenu);
    overlay.addEventListener('click', fecharMenu);
