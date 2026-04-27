// swiperMobileSlider.ts
import Swiper from 'swiper';
import { Pagination } from 'swiper/modules';
import { gsap } from "gsap";
import { sliderState } from "./sliderState";

let swiperInstance: Swiper | null = null;
let updateControlsState: ((index: number) => void) | null = null;

const isMobile = (): boolean => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        || window.innerWidth <= 768;
};

const updateLogo = (newIndex: number) => {
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

// Создание функции обновления контролов
const createControlsUpdater = (swiper: Swiper): ((index: number) => void) => {
    const prevBtn = document.querySelector<HTMLButtonElement>(".mobile-pagination .prev");
    const nextBtn = document.querySelector<HTMLButtonElement>(".mobile-pagination .next");
    const currentSlideEl = document.querySelector<HTMLElement>(".current-slide");

    return (activeIndex: number): void => {
        // Обновление индикатора текущего слайда
        if (currentSlideEl) {
            currentSlideEl.textContent = String(activeIndex + 1);
        }

        // Обновление состояния кнопок prev/next
        if (prevBtn) {
            const isFirst = activeIndex === 0;
            prevBtn.disabled = isFirst;
            prevBtn.style.color = isFirst ? "var(--temnyy-300)" : "var(--siniy)";
            prevBtn.style.cursor = isFirst ? "not-allowed" : "pointer";
        }

        if (nextBtn) {
            const isLast = activeIndex === swiper.slides.length - 1;
            nextBtn.disabled = isLast;
            nextBtn.style.color = isLast ? "var(--temnyy-300)" : "var(--siniy)";
            nextBtn.style.cursor = isLast ? "not-allowed" : "pointer";
        }
    };
};

// ==================== БУРГЕР МЕНЮ ====================
const initBurgerMenu = (swiper: Swiper): void => {
    const burger = document.getElementById("burger");
    const menu = document.getElementById("sideMenu");
    const overlay = document.getElementById("overlay");

    if (!burger || !menu || !overlay) return;

    // Функция обновления активного пункта меню
    const updateActiveMenuItem = (activeIndex: number) => {
        const menuItems = document.querySelectorAll(".sideMenu .slide");
        menuItems.forEach((item, i) => {
            if (i === activeIndex) {
                item.classList.add("active");
            } else {
                item.classList.remove("active");
            }
        });
    };

    const closeMenu = () => {
        burger.classList.remove("active");
        menu.classList.remove("open");
        overlay.classList.remove("show");
        document.body.classList.remove("lock");
        sliderState.isMenuOpen = false;
        swiper.enable();
    };

    const openMenu = () => {
        burger.classList.add("active");
        menu.classList.add("open");
        overlay.classList.add("show");
        document.body.classList.add("lock");
        sliderState.isMenuOpen = true;
        swiper.disable();

        // При открытии меню синхронизируем активный пункт с текущим слайдом
        updateActiveMenuItem(swiper.activeIndex);
    };

    const toggleMenu = () => {
        if (sliderState.isMenuOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    };

    burger.addEventListener("click", toggleMenu);
    overlay.addEventListener("click", toggleMenu);

    // Используем делегирование событий
    menu.addEventListener("click", (e) => {
        const slide = (e.target as HTMLElement).closest(".slide");
        if (!slide) return;

        const slides = Array.from(document.querySelectorAll(".sideMenu .slide"));
        const index = slides.indexOf(slide);

        if (index !== -1) {
            // Закрываем меню
            closeMenu();

            // Переключаем слайд
            swiper.slideTo(index, 800);

            // Обновляем активный пункт меню
            updateActiveMenuItem(index);
        }
    });

    // Закрытие меню по Escape
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && sliderState.isMenuOpen) {
            closeMenu();
        }
    });

    // Синхронизация активного пункта при смене слайда (например, свайпом)
    swiper.on('slideChange', () => {
        updateActiveMenuItem(swiper.activeIndex);
    });

    // Начальная синхронизация
    updateActiveMenuItem(swiper.activeIndex);
};
// Инициализация мобильных кнопок управления
const initMobileControls = (swiper: Swiper): void => {
    const prevBtn = document.querySelector<HTMLButtonElement>(".mobile-pagination .prev");
    const nextBtn = document.querySelector<HTMLButtonElement>(".mobile-pagination .next");
    const homeBtn = document.querySelector<HTMLButtonElement>(".mobile-pagination .home");
    const totalSlidesEl = document.querySelector<HTMLElement>(".total-slides");

    // Установка общего количества слайдов
    if (totalSlidesEl) {
        totalSlidesEl.textContent = String(swiper.slides.length);
    }

    // Создаем функцию обновления
    updateControlsState = createControlsUpdater(swiper);

    // Обработчики кнопок
    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            if (!swiper.isBeginning) {
                swiper.slidePrev();
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            if (!swiper.isEnd) {
                swiper.slideNext();
            }
        });
    }

    if (homeBtn) {
        homeBtn.addEventListener("click", () => {
            swiper.slideTo(0);
        });
    }

    // Начальное состояние
    if (updateControlsState) {
        updateControlsState(swiper.activeIndex);
    }
};

