import { sliderState } from "./sliderState";
import { goToSlide } from "./sliderController";

export const initSlider = () => {
    const slides = document.querySelectorAll(".slideSection");
    sliderState.total = slides.length ;

    // стартовое состояние
    slides.forEach((el, i) => {
        if (i !== 0) {
            (el as HTMLElement).style.transform = "translateX(100%)";
        }
    });

    initWheel();
    initCursor();
    initPagination();
    initPaginationMenu();
    initTouch();
};

/* ================= WHEEL ================= */

let scrollProgress = 0;
const threshold = 300;

const initWheel = () => {
    window.addEventListener("wheel", (e) => {

        if (sliderState.isAnimating) return;
        if (sliderState.isMenuOpen) return;

        scrollProgress += Math.abs(e.deltaY);
        updateCursor(scrollProgress / threshold);

        if (scrollProgress >= threshold) {
            scrollProgress = 0;

            if (e.deltaY > 0) {
                goToSlide(sliderState.current + 1);
            } else {
                goToSlide(sliderState.current - 1);
            }
        }
    });
};

/* ================= CURSOR ================= */

let progressCircle: SVGCircleElement;

const initCursor = () => {
    const cursor = document.querySelector(".cursorProgress") as HTMLElement;
    progressCircle = document.querySelector(".progress") as SVGCircleElement;

    document.addEventListener("mousemove", (e) => {
        cursor.style.left = e.clientX + "px";
        cursor.style.top = e.clientY + "px";
    });
};

const updateCursor = (progress: number) => {
    const max = 283;
    const offset = max - max * Math.min(progress, 1);
    progressCircle.style.strokeDashoffset = offset.toString();
};

/* ================= PAGINATION ================= */

const initPagination = () => {
    const items = document.querySelectorAll(".pagination .item");

    items.forEach((el, i) => {
        el.addEventListener("click", () => goToSlide(i));
    });
};

const initAD = () => {
    const items = document.querySelectorAll("#slide04 .advantagesItem");

    items.forEach((el, i) => {
        el.addEventListener("click", () => goToSlide(i));
    });
};

const initPaginationMenu = () => {
    const items = document.querySelectorAll(".sideMenu .slide");

    const burger = document.getElementById("burger");
    const menu = document.getElementById("sideMenu");
    const overlay = document.getElementById("overlay");

    if (burger && menu && overlay) {
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
            el.addEventListener("click", () => {goToSlide(i); toggleMenu()});
            
        });
        }
    
};


   

  
/* ================= TOUCH ================= */

const initTouch = () => {
    let startY = 0;

    window.addEventListener("touchstart", (e) => {
        startY = e.touches[0].clientY;
    });

    window.addEventListener("touchend", (e) => {
        if (sliderState.isMenuOpen) return;

        const delta = startY - e.changedTouches[0].clientY;

        if (Math.abs(delta) < 50) return;

        if (delta > 0) {
            goToSlide(sliderState.current + 1);
        } else {
            goToSlide(sliderState.current - 1);
        }
    });
};