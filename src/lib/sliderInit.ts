import { sliderState } from "./sliderState";
import { initDesktopSlider } from "./gsapSliderController";
import { initMobileSlider } from "./swiperMobileSlider";

const isMobile = (): boolean => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        || window.innerWidth <= 768;
};

export const initSlider = () => {
    if (isMobile()) {
        initMobileSlider();
    } else {
        initDesktopSlider();
    }
};