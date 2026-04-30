import React, { useState, useEffect, useRef } from 'react';
import "./ai-chat.css";

interface Message {
    id: string;
    type: 'user' | 'assistant';
    content: string;
    timestamp?: string;
}

interface AIChatProps {
    suggestedQuestions: string[];
    welcomeMessage: string;
}
type Attachment = {
    type: 'image' | 'file' | 'link';
    src?: string;
    alt?: string;
    href?: string;
    name?: string;
    label?: string;
    target?: '_blank' | '_self';
};

type ProductCard = {
    id: string;
    title: string;
    subtitle?: string;
    description?: string;
    meta?: string[];
    image?: string;
    href?: string;
};

type BotResponse = {
    reply?: string;
    intent?: string;
    answer?: string;
    attachments?: Attachment[];
    cards?: ProductCard[];
};

const normalizeResponse = (raw: unknown): string => {
    // Если строка
    if (typeof raw === 'string') {
        try {
            const parsed = JSON.parse(raw);
            return extractTextFromResponse(parsed);
        } catch {
            return raw;
        }
    }

    // Если объект
    if (raw && typeof raw === 'object') {
        return extractTextFromResponse(raw);
    }

    return 'Извините, не удалось обработать ответ';
};

const extractTextFromResponse = (data: any): string => {
    // Приоритет: reply > answer > response.answer > response.reply
    if (data.reply) return data.reply;
    if (data.answer) return data.answer;
    if (data.response?.reply) return data.response.reply;
    if (data.response?.answer) return data.response.answer;

    // Если есть структурированный ответ
    if (data.response && typeof data.response === 'object') {
        return data.response.answer || data.response.reply || JSON.stringify(data.response);
    }

    return 'Получен ответ, но не удалось извлечь текст';
};

