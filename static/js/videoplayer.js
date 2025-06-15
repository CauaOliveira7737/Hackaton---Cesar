document.addEventListener("DOMContentLoaded", function () {
    const videos = document.querySelectorAll("video");

    videos.forEach(video => {
        const container = video.closest(".video-thumb");
        const playPauseBtn = container.querySelector(".playPause");

        const playIcon = `<i class="fas fa-play"></i>`;
        const pauseIcon = `<i class="fas fa-pause"></i>`;

        video.removeAttribute("controls");

        let hideTimeout;

        const leftIndicator = document.createElement("div");
        leftIndicator.className = "video-indicator left";
        leftIndicator.innerHTML = `<i class="fas fa-backward"></i>`;

        const rightIndicator = document.createElement("div");
        rightIndicator.className = "video-indicator right";
        rightIndicator.innerHTML = `<i class="fas fa-forward"></i>`;

        container.appendChild(leftIndicator);
        container.appendChild(rightIndicator);

        function showIndicator(indicator) {
            indicator.classList.add("show");
            setTimeout(() => {
                indicator.classList.remove("show");
            }, 800);
        }

        function updateIcon() {
            playPauseBtn.innerHTML = video.paused ? playIcon : pauseIcon;
        }

        function scheduleHide() {
            clearTimeout(hideTimeout);
            hideTimeout = setTimeout(() => {
                playPauseBtn.classList.add("hide");
            }, 1500);
        }

        playPauseBtn.addEventListener("click", () => {
            if (video.paused) {
                video.play();
                scheduleHide();
            } else {
                video.pause();
            }
        });

        video.addEventListener("pause", () => {
            clearTimeout(hideTimeout);
            updateIcon();
            playPauseBtn.classList.remove("hide");
        });

        video.addEventListener("play", () => {
            updateIcon();
        });

        video.addEventListener("click", () => {
            playPauseBtn.classList.remove("hide");

            if (video.paused) {
                video.play();
                scheduleHide();
            } else {
                video.pause();
                clearTimeout(hideTimeout);
            }
        });

        video.addEventListener("dblclick", (event) => {
            const rect = video.getBoundingClientRect();
            const clickX = event.clientX - rect.left;
            const metade = rect.width / 2;

            if (clickX < metade) {
                video.currentTime = Math.max(video.currentTime - 5, 0);
                showIndicator(leftIndicator);
            } else {
                video.currentTime = Math.min(video.currentTime + 5, video.duration);
                showIndicator(rightIndicator);
            }
        });

        let totalMin = 0;
        let totalSec = 0;

        video.addEventListener("loadedmetadata", function () {
            let duration = video.duration;
            totalMin = Math.floor(duration / 60);
            totalSec = Math.floor(duration % 60);
            if (totalSec < 10) totalSec = "0" + totalSec;

            let tempoVideoSpan = container.querySelector(".tempo-video");
            if (tempoVideoSpan) {
                tempoVideoSpan.textContent = `0:00 / ${totalMin}:${totalSec}`;
            }
        });

        video.addEventListener("timeupdate", function () {
            let current = video.currentTime;
            let currentMin = Math.floor(current / 60);
            let currentSec = Math.floor(current % 60);
            if (currentSec < 10) currentSec = "0" + currentSec;

            let tempoVideoSpan = container.querySelector(".tempo-video");
            if (tempoVideoSpan) {
                tempoVideoSpan.textContent = `${currentMin}:${currentSec} / ${totalMin}:${totalSec}`;
            }
        });
    });
});
