import { gsap } from "gsap";
import { sliderState } from "./sliderState";

// Определение мобильного устройства (оставлено для возможной условной логики)
const isMobile = (): boolean => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        || window.innerWidth <= 768;
};



export const goToSlide = (index: number) => {
    const slides = document.querySelectorAll<HTMLElement>(".slideSection");
   
    index = Math.max(0, Math.min(index, slides.length - 1));
   
    if (sliderState.isAnimating || index === sliderState.current) return;
   
    sliderState.isAnimating = true;
   
    const currentEl = slides[sliderState.current];
    const nextEl = slides[index];
   
    // Анимация ухода текущего слайда
    gsap.to(currentEl, {
        x: index > sliderState.current ? "-100%" : "100%",
        duration: 0.8,
        ease: "power3.inOut",
    });
   
    // Анимация появления следующего слайда
    gsap.fromTo(
        nextEl,
        {
            x: index > sliderState.current ? "100%" : "-100%",
        },
        {
            x: "0%",
            duration: 0.8,
            ease: "power3.inOut",
            onComplete: () => {
                sliderState.current = index;
                sliderState.isAnimating = false;
                updatePagination();
            },
        }
    );
};

const updatePagination = () => {
    const items = document.querySelectorAll(".pagination .item");
    items.forEach((el, i) => {
        el.classList.toggle("active", i === sliderState.current);
    });
};

// Экспортируем инициализацию только для десктопа
// (на мобильных устройствах этот скрипт не вызывается)
export const initDesktopSlider = () => {
    if (isMobile()) return; // дополнительная защита

    // Если потребуется добавить обработку колесика мыши или клавиатуры — сюда
    console.log('Desktop GSAP slider initialized');
};

// Полная очистка и перезапуск (на случай ресайза с мобильного на десктоп)
let resizeTimeout: number | undefined;

if (typeof window !== 'undefined') {
    window.addEventListener('resize', () => {
        if (resizeTimeout) {
            clearTimeout(resizeTimeout);
        }
        resizeTimeout = window.setTimeout(() => {
            if (!isMobile()) {
                initDesktopSlider();
            }
            resizeTimeout = undefined;
        }, 250);
    });
}