export const initMobileSlider = () => {
    if (!isMobile() || swiperInstance) return;

    document.body.classList.add('mobile-slider');

    const swiperEl = document.querySelector('.swiper') as HTMLElement;
    if (!swiperEl) return;

    // ========== ОПРЕДЕЛЯЕМ ФУНКЦИЮ ДО ИСПОЛЬЗОВАНИЯ ==========
    const toggleMenuAndTypingClasses = (index: number) => {
        const menuElement = document.querySelector('.menu');
        const typingPlaceholder = document.querySelector('.typing-placeholder');

        if (index > 0) {
            menuElement?.classList.add("go");
            typingPlaceholder?.classList.add("go");
        } else {
            menuElement?.classList.remove("go");
            typingPlaceholder?.classList.remove("go");
        }
    };
    // ====================================================

    swiperInstance = new Swiper(swiperEl, {
        modules: [Pagination],

        direction: 'horizontal',
        slidesPerView: 1,
        spaceBetween: 0,
        speed: 800,
        threshold: 25,
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
                sliderState.total = swiper.slides.length;
                updateLogo(swiper.activeIndex);
                initMobileControls(swiper);
                initBurgerMenu(swiper);

                // Инициализируем кнопки
                initWelkomButt();

                // Теперь функция определена и доступна
                toggleMenuAndTypingClasses(swiper.activeIndex);
            },
            slideChange: (swiper) => {
                sliderState.current = swiper.activeIndex;
                updateLogo(swiper.activeIndex);
                if (updateControlsState) {
                    updateControlsState(swiper.activeIndex);
                }

                // Теперь функция определена и доступна
                toggleMenuAndTypingClasses(swiper.activeIndex);
            },
            transitionStart: () => {
                sliderState.isAnimating = true;
            },
            transitionEnd: () => {
                sliderState.isAnimating = false;
            }
        }
    });

    // Синхронизация goToSlide с Swiper
    (window as any).goToSlide = (index: number) => {
        swiperInstance?.slideTo(index, 800);
        toggleMenuAndTypingClasses(index);
    };
};

// Экспорт для внешнего управления
export const getSwiperInstance = (): Swiper | null => swiperInstance;

export const mobileSlideTo = (index: number): void => {
    if (swiperInstance) {
        swiperInstance.slideTo(index, 800);
    }
};

export const mobileSlideNext = (): void => {
    if (swiperInstance && !swiperInstance.isEnd) {
        swiperInstance.slideNext();
    }
};

export const mobileSlidePrev = (): void => {
    if (swiperInstance && !swiperInstance.isBeginning) {
        swiperInstance.slidePrev();
    }
};

// ========== НОВАЯ ФУНКЦИЯ ДЛЯ КНОПОК С DATA-ID ==========
function initWelkomButt() {
    const a = document.querySelectorAll("[data-id]");
    console.log(a);

    a.forEach((el, i) => {
        el.addEventListener("click", () => {
            const targetIndex = parseInt(el.dataset.id || "0");
            if (swiperInstance && !isNaN(targetIndex)) {
                swiperInstance.slideTo(targetIndex, 800);
            }
        });
    });
}