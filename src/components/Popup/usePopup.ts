// src/hooks/usePopup.ts
import { useState, useCallback } from 'react';

interface PopupState {
  isOpen: boolean;
  currentSlide: number;
}

export const usePopup = () => {
  const [popupState, setPopupState] = useState<PopupState>({
    isOpen: false,
    currentSlide: 0
  });

  const openPopup = useCallback((slideId?: number) => {
    setPopupState({
      isOpen: true,
      currentSlide: slideId ?? 0
    });
  }, []);

  const closePopup = useCallback(() => {
    setPopupState(prev => ({
      ...prev,
      isOpen: false
    }));
  }, []);

  return {
    ...popupState,
    openPopup,
    closePopup
  };
};