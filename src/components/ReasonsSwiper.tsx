// src/components/ReasonsSwiper.tsx
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import './ReasonsSwiper.css';   // ← создадим отдельный CSS-файл

const ReasonsSwiper = () => {
    const reasons = [
        {
            title: 'Креативность',
            text: 'Мы мыслим современно и следим за всеми трендами в дизайне и IT направлении'
        },
        {
            title: 'Компетентность',
            text: 'Создаем и интегрируем кроссплатформенные системы для задач любой сложности'
        },
        {
            title: 'Надежность',
            text: 'Мы обеспечим надежную техническую поддержку Вашего сайта и IT проекта'
        },
        {
            title: 'Эффективность',
            text: 'Мы создаем корпоративные ресурсы, которые работают на Ваш имидж и бизнес-цели 24/7'
        }
    ];

    return (
        <div className="reasons-swiper-container">
            <Swiper
                modules={[Pagination, Autoplay]}
                spaceBetween={20}
                slidesPerView={1}
                pagination={{
                    clickable: true,
                    dynamicBullets: true
                }}
                autoplay={{
                    delay: 4000,
                    disableOnInteraction: false,
                }}
                loop={true}
                touchEventsTarget="container"   // рекомендуемая настройка для вложенных слайдеров
                nested={true}
                className="reasons-swiper"
                autoHeight={false}          // отключаем autoHeight, чтобы высота была стабильной
            >
                {reasons.map((reason, index) => (
                    <SwiperSlide key={index}>
                        <div className="rItem">
                            <h4 className="rItemTitle">{reason.title}</h4>
                            <p className="rItemText">{reason.text}</p>
                            <div className="decor">
                                <span className="d1"></span>
                                <span className="d2"></span>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default ReasonsSwiper;