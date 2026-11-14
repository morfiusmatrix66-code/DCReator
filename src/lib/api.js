const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function submitLead(payload) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15000)

  try {
    const res = await fetch(`${API_URL}/api/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    if (!res.ok) {
      let message = `Ошибка сервера (${res.status})`
      try {
        const data = await res.json()
        if (typeof data?.detail === 'string') message = data.detail
        else if (Array.isArray(data?.detail)) message = 'Проверьте правильность заполнения полей.'
      } catch { /* тело не JSON — оставляем сообщение по статусу */ }
      throw new Error(message)
    }

    return await res.json()
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('Сервер не отвечает. Запустите бэкенд и попробуйте снова.')
    if (err instanceof TypeError) throw new Error('Не удалось соединиться с сервером. Проверьте, что бэкенд запущен на :8000.')
    throw err
  } finally {
    clearTimeout(timer)
  }
}