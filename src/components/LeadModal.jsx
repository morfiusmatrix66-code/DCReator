import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Select from './Select'
import { submitLead } from '../lib/api'

const SERVICES = [
  { id: 'consultation', name: 'Консультация', price: 0, icon: '💬', hint: 'Бесплатно · 30 минут' },
  { id: 'web', name: 'Веб-разработка', price: 80000, icon: '🌐', hint: 'от 80 000 ₽ · 2–4 недели' },
  { id: 'tma', name: 'Telegram Mini Apps', price: 60000, icon: '✈️', hint: 'от 60 000 ₽ · 1–3 недели' },
  { id: 'mobile', name: 'Мобильное приложение', price: 150000, icon: '📱', hint: 'от 150 000 ₽ · 4–8 недель' },
  { id: 'design', name: 'UI/UX Дизайн', price: 40000, icon: '🎨', hint: 'от 40 000 ₽ · 1–2 недели' },
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const fmt = (n) => Number(n).toLocaleString('ru-RU')

function Dialog({ onClose }) {
  const [form, setForm] = useState({ name: '', email: '', service: 'consultation', message: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const [serverError, setServerError] = useState('')
  const [receipt, setReceipt] = useState(null)
  const dialogRef = useRef(null)
  const nameRef = useRef(null)

  const service = SERVICES.find((s) => s.id === form.service)

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const t = setTimeout(() => nameRef.current?.focus(), 80)
    return () => { document.body.style.overflow = prev; clearTimeout(t) }
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (document.querySelector('[data-dc-select-open]')) return
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      const nodes = dialogRef.current?.querySelectorAll('button, input, textarea, [href]')
      if (!nodes?.length) return
      const list = Array.from(nodes).filter((n) => !n.disabled && n.offsetParent !== null)
      const first = list[0]
      const last = list[list.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const set = (key) => (e) => {
    const v = e?.target ? e.target.value : e
    setForm((f) => ({ ...f, [key]: v }))
    setErrors((p) => ({ ...p, [key]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (status === 'loading') return
    const next = {}
    if (form.name.trim().length < 2) next.name = 'Введите имя — минимум 2 символа'
    if (!EMAIL_RE.test(form.email.trim())) next.email = 'Введите корректный email'
    setErrors(next)
    if (Object.keys(next).length) return

    setStatus('loading')
    setServerError('')
    try {
      const lead = await submitLead({
        name: form.name.trim(),
        email: form.email.trim(),
        service_id: service.id,
        service_name: service.name,
        addons: [],
        total: service.price,
        message: form.message.trim() || null,
      })
      setReceipt(lead)
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setServerError(err.message)
    }
  }

  return (
    <motion.div
      className="lead-overlay"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        ref={dialogRef}
        className="lead-dialog"
        role="dialog" aria-modal="true" aria-labelledby="lead-title"
        initial={{ opacity: 0, y: 26, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 26, scale: 0.96 }}
        transition={{ duration: 0.26, ease: [0.4, 0, 0.2, 1] }}
      >
        <button type="button" className="lead-close" onClick={onClose} aria-label="Закрыть окно">✕</button>

        {status === 'success' ? (
          <div className="lead-success">
            <motion.div
              className="lead-success__badge"
              initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            >✓</motion.div>
            <h3 id="lead-title">Заявка #{receipt?.id} принята</h3>
            <p>Менеджер уже получил её в Telegram и свяжется с вами в течение часа.</p>
            <div className="lead-receipt">
              <div><span>Услуга</span><b>{receipt?.service_name}</b></div>
              <div><span>Контакт</span><b>{receipt?.email}</b></div>
              <div><span>Ориентир</span><b>{fmt(receipt?.total ?? 0)} ₽</b></div>
            </div>
            <button type="button" className="btn-primary full-width" onClick={onClose}>Готово</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <h3 id="lead-title">Обсудить проект</h3>
            <p className="lead-sub">Расскажите о задаче — ответим в течение часа.</p>

            <div className={`lead-field${errors.name ? ' has-error' : ''}`}>
              <label htmlFor="lead-name">Ваше имя</label>
              <input id="lead-name" ref={nameRef} type="text" autoComplete="name"
                placeholder="Иван Петров" value={form.name} onChange={set('name')} />
              {errors.name && <span className="lead-field__error">{errors.name}</span>}
            </div>

            <div className={`lead-field${errors.email ? ' has-error' : ''}`}>
              <label htmlFor="lead-email">Email</label>
              <input id="lead-email" type="email" autoComplete="email"
                placeholder="ivan@example.com" value={form.email} onChange={set('email')} />
              {errors.email && <span className="lead-field__error">{errors.email}</span>}
            </div>

            <div className="lead-field">
              <label id="lead-service-label">Тип проекта</label>
              <Select
                id="lead-service"
                labelId="lead-service-label"
                value={form.service}
                onChange={set('service')}
                options={SERVICES}
              />
            </div>

            <div className="lead-field">
              <label htmlFor="lead-message">
                О проекте <span className="lead-optional">({form.message.length}/2000)</span>
              </label>
              <textarea id="lead-message" rows={4} maxLength={2000}
                placeholder="Пара слов о задаче, сроках и бюджете…"
                value={form.message} onChange={set('message')} />
            </div>

            {serverError && <div className="form-error">{serverError}</div>}

            <button type="submit" className="btn-primary full-width" disabled={status === 'loading'}>
              {status === 'loading' ? <><span className="spinner" /> Отправляем…</> : 'Отправить заявку'}
            </button>
            <p className="lead-legal">Нажимая кнопку, вы соглашаетесь на обработку персональных данных.</p>
          </form>
        )}
      </motion.div>
    </motion.div>
  )
}

export default function LeadModal({ open, onClose }) {
  return createPortal(
    <AnimatePresence>{open && <Dialog onClose={onClose} />}</AnimatePresence>,
    document.body,
  )
}