import { gsap } from "gsap";
import { sliderState } from "./sliderState";

// Функция обновления логотипа
const updateLogo = (newIndex: number) => {
    const logoImg = document.querySelector<HTMLImageElement>('#logoImage');
    
    if (!logoImg) return;
    
    // Определяем, какой логотип должен быть
    const shouldBeLight = newIndex === 0;
    const currentIsLight = logoImg.src.includes('logo.svg') && !logoImg.src.includes('logoB');
    
    // Если логотип уже правильный - ничего не делаем
    if (shouldBeLight === currentIsLight) return;
    
    // Иначе делаем анимацию перехода
    const tl = gsap.timeline();
    
    // Анимация ухода текущего логотипа
    tl.to(logoImg, {
        scale: 0.8,
        opacity: 0,
        rotation: -5,
        duration: 0.25,
        ease: "power2.in",
        onComplete: () => {
            logoImg.src = shouldBeLight ? "/logo.svg" : "/logoB.svg";
            logoImg.alt = shouldBeLight ? "Логотип АЦР" : "Логотип АЦР (темный)";
        }
    })
    // Анимация появления нового логотипа
    .to(logoImg, {
        scale: 1,
        opacity: 1,
        rotation: 0,
        duration: 0.35,
        ease: "back.out(1.2)",
        clearProps: "rotation,scale"
    });
};
export const goToSlide = (index: number) => {
    const slides = document.querySelectorAll<HTMLElement>(".slideSection");
    console.log(index);
    
    index = Math.max(0, Math.min(index, slides.length - 1));

    if (sliderState.isAnimating || index === sliderState.current) return;

    sliderState.isAnimating = true;

    const currentEl = slides[sliderState.current];
    const nextEl = slides[index];

    gsap.to(currentEl, {
        x: index > sliderState.current ? "-100%" : "100%",
        duration: 0.8,
        ease: "power3.inOut",
    });

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
                updateLogo(index);
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