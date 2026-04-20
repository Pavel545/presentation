// public/preloader.js
(function() {
    // Создаем прелоадер немедленно, до загрузки чего-либо
    const preloaderHTML = `
        <div id="preloader" class="preloader" style="
            position: fixed;
            inset: 0;
            background: #0a0a0a;
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: none;
        ">
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 40px;
                width: 300px;
            ">
                <div id="preloaderShapes" style="
                    position: relative;
                    width: 200px;
                    height: 200px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                "></div>
                <div style="
                    width: 100%;
                    height: 2px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 1px;
                    overflow: hidden;
                ">
                    <div id="preloaderBar" style="
                        height: 100%;
                        width: 0%;
                        background: linear-gradient(90deg, #A8D307, #E5FF8B, #BFEF0A);
                        border-radius: 1px;
                        transition: width 0.3s ease;
                    "></div>
                </div>
                <div style="
                    color: #E5FF8B;
                    font-family: monospace;
                    font-size: 14px;
                    letter-spacing: 2px;
                ">
                    <span id="preloaderPercent">0</span>%
                </div>
            </div>
        </div>
    `;
    
    // Вставляем прелоадер первым элементом в body
    document.body.insertAdjacentHTML('afterbegin', preloaderHTML);
    
    // Простая анимация до загрузки GSAP
    const bar = document.getElementById('preloaderBar');
    const percent = document.getElementById('preloaderPercent');
    let progress = 0;
    
    // Имитация прогресса пока грузится страница
    const interval = setInterval(() => {
        if (progress < 90) {
            progress += Math.random() * 15;
            if (progress > 90) progress = 90;
            bar.style.width = progress + '%';
            percent.textContent = Math.round(progress);
        }
    }, 200);
    
    // Когда страница загружена
    window.addEventListener('load', function() {
        clearInterval(interval);
        progress = 100;
        bar.style.width = '100%';
        percent.textContent = '100';
        
        // Ждем загрузки GSAP и скрываем
        setTimeout(function() {
            const preloader = document.getElementById('preloader');
            if (preloader) {
                preloader.style.transition = 'opacity 0.5s';
                preloader.style.opacity = '0';
                setTimeout(() => preloader.remove(), 500);
            }
        }, 300);
    });
    
    // Сохраняем для доступа из основного скрипта
    window.__preloader = {
        bar, percent, interval,
        setProgress: (val) => {
            progress = val;
            bar.style.width = val + '%';
            percent.textContent = Math.round(val);
        }
    };
})();