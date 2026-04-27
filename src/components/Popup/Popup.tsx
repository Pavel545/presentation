// src/components/Popup/Popup.tsx
import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import type { Swiper } from 'swiper';

interface PopupProps {
  triggerSelector?: string;
  closeOnEscape?: boolean;
  closeOnOverlay?: boolean;
  animationDuration?: number;
}

const Popup: React.FC<PopupProps> = ({
  triggerSelector = '[data-id]',
  closeOnEscape = true,
  closeOnOverlay = true,
  animationDuration = 0.3
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const popupRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Получаем swiper instance из глобального контекста
  const getSwiper = (): Swiper | null => {
    return (window as any).swiperInstance || null;
  };

  // Открытие попапа
  const openPopup = (slideId?: string) => {
    if (slideId) {
      const targetIndex = parseInt(slideId, 10);
      if (!isNaN(targetIndex)) {
        setCurrentSlide(targetIndex);
      }
    }
    
    setIsOpen(true);
    document.body.classList.add('lock');
    
    // Анимируем открытие
    if (overlayRef.current) {
      gsap.to(overlayRef.current, {
        opacity: 1,
        duration: animationDuration,
        ease: 'power2.out'
      });
    }
    
    if (contentRef.current) {
      gsap.fromTo(contentRef.current, 
        { 
          scale: 0.9, 
          opacity: 0,
          y: 20
        },
        { 
          scale: 1, 
          opacity: 1,
          y: 0,
          duration: animationDuration,
          ease: 'back.out(1.2)'
        }
      );
    }
  };

  // Закрытие попапа
  const closePopup = () => {
    const tl = gsap.timeline({
      onComplete: () => {
        setIsOpen(false);
        document.body.classList.remove('lock');
      }
    });

    tl.to(contentRef.current, {
      scale: 0.9,
      opacity: 0,
      y: -20,
      duration: animationDuration * 0.7,
      ease: 'power2.in'
    })
    .to(overlayRef.current, {
      opacity: 0,
      duration: animationDuration * 0.5,
      ease: 'power2.out'
    }, `-=${animationDuration * 0.3}`);
  };

  // Переход к слайду
  const goToSlide = (slideId: string) => {
    const swiper = getSwiper();
    const targetIndex = parseInt(slideId, 10);
    
    if (swiper && !isNaN(targetIndex)) {
      swiper.slideTo(targetIndex, 800);
      setCurrentSlide(targetIndex);
      
      // Дополнительная логика из вашего скрипта
      const menuElement = document.querySelector('.menu');
      const typingPlaceholder = document.querySelector('.typing-placeholder');
      
      if (targetIndex > 0) {
        menuElement?.classList.add("go");
        typingPlaceholder?.classList.add("go");
      } else {
        menuElement?.classList.remove("go");
        typingPlaceholder?.classList.remove("go");
      }
      
      // Закрываем попап после перехода
      setTimeout(() => closePopup(), 300);
    }
  };

  // Инициализация триггеров
  useEffect(() => {
    const triggers = document.querySelectorAll<HTMLElement>(triggerSelector);
    
    triggers.forEach((trigger) => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const slideId = trigger.dataset.id;
        openPopup(slideId);
      });
    });

    // Очистка слушателей
    return () => {
      triggers.forEach((trigger) => {
        trigger.removeEventListener('click', () => {});
      });
    };
  }, [triggerSelector]);

  // Обработчик Escape
  useEffect(() => {
    if (!closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closePopup();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape]);

  // Обработчик клика по оверлею
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlay && e.target === overlayRef.current) {
      closePopup();
    }
  };

  return (
    <>
      {/* Оверлей и попап */}
      <div
        ref={overlayRef}
        className={`popup-overlay ${isOpen ? 'active' : ''}`}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          opacity: 0,
          visibility: isOpen ? 'visible' : 'hidden',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'visibility 0s linear 0s'
        }}
        onClick={handleOverlayClick}
      >
        <div
          ref={contentRef}
          className="popup-content"
          style={{
            position: 'relative',
            width: '90%',
            maxWidth: '1200px',
            maxHeight: '90vh',
            backgroundColor: '#fff',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
        >
          {/* Кнопка закрытия */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              closePopup();
            }}
            className="popup-close-button"
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              cursor: 'pointer',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              fontSize: '24px',
              color: '#333'
            }}
            aria-label="Закрыть попап"
          >
            ✕
          </button>

          {/* Контент попапа */}
          <div className="popup-inner">
            {/* Заголовок */}
            <div className="popup-header">
              <h2>Слайд {currentSlide + 1}</h2>
              <div className="popup-navigation">
                <button
                  onClick={() => {
                    const swiper = getSwiper();
                    if (swiper && !swiper.isBeginning) {
                      swiper.slidePrev();
                      setCurrentSlide(swiper.activeIndex);
                    }
                  }}
                  className="popup-nav-button"
                >
                  ← Назад
                </button>
                <span>{currentSlide + 1}</span>
                <button
                  onClick={() => {
                    const swiper = getSwiper();
                    if (swiper && !swiper.isEnd) {
                      swiper.slideNext();
                      setCurrentSlide(swiper.activeIndex);
                    }
                  }}
                  className="popup-nav-button"
                >
                  Вперед →
                </button>
              </div>
            </div>

            {/* Содержимое слайда */}
            <div className="popup-slide-content">
              {/* Здесь может быть рендер содержимого слайда */}
              <div className="slide-preview">
                <p>Содержимое слайда {currentSlide + 1}</p>
              </div>
            </div>

            {/* Кнопка перехода */}
            <div className="popup-footer">
              <button
                onClick={() => goToSlide(String(currentSlide))}
                className="popup-action-button"
              >
                Перейти к слайду
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .popup-header {
          padding: 30px 40px 20px;
          border-bottom: 1px solid #eee;
        }

        .popup-header h2 {
          margin: 0 0 15px;
          font-size: 24px;
          color: #333;
        }

        .popup-navigation {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .popup-nav-button {
          padding: 8px 16px;
          border: 2px solid #007bff;
          background: transparent;
          color: #007bff;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .popup-nav-button:hover {
          background: #007bff;
          color: white;
        }

        .popup-slide-content {
          padding: 30px 40px;
          min-height: 300px;
        }

        .slide-preview {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 40px;
          text-align: center;
        }

        .popup-footer {
          padding: 20px 40px 30px;
          border-top: 1px solid #eee;
          text-align: center;
        }

        .popup-action-button {
          padding: 12px 30px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.3s ease;
        }

        .popup-action-button:hover {
          transform: translateY(-2px);
        }

        .popup-close-button:hover {
          background-color: #ff4444;
          color: white;
        }

        @media (max-width: 768px) {
          .popup-content {
            width: 95%;
            border-radius: 16px;
          }

          .popup-header {
            padding: 20px 20px 15px;
          }

          .popup-slide-content {
            padding: 20px;
            min-height: 200px;
          }

          .popup-footer {
            padding: 15px 20px 20px;
          }
        }
      `}</style>
    </>
  );
};

export default Popup;