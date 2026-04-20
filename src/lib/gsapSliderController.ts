import { gsap } from "gsap";
import { sliderState } from "./sliderState";

// ==================== ЛОГОТИП ====================
const updateLogo = (newIndex: number) => {
    const logoImg = document.querySelector<HTMLImageElement>('#logoImage');
    if (!logoImg) return;

    const shouldBeLight = newIndex === 0;
    const currentIsLight = logoImg.src.includes('logo.svg') && !logoImg.src.includes('logoB');

    if (shouldBeLight === currentIsLight) return;

    const tl = gsap.timeline();

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
    .to(logoImg, {
        scale: 1,
        opacity: 1,
        rotation: 0,
        duration: 0.35,
        ease: "back.out(1.2)",
        clearProps: "rotation,scale"
    });
};

// ==================== ПАГИНАЦИЯ ====================
const updatePagination = () => {
    const items = document.querySelectorAll(".pagination .item");
    items.forEach((el, i) => {
        el.classList.toggle("active", i === sliderState.current);
    });
};

export const goToSlide = (index: number) => {
    const slides = document.querySelectorAll<HTMLElement>(".slideSection");

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
        { x: index > sliderState.current ? "100%" : "-100%" },
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

// ==================== ДЕСКТОП ИНИЦИАЛИЗАЦИЯ ====================
export const initDesktopSlider = () => {
    const slides = document.querySelectorAll<HTMLElement>(".slideSection");
    sliderState.total = slides.length;

    // Начальное положение слайдов
    slides.forEach((el, i) => {
        if (i !== 0) {
            el.style.transform = "translateX(100%)";
        }
    });

    initWheel();
    initCursor();
    initPagination();
    initPaginationMenu();
    // initTouch() — полностью удалён
};

let scrollProgress = 0;
const wheelThreshold = 300;

const initWheel = () => {
    window.addEventListener("wheel", (e) => {
        if (sliderState.isAnimating || sliderState.isMenuOpen) return;

        scrollProgress += Math.abs(e.deltaY);
        updateCursor(scrollProgress / wheelThreshold);

        if (scrollProgress >= wheelThreshold) {
            scrollProgress = 0;

            if (e.deltaY > 0) {
                goToSlide(sliderState.current + 1);
            } else {
                goToSlide(sliderState.current - 1);
            }
        }
    });
};

let progressCircle: SVGCircleElement | null = null;

const initCursor = () => {
    const cursor = document.querySelector(".cursorProgress") as HTMLElement;
    progressCircle = document.querySelector(".progress") as SVGCircleElement;

    if (!cursor) return;

    document.addEventListener("mousemove", (e) => {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
    });
};

const updateCursor = (progress: number) => {
    if (!progressCircle) return;
    const max = 283;
    const offset = max - max * Math.min(progress, 1);
    progressCircle.style.strokeDashoffset = offset.toString();
};

const initPagination = () => {
    const items = document.querySelectorAll(".pagination .item");
    items.forEach((el, i) => {
        el.addEventListener("click", () => goToSlide(i));
    });
};

const initPaginationMenu = () => {
    const items = document.querySelectorAll(".sideMenu .slide");
    const burger = document.getElementById("burger");
    const menu = document.getElementById("sideMenu");
    const overlay = document.getElementById("overlay");

    if (!burger || !menu || !overlay) return;

    const toggleMenu = () => {
        burger.classList.toggle("active");
        menu.classList.toggle("open");
        overlay.classList.toggle("show");
        document.body.classList.toggle("lock");
        sliderState.isMenuOpen = menu.classList.contains("open");
    };

    burger.addEventListener("click", toggleMenu);
    overlay.addEventListener("click", toggleMenu);

    items.forEach((el, i) => {
        el.addEventListener("click", () => {
            goToSlide(i);
            toggleMenu();
        });
    });
};