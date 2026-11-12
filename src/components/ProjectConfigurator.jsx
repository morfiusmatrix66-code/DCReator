import { useState } from 'react';
import { motion } from 'framer-motion';

export function ProjectConfigurator() {
  const [selectedService, setSelectedService] = useState(null);
  const [addons, setAddons] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const services = [
    { id: 'web', name: 'Веб-разработка', price: 80000, time: '2-4 недели' },
    { id: 'tma', name: 'Telegram Mini Apps', price: 60000, time: '1-3 недели' },
    { id: 'mobile', name: 'Мобильное приложение', price: 150000, time: '4-8 недель' },
    { id: 'design', name: 'UI/UX Дизайн', price: 40000, time: '1-2 недели' },
  ];

  const addonsList = [
    { id: 'seo', name: 'SEO Оптимизация', price: 15000 },
    { id: 'admin', name: 'Админ-панель', price: 25000 },
    { id: 'support', name: 'Поддержка 3 мес.', price: 20000 },
    { id: 'analytics', name: 'Аналитика', price: 10000 },
  ];

  const toggleAddon = (id) => {
    setAddons(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  const calculateTotal = () => {
    let total = selectedService ? services.find(s => s.id === selectedService).price : 0;
    addons.forEach(addonId => {
      const addon = addonsList.find(a => a.id === addonId);
      if (addon) total += addon.price;
    });
    return total.toLocaleString();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedService && formData.name && formData.email) {
      setIsSubmitted(true);
    }
  };

  return (
    <section className="configurator" id="calculator">
      <div className="container">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Конфигуратор проекта
        </motion.h2>

        <div className="configurator-grid">
          <div className="config-left">
            <div className="config-section">
              <h3>1. Выберите тип проекта</h3>
              <div className="service-grid">
                {services.map(service => (
                  <button
                    key={service.id}
                    className={`service-btn ${selectedService === service.id ? 'active' : ''}`}
                    onClick={() => setSelectedService(service.id)}
                  >
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
                    <input
                      type="checkbox"
                      checked={addons.includes(addon.id)}
                      onChange={() => toggleAddon(addon.id)}
                    />
                    <span>{addon.name} (+{addon.price.toLocaleString()} ₽)</span>
                  </label>
                ))}
              </div>
            </div>

            {!isSubmitted && (
              <div className="config-section">
                <h3>3. Ваши контакты</h3>
                <form onSubmit={handleSubmit} className="contact-inputs">
                  <input
                    type="text"
                    placeholder="Ваше имя"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </form>
              </div>
            )}
          </div>

          <div className="config-right">
            <div className="summary-card">
              <h3>Итого</h3>
              {selectedService ? (
                <>
                  <div className="summary-row">
                    <span>{services.find(s => s.id === selectedService).name}</span>
                    <span>{services.find(s => s.id === selectedService).price.toLocaleString()} ₽</span>
                  </div>
                  {addons.map(addonId => {
                    const addon = addonsList.find(a => a.id === addonId);
                    return (
                      <div key={addonId} className="addon-row">
                        <span>{addon.name}</span>
                        <span>+{addon.price.toLocaleString()} ₽</span>
                      </div>
                    );
                  })}
                  <div className="summary-total">
                    <span>Всего:</span>
                    <span>{calculateTotal()} ₽</span>
                  </div>
                  {!isSubmitted ? (
                    <button
                      type="submit"
                      className="btn-primary full-width"
                      onClick={handleSubmit}
                      disabled={!formData.name || !formData.email}
                    >
                      Отправить заявку
                    </button>
                  ) : (
                    <div className="success-message">
                      ✅ Заявка отправлена!<br />
                      Мы свяжемся с вами в течение часа.
                    </div>
                  )}
                </>
              ) : (
                <div className="empty-state">
                  Выберите услугу, чтобы рассчитать стоимость
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}