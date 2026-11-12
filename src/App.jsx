import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AnimatedCounter } from './components/AnimatedCounter'
import { ProjectConfigurator } from './components/ProjectConfigurator'
import { AIAssistant } from './components/AIAssistant'
import { useTheme } from './hooks/useTheme'
import './App.css'

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeService, setActiveService] = useState(null);
  const { theme, toggleTheme } = useTheme();

  const scrollToConfigurator = () => {
    const element = document.getElementById('calculator');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const services = [
    { title: "Web Development", desc: "React, Next.js, Node.js, Python", icon: "💻", details: "SPA, SSR, PWA, микросервисы" },
    { title: "Telegram Mini Apps", desc: "TMA, Web Apps, боты, платежи", icon: "✈️", details: "Нативные приложения внутри Telegram" },
    { title: "Mobile Apps", desc: "iOS & Android, React Native", icon: "📱", details: "Кроссплатформенная разработка" },
    { title: "UI/UX Design", desc: "Figma, прототипирование, UX-аудит", icon: "🎨", details: "Дизайн-системы и адаптивные макеты" },
    { title: "DevOps & Cloud", desc: "AWS, Docker, CI/CD, мониторинг", icon: "☁️", details: "Настройка серверов и Kubernetes" },
    { title: "SEO & SMM", desc: "Продвижение, контент, аналитика", icon: "📈", details: "Техническая оптимизация и таргет" }
  ];

  return (
    <div className="app">
      <header className="header">
        <div className="container header-content">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="logo">
            D<span>Creator</span>
          </motion.div>

          <nav className={`nav ${isMenuOpen ? 'active' : ''}`}>
            <a href="#services" onClick={() => setIsMenuOpen(false)}>Услуги</a>
            <a href="#stack" onClick={() => setIsMenuOpen(false)}>Технологии</a>
            <a href="#process" onClick={() => setIsMenuOpen(false)}>Процесс</a>
            <a href="#calculator" onClick={() => setIsMenuOpen(false)}>Конфигуратор</a>
            <a href="#about" onClick={() => setIsMenuOpen(false)}>О нас</a>
          </nav>

          <div className="header-actions">
            <motion.button className="theme-toggle" onClick={toggleTheme} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </motion.button>
            <button className={`menu-btn ${isMenuOpen ? 'active' : ''}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="hero-decoration hero-badge-1">⚡ Быстрый деплой</div>
        <div className="hero-decoration hero-badge-2">🔒 Безопасность</div>

        <div className="container hero-content">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}>
            <div className="hero-label">DCreator Development Studio</div>
            <h1>Разработка будущего<br /><span className="gradient-text">уже сегодня</span></h1>
            <p>Создаем сложные веб-приложения, Telegram Mini Apps и цифровые продукты. От идеи до production-ready решения за 30 дней.</p>

            <div className="hero-actions">
              <motion.button className="btn-primary btn-glow" onClick={scrollToConfigurator} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                Обсудить проект <span className="arrow">→</span>
              </motion.button>
              <motion.a href="#services" className="btn-secondary" whileHover={{ x: 5 }}>
                Смотреть услуги
              </motion.a>
            </div>

            <motion.div className="hero-trust" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
              <div className="trust-icon">👥</div>
              <div className="trust-text">
                <strong>50+ успешных кейсов</strong>
                <span>в портфолио студии</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="services" id="services">
        <div className="container">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>Наши услуги</motion.h2>
          <motion.div className="cards-grid" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            {services.map((service, index) => (
              <motion.div key={index} className={`card ${activeService === index ? 'active' : ''}`} variants={fadeInUp} whileHover={{ y: -10 }} onHoverStart={() => setActiveService(index)} onHoverEnd={() => setActiveService(null)}>
                <div className="icon">{service.icon}</div>
                <h3>{service.title}</h3>
                <p>{service.desc}</p>
                <AnimatePresence>
                  {activeService === index && (
                    <motion.div className="card-details" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                      <p>{service.details}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="stats" id="stats">
        <div className="container">
          <motion.div className="stats-grid" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            <motion.div className="stat-item" variants={fadeInUp}>
              <div className="stat-number"><AnimatedCounter end={50} suffix="+" /></div>
              <div className="stat-label">Завершенных проектов</div>
            </motion.div>
            <motion.div className="stat-item" variants={fadeInUp}>
              <div className="stat-number"><AnimatedCounter end={5} /></div>
              <div className="stat-label">Лет на рынке</div>
            </motion.div>
            <motion.div className="stat-item" variants={fadeInUp}>
              <div className="stat-number"><AnimatedCounter end={98} suffix="%" /></div>
              <div className="stat-label">Довольных клиентов</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="tech-stack" id="stack">
        <div className="container">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>Технологический стек</motion.h2>
          <div className="stack-grid">
            {['React', 'TypeScript', 'Node.js', 'Python', 'Docker', 'AWS', 'Figma', 'Git'].map((tech, i) => (
              <motion.div key={tech} className="stack-item" initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                {tech}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="process" id="process">
        <div className="container">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>Как мы работаем</motion.h2>
          <div className="timeline">
            {[
              { step: '01', title: 'Брифинг', desc: 'Изучаем задачу, формируем ТЗ и смету' },
              { step: '02', title: 'Дизайн', desc: 'Прототипы, UI-кит, согласование макетов' },
              { step: '03', title: 'Разработка', desc: 'Код, интеграции, промежуточные демо' },
              { step: '04', title: 'Тестирование', desc: 'QA, багфиксинг, нагрузочное тестирование' },
              { step: '05', title: 'Запуск', desc: 'Деплой, настройка аналитики, обучение' }
            ].map((item, i) => (
              <motion.div key={i} className="timeline-item" initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="timeline-step">{item.step}</div>
                <div className="timeline-content">
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <ProjectConfigurator />

      <section className="about" id="about">
        <div className="container about-content">
          <motion.div className="about-text" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <h2>Почему DCreator?</h2>
            <p>Мы не просто пишем код — мы решаем бизнес-задачи. Наша команда состоит из senior-разработчиков с опытом от 5 лет.</p>
            <ul className="about-list">
              <li>✅ Прозрачная отчетность каждые 3 дня</li>
              <li>✅ Гарантия качества и тестирование</li>
              <li>✅ Поддержка после запуска 24/7</li>
            </ul>
          </motion.div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="logo">D<span>Creator</span></div>
              <p>Разрабатываем цифровые продукты, которые решают бизнес-задачи.</p>
            </div>
            <div className="footer-col">
              <h4>Услуги</h4>
              <a href="#services">Web Development</a>
              <a href="#services">Telegram Mini Apps</a>
              <a href="#services">Mobile Apps</a>
            </div>
            <div className="footer-col">
              <h4>Компания</h4>
              <a href="#about">О нас</a>
              <a href="#stack">Технологии</a>
              <a href="#calculator">Конфигуратор</a>
            </div>
            <div className="footer-col">
              <h4>Контакты</h4>
              <a href="mailto:hello@dcreator.dev">hello@dcreator.dev</a>
              <a href="#">Telegram</a>
              <a href="#">GitHub</a>
            </div>
          </div>
          <div className="footer-bottom">© 2026 DCreator. All rights reserved.</div>
        </div>
      </footer>

      <AIAssistant />
    </div>
  )
}

export default App