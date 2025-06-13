
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

document.addEventListener("DOMContentLoaded", function () {
    const video = document.querySelector("video");
    const playPauseBtn = document.querySelector(".playPause");
    const playIcon = `<i class="fas fa-play"></i>`;
    const pauseIcon = `<i class="fas fa-pause"></i>`;

    video.removeAttribute("controls");

    function updateIcon() {
        playPauseBtn.innerHTML = video.paused ? playIcon : pauseIcon;
    }

    playPauseBtn.addEventListener("click", () => {
        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }

        setTimeout(() => {
            playPauseBtn.classList.add("hide");
        }, 1500);
    });

    video.addEventListener("pause", () => {
        updateIcon();
        playPauseBtn.classList.remove("hide");
    });

    video.addEventListener("play", updateIcon);

    // Clique na área do vídeo para reexibir o botão
    video.addEventListener("click", () => {
        playPauseBtn.classList.remove("hide");

        // Oculta após 1.5s se estiver tocando
        if (!video.paused) {
            setTimeout(() => {
                playPauseBtn.classList.add("hide");
            }, 1500);
        }
    });
});




