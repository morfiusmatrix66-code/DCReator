import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Tilt from 'react-parallax-tilt'
import './App.css'
import './leads.css'
import { submitLead } from './lib/api'
import LeadModal from './components/LeadModal'

function GlassTilt({ children }) {
  return (
    <Tilt
      tiltMaxAngleX={20} tiltMaxAngleY={20} perspective={1000} scale={1.03}
      glareEnable={true} maxGlare={0.3} glareColor="#ffffff" glarePosition="all"
      transitionSpeed={400} gyroscope={true} className="tilt-wrapper"
    >
      {children}
    </Tilt>
  )
}

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  const [addons, setAddons] = useState([])
  const [formData, setFormData] = useState({ name: '', email: '' })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [leadModalOpen, setLeadModalOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Привет! Я AI-ассистент D Creator. Чем могу помочь?' }
  ])
  const [aiInput, setAiInput] = useState('')

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setIsMenuOpen(false)
  }

  const services = [
    { icon: '↗️', title: 'Web Development', desc: 'Frontend, Backend, Next.js, React, PWA и масштабируемые платформы.' },
    { icon: '✈️', title: 'Telegram Mini Apps', desc: 'TMA, Web Apps, боты, платёжные системы и интеграции с CRM.' },
    { icon: '📱', title: 'Mobile Apps', desc: 'iOS & Android разработка под ключ с публикацией в сторы.' },
    { icon: '🎨', title: 'UI/UX Design', desc: 'Продуктовый дизайн, прототипирование, UI-киты и дизайн-системы.' },
    { icon: '☁️', title: 'DevOps & Cloud', desc: 'AWS, Docker, CI/CD, мониторинг и настройка инфраструктуры.' },
    { icon: '📈', title: 'SEO & SMM', desc: 'Продвижение, контент, аналитика и рост ключевых метрик.' }
  ]

  const configServices = [
    { id: 'web', name: 'Веб-разработка', price: 80000, time: '2-4 недели' },
    { id: 'tma', name: 'Telegram Mini Apps', price: 60000, time: '1-3 недели' },
    { id: 'mobile', name: 'Мобильное приложение', price: 150000, time: '4-8 недели' },
    { id: 'design', name: 'UI/UX Дизайн', price: 40000, time: '1-2 недели' }
  ]

  const addonsList = [
    { id: 'seo', name: 'SEO Оптимизация', price: 15000 },
    { id: 'admin', name: 'Админ-панель', price: 25000 },
    { id: 'support', name: 'Поддержка 3 мес.', price: 20000 },
    { id: 'analytics', name: 'Аналитика', price: 10000 }
  ]

  const process = [
    { step: '01', title: 'Брифинг', desc: 'Изучаем бизнес, формируем ТЗ и смету' },
    { step: '02', title: 'Дизайн', desc: 'Прототипы, UI-кит, согласование макетов' },
    { step: '03', title: 'Разработка', desc: 'Код, интеграции, промежуточные демо' },
    { step: '04', title: 'Тестирование', desc: 'QA, багфиксинг, нагрузочное тестирование' },
    { step: '05', title: 'Запуск', desc: 'Деплой, аналитика, обучение команды' }
  ]

  const technologies = [
    { name: 'React', icon: '⚛️' }, { name: 'TypeScript', icon: '📘' },
    { name: 'Node.js', icon: '🟢' }, { name: 'Python', icon: '🐍' },
    { name: 'Docker', icon: '🐳' }, { name: 'AWS', icon: '☁️' },
    { name: 'Figma', icon: '🎨' }, { name: 'Vite', icon: '🚀' }, { name: 'Git', icon: '🔀' }
  ]

  const features = [
    { icon: '📋', title: 'Прозрачная отчётность', desc: 'Держим вас в курсе на каждом этапе' },
    { icon: '✅', title: 'Гарантия качества', desc: 'Проверяем каждый продукт перед запуском' },
    { icon: '🛡️', title: 'Поддержка после запуска', desc: 'Всегда на связи 24/7' }
  ]

  const toggleAddon = (id) => {
    setAddons(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id])
  }

  const calculateTotalNumber = () => {
    let total = selectedService ? configServices.find(s => s.id === selectedService).price : 0
    addons.forEach(id => {
      const addon = addonsList.find(a => a.id === id)
      if (addon) total += addon.price
    })
    return total
  }
  const calculateTotal = () => calculateTotalNumber().toLocaleString()

  const handleConfigSubmit = async (e) => {
    e.preventDefault()
    if (!selectedService || !formData.name.trim() || !formData.email.trim() || isSubmitting) return
    setIsSubmitting(true)
    setSubmitError('')
    const service = configServices.find(s => s.id === selectedService)
    try {
      await submitLead({
        name: formData.name.trim(),
        email: formData.email.trim(),
        service_id: service.id,
        service_name: service.name,
        addons,
        total: calculateTotalNumber(),
      })
      setIsSubmitted(true)
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

const [isAiLoading, setIsAiLoading] = useState(false)

const handleAiSend = async () => {
  if (!aiInput.trim() || isAiLoading) return
  
  const userMessage = aiInput.trim()
  setMessages(prev => [...prev, { from: 'user', text: userMessage }])
  setAiInput('')
  setIsAiLoading(true)

  try {
    const API_URL = import.meta.env.VITE_API_URL || ''
    const response = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage }),
    })

    if (!response.ok) throw new Error('Ошибка сервера')

    const data = await response.json()
    
    // Имитируем задержку "печатает..." если бэкенд ответил слишком быстро
    setTimeout(() => {
      setMessages(prev => [...prev, { from: 'bot', text: data.reply }])
      setIsAiLoading(false)
    }, data.delay_ms || 800)

  } catch (err) {
    setMessages(prev => [...prev, { 
      from: 'bot', 
      text: 'Извините, сейчас я не могу ответить. Попробуйте позже или напишите на hello@dcreator.dev' 
    }])
    setIsAiLoading(false)
  }
}

  return (
    <div className="app" data-theme={theme}>
      {/* HEADER */}
      <header className="header">
        <div className="container header-content">
          <div className="logo">D<span>Creator</span></div>
          <nav className={`nav ${isMenuOpen ? 'active' : ''}`}>
            <a href="#services" onClick={() => scrollTo('services')}>Услуги</a>
            <a href="#stack" onClick={() => scrollTo('stack')}>Технологии</a>
            <a href="#process" onClick={() => scrollTo('process')}>Процесс</a>
            <a href="#calculator" onClick={() => scrollTo('calculator')}>Конфигуратор</a>
            <a href="#about" onClick={() => scrollTo('about')}>О нас</a>
          </nav>
          <div className="header-actions">
            <button className="theme-toggle" onClick={toggleTheme}>{theme === 'dark' ? '☀️' : '🌙'}</button>
            <button className={`menu-btn ${isMenuOpen ? 'active' : ''}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="container hero-content">
          <motion.div className="hero-text" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="hero-label">DIGITAL DEVELOPMENT STUDIO</div>
            <h1>Разработка будущего<span className="highlight">уже сегодня</span></h1>
            <p>Создаем сложные веб-приложения, Telegram Mini Apps и цифровые продукты. От идеи до production-ready решения за 30 дней.</p>
            <div className="hero-actions">
              <motion.button className="btn-primary" onClick={() => setLeadModalOpen(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                Обсудить проект →
              </motion.button>
              <a href="#calculator" className="btn-secondary" onClick={() => scrollTo('calculator')}>Рассчитать стоимость</a>
            </div>
          </motion.div>
          <motion.div className="hero-image" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.8 }}>
            <div className="hero-image-wrapper">
              <img src="https://cdni.iconscout.com/illustration/premium/thumb/man-coder-programming-on-computer-illustration-download-in-svg-png-gif-file-formats--html-logo-java-web-developer-doing-coding-laptop-software-development-pack-science-technology-illustrations-8226923.png?f=webp" alt="Digital technology" />
              <div className="hero-image-overlay"></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="services" id="services">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="section-label">01 — Наши услуги</div>
            <h2>Комплексный подход к созданию цифровых продуктов</h2>
            <p className="section-subtitle">От идеи до запуска — полный цикл разработки и поддержки вашего продукта.</p>
          </motion.div>
          <div className="services-grid">
            {services.map((service, index) => (
              <motion.div key={index} className="service-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                <div className="service-icon">{service.icon}</div>
                <h3>{service.title}</h3>
                <p>{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TECH STACK */}
      <section className="tech-stack" id="stack">
        <div className="container tech-stack-content">
          <div className="tech-stack-text">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="section-label">02 — Технологический стек</div>
              <h2>Современные<br />технологии</h2>
              <p>Работаем с проверенными инструментами и постоянно следим за новыми решениями.</p>
            </motion.div>
          </div>
          <div className="tech-stack-grid">
            {technologies.map((tech, index) => (
              <GlassTilt key={tech.name}>
                <motion.div className="tech-card" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.05, duration: 0.4 }}>
                  <div className="tech-icon">{tech.icon}</div>
                  <div className="tech-name">{tech.name}</div>
                </motion.div>
              </GlassTilt>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="process" id="process">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="section-label">03 — Как мы работаем</div>
            <h2>Прозрачный и понятный процесс</h2>
            <p className="section-subtitle">От первого запроса до успешного запуска — чёткий план и постоянная коммуникация.</p>
          </motion.div>
          <div className="timeline">
            {process.map((item, index) => (
              <motion.div key={index} className="timeline-item" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                <div className="timeline-number">{item.step}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CONFIGURATOR */}
      <section className="configurator" id="calculator">
        <div className="container">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            Конфигуратор проекта
          </motion.h2>
          <form className="configurator-grid" onSubmit={handleConfigSubmit}>
            <div className="config-left">
              <div className="config-section">
                <h3>1. Выберите тип проекта</h3>
                <div className="service-grid">
                  {configServices.map(service => (
                    <button type="button" key={service.id}
                      className={`service-btn ${selectedService === service.id ? 'active' : ''}`}
                      onClick={() => setSelectedService(service.id)}>
                      <span className="service-name">{service.name}</span>
                      <span className="service-time">{service.time}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="config-section">
                <h3>2. Дополнительные опции</h3>
                <div className="addons-list">
                  {addonsList.map(addon => (
                    <label key={addon.id} className="addon-item">
                      <input type="checkbox" checked={addons.includes(addon.id)} onChange={() => toggleAddon(addon.id)} />
                      <span>{addon.name} (+{addon.price.toLocaleString()} ₽)</span>
                    </label>
                  ))}
                </div>
              </div>
              {!isSubmitted && (
                <div className="config-section">
                  <h3>3. Ваши контакты</h3>
                  <div className="contact-inputs">
                    <input type="text" placeholder="Ваше имя" required minLength={2}
                      value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    <input type="email" placeholder="Email" required
                      value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                </div>
              )}
            </div>
            <div className="config-right">
              <div className="summary-card">
                <h3>Итого</h3>
                {selectedService ? (
                  <>
                    <div className="summary-row">
                      <span>{configServices.find(s => s.id === selectedService).name}</span>
                      <span>{configServices.find(s => s.id === selectedService).price.toLocaleString()} ₽</span>
                    </div>
                    {addons.map(id => {
                      const addon = addonsList.find(a => a.id === id)
                      return (
                        <div key={id} className="addon-row">
                          <span>{addon.name}</span>
                          <span>+{addon.price.toLocaleString()} ₽</span>
                        </div>
                      )
                    })}
                    <div className="summary-total">
                      <span>Всего:</span>
                      <span>{calculateTotal()} ₽</span>
                    </div>
                    {!isSubmitted ? (
                      <>
                        <button type="submit" className="btn-primary full-width"
                          disabled={!formData.name || !formData.email || isSubmitting}>
                          {isSubmitting ? <><span className="spinner" /> Отправляем…</> : 'Отправить заявку'}
                        </button>
                        {submitError && <div className="form-error">{submitError}</div>}
                      </>
                    ) : (
                      <div className="success-message">
                        ✅ Заявка отправлена!<br />Мы свяжемся с вами в течение часа.
                      </div>
                    )}
                  </>
                ) : (
                  <div className="empty-state">Выберите услугу, чтобы рассчитать стоимость</div>
                )}
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* ABOUT */}
      <section className="about" id="about">
        <div className="container about-content">
          <div className="about-left">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="section-label">05 — О нас</div>
              <h2>Партнёр для<br />ваших больших идей</h2>
              <p>DCreator — это команда опытных разработчиков, дизайнеров и аналитиков, которые превращают идеи в работающие цифровые продукты.</p>
              <motion.button className="btn-primary" onClick={() => setLeadModalOpen(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                Обсудить проект →
              </motion.button>
            </motion.div>
          </div>
          <div className="about-right">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <div className="about-stats">
                <div className="stat-item"><div className="stat-number">50+</div><div className="stat-label">завершённых проектов</div></div>
                <div className="stat-item"><div className="stat-number">5</div><div className="stat-label">лет на рынке</div></div>
                <div className="stat-item"><div className="stat-number">98%</div><div className="stat-label">довольных клиентов</div></div>
              </div>
            </motion.div>
          </div>
        </div>
        <div className="container">
          <div className="about-features">
            {features.map((feature, index) => (
              <GlassTilt key={index}>
                <motion.div className="feature-card" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.1, duration: 0.4 }}>
                  <div className="feature-icon">{feature.icon}</div>
                  <h3>{feature.title}</h3>
                  <p>{feature.desc}</p>
                  <div className="feature-arrow">→</div>
                </motion.div>
              </GlassTilt>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
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
              <a href="#process">Процесс</a>
              <a href="#stack">Технологии</a>
              <a href="#calculator">Конфигуратор</a>
            </div>
            <div className="footer-col">
              <h4>Контакты</h4>
              <a href="mailto:hello@dcreator.dev">hello@dcreator.dev</a>
              <a href="https://github.com/morfiusmatrix66-code/DCreator" target="_blank" rel="noreferrer">GitHub</a>
              <button className="footer-link-btn" onClick={() => setLeadModalOpen(true)}>Обсудить проект</button>
            </div>
          </div>
          <div className="footer-bottom">© 2026 D Creator. All rights reserved.</div>
        </div>
      </footer>

      {/* AI ASSISTANT */}
      <motion.button className="ai-fab" onClick={() => setAiOpen(!aiOpen)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>🤖</motion.button>
      <AnimatePresence>
        {aiOpen && (
          <motion.div className="ai-window" initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }}>
            <div className="ai-header"><span>AI-Ассистент</span><button onClick={() => setAiOpen(false)}>✕</button></div>
            <div className="ai-messages">
              {messages.map((m, i) => <div key={i} className={`ai-msg ${m.from}`}>{m.text}</div>)}
            </div>
            <div className="ai-input-row">
              <input value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAiSend()} placeholder="Напишите сообщение..." />
              <button onClick={handleAiSend} disabled={isAiLoading} style={{ opacity: isAiLoading ? 0.6 : 1, cursor: isAiLoading ? 'not-allowed' : 'pointer' }}>
				  {isAiLoading ? '...' : '→'}
				</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <LeadModal open={leadModalOpen} onClose={() => setLeadModalOpen(false)} />
    </div>
  )
}

export default App