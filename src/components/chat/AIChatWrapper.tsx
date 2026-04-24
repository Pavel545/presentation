import React from 'react';
import AIChat from './AIChat';

interface AIChatWrapperProps {
  suggestedQuestions?: string[];
  welcomeMessage?: string;
}

const AIChatWrapper: React.FC<AIChatWrapperProps> = ({ 
  suggestedQuestions = [
    "Расскажите о продуктах ACR",
    "Какие у вас цены?",
    "Как связаться с поддержкой?",
    "Есть ли скидки?"
  ],
  welcomeMessage = "👋 Здравствуйте! Я AI ассистент компании ACR. Чем могу помочь? Задайте любой вопрос или выберите один из вариантов ниже."
}) => {
  return (
    <AIChat 
      suggestedQuestions={suggestedQuestions}
      welcomeMessage={welcomeMessage}
    />
  );
};

export default AIChatWrapper;