// Генерация ID сессии
const generateSessionId = (): string => {
    return `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
};

// Форматирование времени
const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
    });
};

const AIChat: React.FC<AIChatProps> = ({
    suggestedQuestions,
    welcomeMessage
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string>('');
    const [unreadCount, setUnreadCount] = useState(0);

    // Состояния для анимации печати
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [displayedText, setDisplayedText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const chatWindowRef = useRef<HTMLDivElement>(null);

    // Загрузка сохраненной сессии и истории
    useEffect(() => {
        const storedSessionId = localStorage.getItem('chat_session_id');
        const storedMessages = localStorage.getItem('chat_messages');

        if (storedSessionId) {
            setSessionId(storedSessionId);
        } else {
            const newSessionId = generateSessionId();
            setSessionId(newSessionId);
            localStorage.setItem('chat_session_id', newSessionId);
        }

        if (storedMessages) {
            try {
                const parsed = JSON.parse(storedMessages) as Message[];
                setMessages(parsed);
            } catch (error) {
                console.error('Failed to parse stored messages:', error);
                setMessages([]);
            }
        }
    }, []);

    // Анимация печати текста в кнопке
    useEffect(() => {
        if (isOpen || !suggestedQuestions.length) return;

        const currentFullText = suggestedQuestions[currentQuestion];
        let timeout: ReturnType<typeof setTimeout>;

        if (!isDeleting) {
            // Печатаем текст
            if (displayedText.length < currentFullText.length) {
                timeout = setTimeout(() => {
                    setDisplayedText(currentFullText.slice(0, displayedText.length + 1));
                }, 50 + Math.random() * 50); // Случайная скорость для реалистичности
            } else {
                // Пауза перед удалением
                timeout = setTimeout(() => setIsDeleting(true), 2000);
            }
        } else {
            // Удаляем текст
            if (displayedText.length > 0) {
                timeout = setTimeout(() => {
                    setDisplayedText(displayedText.slice(0, -1));
                }, 30 + Math.random() * 30);
            } else {
                // Переходим к следующему вопросу
                setIsDeleting(false);
                setCurrentQuestion((prev) => (prev + 1) % suggestedQuestions.length);
            }
        }

        return () => clearTimeout(timeout);
    }, [displayedText, isDeleting, currentQuestion, isOpen, suggestedQuestions]);

    // Сохранение сообщений в localStorage
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem('chat_messages', JSON.stringify(messages));
        }
    }, [messages]);

    // Автоскролл к последнему сообщению
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    // Инициализация чата с приветствием (только если нет сообщений)
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([
                {
                    id: Date.now().toString(),
                    type: 'assistant',
                    content: welcomeMessage,
                    timestamp: new Date().toISOString()
                }
            ]);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen, welcomeMessage, messages.length]);

    // Подсчет непрочитанных сообщений
    useEffect(() => {
        if (!isOpen && messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.type === 'assistant' && !lastMessage.timestamp?.includes('read')) {
                setUnreadCount(prev => prev + 1);
            }
        }
    }, [messages, isOpen]);

    // Сброс счетчика непрочитанных при открытии
    useEffect(() => {
        if (isOpen) {
            setUnreadCount(0);
        }
    }, [isOpen]);

    // Закрытие по Escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen]);

    // Закрытие при клике вне окна
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (chatWindowRef.current && !chatWindowRef.current.contains(e.target as Node)) {
                const target = e.target as HTMLElement;
                if (!target.closest('.ai-assistant-btn')) {
                    setIsOpen(false);
                }
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Блокировка скролла body при открытом чате
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Очистка истории
    const clearHistory = () => {
        const newSessionId = generateSessionId();
        setSessionId(newSessionId);
        localStorage.setItem('chat_session_id', newSessionId);
        localStorage.removeItem('chat_messages');
        setMessages([]);
        setUnreadCount(0);

        // Добавляем приветственное сообщение заново
        setMessages([
            {
                id: Date.now().toString(),
                type: 'assistant',
                content: welcomeMessage,
                timestamp: new Date().toISOString()
            }
        ]);
    };

    // Отправка сообщения
    const sendMessage = async (content: string) => {
        if (!content.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            type: 'user',
            content: content.trim(),
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: content.trim(),
                    history: messages.slice(-10),
                    session_id: sessionId
                }),
            });

            if (!response.ok) throw new Error(`API error: ${response.status}`);

            const data = await response.json();

            // Нормализуем ответ в текст
            const replyText = normalizeResponse(data);

            // Проверяем наличие структурированных данных для расширенного отображения
            const hasStructuredData = data.attachments || data.cards || data.response?.attachments;

            let finalContent = replyText;

            // Если есть структурированные данные, можно их отобразить особым образом
            if (hasStructuredData) {
                const attachments = data.attachments || data.response?.attachments;
                const cards = data.cards || data.response?.cards;

                if (attachments?.length) {
                    finalContent += '\n\n📎 Вложения: ' + attachments.map((a: any) =>
                        a.type === 'image' ? '🖼️ Изображение' :
                            a.type === 'file' ? '📄 ' + (a.name || 'Файл') :
                                '🔗 ' + (a.label || 'Ссылка')
                    ).join(', ');
                }

                if (cards?.length) {
                    finalContent += '\n\n📦 Товары: ' + cards.map((c: any) => c.title).join(', ');
                }
            }

            const assistantMessage: Message = {
                id: Date.now().toString(),
                type: 'assistant',
                content: finalContent,
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, assistantMessage]);

        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage: Message = {
                id: Date.now().toString(),
                type: 'assistant',
                content: '⚠️ Извините, не удалось получить ответ. Проверьте соединение и попробуйте позже.',
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(inputValue);
    };

    const handleSuggestedQuestion = (question: string) => {
        sendMessage(question);
    };

    return (
        <>
            {/* Кнопка открытия чата */}
            <label onClick={() => setIsOpen(!isOpen)} htmlFor="aiAssistantInput" className="ai-assistant-label">
                <button
                    className={`ai-assistant-btn mobile-only ${isOpen ? 'active' : ''}`}
                    id="aiAssistantBtn"
                    
                >
                    <img src="/icons/brain.svg" alt="" />
                    <span>ИИ-ассистент</span>
                </button>
                {!isOpen && (
                    <div className="typing-placeholder">
                        <span className="typing-text">
                            {displayedText}
                            <span className="cursor">|</span>
                        </span>
                    </div>
                )}

                {/* Кнопка (всегда видна) */}

            </label>

            {/* Окно чата */}
            <div className={`ai-chat-window ${isOpen ? 'open' : ''}`} ref={chatWindowRef}>
                <div className="ai-chat-header">
                    <h3> ИИ Ассистент</h3>
                    <div className="header-actions">
                        {messages.length > 1 && (
                            <button
                                onClick={clearHistory}
                                className="clear-history-btn but"
                                title="Очистить историю"
                            >
                                Очистить историю
                            </button>
                        )}
                        <button onClick={() => setIsOpen(false)}>✕</button>
                    </div>
                </div>

                <div className="ai-chat-messages">
                    {messages.map((message, index) => (
                        <div
                            key={message.id}
                            className={`message ${message.type}`}
                        >
                            <div className="message-content">
                                {message.content}
                                <span className="message-time">
                                    {message.timestamp && formatTime(message.timestamp)}
                                </span>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="message assistant">
                            <div className="message-content typing">
                                <span>.</span><span>.</span><span>.</span>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Подсказки для быстрого старта */}
                {messages.length === 1 && suggestedQuestions.length > 0 && (
                    <div className="suggested-questions">
                        <p className="suggested-title">💡 Попробуйте спросить:</p>
                        <div className="questions-grid">
                            {suggestedQuestions.map((question, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSuggestedQuestion(question)}
                                    className="suggested-question"
                                    disabled={isLoading}
                                >
                                    {question}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="ai-chat-input">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={isLoading ? "Пожалуйста, подождите..." : "Введите сообщение..."}
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading || !inputValue.trim()}>
                        {isLoading ? '...' : 'Отправить'}
                    </button>
                </form>
            </div>
        </>
    );
};

export default AIChat;