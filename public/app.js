const chatEl = document.getElementById('chat')
const formEl = document.getElementById('form')
const inputEl = document.getElementById('input')
const sendBtn = document.getElementById('send')
const counterEl = document.getElementById('counter')
const characterEl = document.getElementById('character')

const API_BASE = (typeof window !== 'undefined' && window.BACKEND_URL) ? window.BACKEND_URL : ''
let history = []

// Karakter değişiminde sohbeti temizle
characterEl.addEventListener('change', () => {
  // Tüm sohbet baloncuklarını temizle (ilk karşılama mesajı hariç)
  while (chatEl.children.length > 1) {
    chatEl.removeChild(chatEl.lastChild)
  }
  
  // History'yi temizle ve ilk karşılama mesajını ekle
  history = []
  
  // Seçilen karaktere göre karşılama mesajı göster
  const character = characterEl.value
  let greeting = ''
  
  if (character === 'marin') {
    greeting = 'Yaaa~ merhaba canım! Marin burada! 😍 Nasılsın? Bugiin ne yapalım?'
  } else if (character === 'zerotwo') {
    greeting = 'Hmm, beni mi seçtin darling? 🔥 Zero Two emrindeydi...'
  }
  
  addMessage('assistant', greeting)
  
  // CSS efektleri - karaktere göre tema değiştirme
  document.body.setAttribute('data-character', character)
})

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

// Enter ile gönderme
inputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    formEl.requestSubmit()
  }
})

formEl.addEventListener('submit', async (e) => {
  e.preventDefault()
  const character = characterEl.value
  const text = inputEl.value.trim()
  if (!text) return
  addMessage('user', text)
  inputEl.value = ''
  counterEl.textContent = '0/500'
  setLoading(true)
  
  // Track retries
  let retries = 0
  const maxRetries = 3
  
  try {
    async function sendRequest() {
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
      return data
    }
    
    // Try with retries
    let success = false
    while (!success && retries <= maxRetries) {
      try {
        const data = await sendRequest()
        addMessage('assistant', data.reply)
        success = true
      } catch (err) {
        let msg = 'Bilinmeyen hata'
        if (err) {
          const m = (err && 'message' in err) ? err.message : err
          if (typeof m === 'string') msg = m
          else {
            try { msg = JSON.stringify(m) } catch (_) { msg = String(m) }
          }
        }
        
        // Check if it's a rate-limit error (429) and we should retry
        const is429 = msg && (
          msg.includes('429') || 
          msg.includes('rate-limit') || 
          msg.includes('yoğun') || 
          msg.includes('meşgul')
        )
        
        if (is429 && retries < maxRetries) {
          retries++
          const waitTime = retries * 2000 // Exponential backoff: 2s, 4s, 6s
          // Sessizce yeniden dene, mesaj gösterme
          await new Promise(resolve => setTimeout(resolve, waitTime))
        } else {
          // Either not a 429 or we're out of retries
          addMessage('assistant', `Hata: ${msg}`)
          success = true // Stop retry loop
        }
      }
    }
  } catch (err) {
    addMessage('assistant', `Beklenmeyen hata: ${err.message || 'Bilinmeyen'}`)
  } finally {
    setLoading(false)
  }
})

addMessage('assistant', 'Karakter seç ve mesaj yaz. Tüm karakterler 18+ ve sohbet rızalıdır.')
