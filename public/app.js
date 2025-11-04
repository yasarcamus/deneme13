const chatEl = document.getElementById('chat')
const formEl = document.getElementById('form')
const inputEl = document.getElementById('input')
const sendBtn = document.getElementById('send')
const counterEl = document.getElementById('counter')
const characterEl = document.getElementById('character')

const API_BASE = (typeof window !== 'undefined' && window.BACKEND_URL) ? window.BACKEND_URL : ''
let history = []

function addMessage(role, text) {
  const row = document.createElement('div')
  row.className = `msg ${role}`
  const bubble = document.createElement('div')
  bubble.className = 'bubble'
  bubble.textContent = text
  row.appendChild(bubble)
  chatEl.appendChild(row)
  chatEl.scrollTop = chatEl.scrollHeight
  if (role === 'user' || role === 'assistant') history.push({ role, content: text })
}

function setLoading(loading) {
  sendBtn.disabled = loading
  sendBtn.textContent = loading ? 'Gönderiliyor…' : 'Gönder'
}

inputEl.addEventListener('input', () => {
  const val = inputEl.value
  counterEl.textContent = `${val.length}/500`
})

formEl.addEventListener('submit', async (e) => {
  e.preventDefault()
  const character = characterEl.value
  const text = inputEl.value.trim()
  if (!text) return
  if (text.length > 500) { alert('Mesaj 500 karakteri geçmemeli'); return }
  addMessage('user', text)
  inputEl.value = ''
  counterEl.textContent = '0/500'
  setLoading(true)
  try {
    const apiBase = (API_BASE || '').replace(/\/+$/, '')
    const res = await fetch(`${apiBase}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ character, message: text, history })
    })
    const ct = res.headers.get('content-type') || ''
    if (!res.ok) {
      let errMsg = 'Sunucu hatası'
      try {
        if (ct.includes('application/json')) {
          const j = await res.json()
          errMsg = (j && (j.error || j.message)) || errMsg
        } else {
          const t = await res.text()
          errMsg = t ? t.slice(0, 200) : errMsg
        }
      } catch (_) {}
      throw new Error(errMsg)
    }
    let data
    if (ct.includes('application/json')) {
      data = await res.json()
    } else {
      const t = await res.text()
      throw new Error(t ? t.slice(0, 200) : 'Beklenmeyen yanıt')
    }
    addMessage('assistant', data.reply)
  } catch (err) {
    let msg = 'Bilinmeyen hata'
    if (err) {
      const m = (err && 'message' in err) ? err.message : err
      if (typeof m === 'string') msg = m
      else {
        try { msg = JSON.stringify(m) } catch (_) { msg = String(m) }
      }
    }
    addMessage('assistant', `Hata: ${msg}`)
  } finally {
    setLoading(false)
  }
})

addMessage('assistant', 'Karakter seç ve mesaj yaz. Tüm karakterler 18+ ve sohbet rızalıdır.')
