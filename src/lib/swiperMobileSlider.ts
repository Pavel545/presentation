import Swiper from 'swiper';
import { Pagination } from 'swiper/modules';
import { gsap } from "gsap";
import { sliderState } from "./sliderState";
import { goToSlide } from "./gsapSliderController"; // для синхронизации внешних вызовов
let swiperInstance: Swiper | null = null;

const isMobile = (): boolean => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        || window.innerWidth <= 768;
};

const updateLogo = (newIndex: number) => {
    // та же функция, что и в gsapSliderController
    const logoImg = document.querySelector<HTMLImageElement>('#logoImage');
    if (!logoImg) return;

    const shouldBeLight = newIndex === 0;
    const currentIsLight = logoImg.src.includes('logo.svg') && !logoImg.src.includes('logoB');

    if (shouldBeLight === currentIsLight) return;

    const tl = gsap.timeline();
    tl.to(logoImg, { scale: 0.8, opacity: 0, rotation: -5, duration: 0.25, ease: "power2.in" })
      .to(logoImg, { 
          scale: 1, 
          opacity: 1, 
          rotation: 0, 
          duration: 0.35, 
          ease: "back.out(1.2)",
          clearProps: "rotation,scale",
          onComplete: () => {
              logoImg.src = shouldBeLight ? "/logo.svg" : "/logoB.svg";
              logoImg.alt = shouldBeLight ? "Логотип АЦР" : "Логотип АЦР (темный)";
          }
      });
};

export const initMobileSlider = () => {
    if (!isMobile() || swiperInstance) return;

    document.body.classList.add('mobile-slider');

    const swiperEl = document.querySelector('.swiper') as HTMLElement;
    if (!swiperEl) return;

    swiperInstance = new Swiper(swiperEl, {
        modules: [Pagination],

        direction: 'horizontal',
        slidesPerView: 1,
        spaceBetween: 0,
        speed: 800,
        threshold: 25,                    // уверенный свайп
        touchRatio: 1,
        touchAngle: 45,
        preventInteractionOnTransition: true,
        resistance: true,
        resistanceRatio: 0.85,

        pagination: {
            el: '.swiper-pagination',
            clickable: true,
            bulletElement: 'div',
            bulletClass: 'item',
            bulletActiveClass: 'active',
        },

        on: {
            init: (swiper) => {
                sliderState.current = swiper.activeIndex;
                updateLogo(swiper.activeIndex);
            },
            slideChange: (swiper) => {
                sliderState.current = swiper.activeIndex;
                updateLogo(swiper.activeIndex);
            },
            transitionStart: () => { sliderState.isAnimating = true; },
            transitionEnd: () => { sliderState.isAnimating = false; }
        }
    });

    // Синхронизация goToSlide с Swiper
    (window as any).goToSlide = (index: number) => {
        swiperInstance?.slideTo(index, 800);
    };
};