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
    const data = await res.json()
    if (!res.ok) throw new Error(data && data.error ? data.error : 'Sunucu hatası')
    addMessage('assistant', data.reply)
  } catch (err) {
    addMessage('assistant', `Hata: ${(err && err.message) || 'Bilinmeyen hata'}`)
  } finally {
    setLoading(false)
  }
})

addMessage('assistant', 'Karakter seç ve mesaj yaz. Tüm karakterler 18+ ve sohbet rızalıdır.')
