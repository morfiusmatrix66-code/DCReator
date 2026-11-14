import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'

const Chevron = () => (
  <svg className="dc-select__chevron" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const Check = () => (
  <svg className="dc-select__check" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export default function Select({ value, onChange, options, labelId, id }) {
  const autoId = useId()
  const baseId = id ?? autoId
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [pos, setPos] = useState(null)
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const listRef = useRef(null)

  const selectedIndex = Math.max(0, options.findIndex((o) => o.id === value))
  const selected = options[selectedIndex]

  useLayoutEffect(() => {
    if (!open) return
    const update = () => {
      const el = triggerRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const below = window.innerHeight - r.bottom - 16
      const above = r.top - 16
      const flip = below < 200 && above > below
      setPos({
        left: r.left,
        width: r.width,
        maxHeight: Math.max(150, Math.min(300, flip ? above : below)),
        ...(flip ? { bottom: window.innerHeight - r.top + 8 } : { top: r.bottom + 8 }),
      })
    }
    update()
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (rootRef.current?.contains(e.target) || listRef.current?.contains(e.target)) return
      setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  useEffect(() => {
    if (!open) return
    listRef.current?.querySelector(`[data-index="${activeIndex}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, open])

  const openList = () => { setActiveIndex(selectedIndex); setOpen(true) }
  const choose = (i) => { onChange(options[i].id); setOpen(false); triggerRef.current?.focus() }

  const onKeyDown = (e) => {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); openList() }
      return
    }
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); setActiveIndex((i) => Math.min(options.length - 1, i + 1)); break
      case 'ArrowUp': e.preventDefault(); setActiveIndex((i) => Math.max(0, i - 1)); break
      case 'Home': e.preventDefault(); setActiveIndex(0); break
      case 'End': e.preventDefault(); setActiveIndex(options.length - 1); break
      case 'Enter':
      case ' ': e.preventDefault(); choose(activeIndex); break
      case 'Escape': e.preventDefault(); e.stopPropagation(); setOpen(false); break
      case 'Tab': setOpen(false); break
      default:
        if (e.key.length === 1 && /\S/.test(e.key)) {
          const idx = options.findIndex((o) => o.name.toLowerCase().startsWith(e.key.toLowerCase()))
          if (idx >= 0) setActiveIndex(idx)
        }
    }
  }

  return (
    <div className="dc-select" ref={rootRef}>
      <button
        type="button"
        id={`${baseId}-trigger`}
        ref={triggerRef}
        className={`dc-select__trigger${open ? ' is-open' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${baseId}-listbox`}
        aria-labelledby={labelId ? `${labelId} ${baseId}-value` : undefined}
        aria-activedescendant={open ? `${baseId}-opt-${options[activeIndex].id}` : undefined}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
      >
        <span className="dc-select__icon" aria-hidden="true">{selected.icon}</span>
        <span className="dc-select__value" id={`${baseId}-value`}>
          <span className="dc-select__name">{selected.name}</span>
          <span className="dc-select__hint">{selected.hint}</span>
        </span>
        <Chevron />
      </button>

      {createPortal(
        <AnimatePresence>
          {open && pos && (
            <motion.ul
              ref={listRef}
              data-dc-select-open="true"
              id={`${baseId}-listbox`}
              role="listbox"
              aria-labelledby={labelId}
              className="dc-select__list"
              style={pos}
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
            >
              {options.map((opt, i) => (
                <li
                  key={opt.id}
                  id={`${baseId}-opt-${opt.id}`}
                  data-index={i}
                  role="option"
                  aria-selected={opt.id === value}
                  className={[
                    'dc-select__option',
                    i === activeIndex ? 'is-active' : '',
                    opt.id === value ? 'is-selected' : '',
                  ].filter(Boolean).join(' ')}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => choose(i)}
                >
                  <span className="dc-select__opt-icon" aria-hidden="true">{opt.icon}</span>
                  <span className="dc-select__opt-body">
                    <span className="dc-select__opt-name">{opt.name}</span>
                    <span className="dc-select__opt-hint">{opt.hint}</span>
                  </span>
                  {opt.id === value && <Check />}
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  )
}