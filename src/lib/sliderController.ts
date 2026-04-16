import { gsap } from "gsap";
import { sliderState } from "./sliderState";

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