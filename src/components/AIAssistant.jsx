import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Привет! Я AI-ассистент DCreator. Чем могу помочь?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { from: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, {
        from: 'bot',
        text: 'Отличный вопрос! Напишите нам на hello@dcreator.dev — менеджер ответит в течение часа.'
      }]);
    }, 800);
  };

  return (
    <>
      <motion.button
        className="ai-fab"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        🤖
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="ai-window"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
          >
            <div className="ai-header">
              <span>AI-Ассистент</span>
              <button onClick={() => setIsOpen(false)}>✕</button>
            </div>
            <div className="ai-messages">
              {messages.map((m, i) => (
                <div key={i} className={`ai-msg ${m.from}`}>{m.text}</div>
              ))}
            </div>
            <div className="ai-input-row">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Напишите сообщение..."
              />
              <button onClick={handleSend}>→</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}