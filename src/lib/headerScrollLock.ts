let lastScrollY = 0;
let cleanupScroll: (() => void) | null = null;

const isMobile = () => window.innerWidth <= 768;

const getScrollContainer = (slide: HTMLElement): HTMLElement | null => {
    if (slide.scrollHeight > slide.clientHeight) return slide;

    return (
        (slide.querySelector('[class*="scroll"], [class*="content"], [class*="inner"]') as HTMLElement) ||
        null
    );
};

export const initHeaderScrollLock = (swiper: any) => {
    const header = document.getElementById("header");
    if (!header) return;

    const attach = (slide: HTMLElement) => {
        const container = getScrollContainer(slide);
        if (!container) return;

        const onScroll = () => {
            if (!isMobile()) {
                header.classList.remove("hide");
                return;
            }

            const y = container.scrollTop;

            if (y > lastScrollY && y > 100) {
                header.classList.add("hide");
            } else if (y < lastScrollY) {
                header.classList.remove("hide");
            }

            lastScrollY = y;
        };

        container.addEventListener("scroll", onScroll, { passive: true });

        return () => container.removeEventListener("scroll", onScroll);
    };

    const setActive = () => {
        cleanupScroll?.();

        const slide = swiper.slides[swiper.activeIndex] as HTMLElement;
        if (slide) { cleanupScroll = attach(slide);}
    };

    // initial
    setActive();

    swiper.on("slideChange", () => {
        lastScrollY = 0;
        setActive();
    });

    // cleanup если нужно
    swiper.on("destroy", () => {
        cleanupScroll?.();
    });
};