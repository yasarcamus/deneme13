const chatEl = document.getElementById('chat')
const formEl = document.getElementById('form')
const inputEl = document.getElementById('input')
const sendBtn = document.getElementById('send')
const counterEl = document.getElementById('counter')
const characterEl = document.getElementById('character')

const API_BASE = (typeof window !== 'undefined' && window.BACKEND_URL) ? window.BACKEND_URL : ''
let history = []
let typingIndicator = null

// LocalStorage anahtarı oluşturma yardımcısı
const storageKey = (character) => `chat_history_${character}`
const currentHistoryKey = 'current_character'

// Sohbet geçmişleri için global map
const characterHistories = {}

// Sohbet geçmişi için localStorage
const saveHistory = (character, history) => {
  // Hafızada tut
  characterHistories[character] = [...history]
  
  // LocalStorage'a kaydet
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(storageKey(character), JSON.stringify(history))
    localStorage.setItem(currentHistoryKey, character)
  }
}

const loadHistory = (character) => {
  // Önce hafızadan kontrol et
  if (characterHistories[character]) {
    return [...characterHistories[character]]
  }
  
  // Yoksa localStorage'dan yükle
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem(storageKey(character))
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        characterHistories[character] = parsed // Hafızaya da kopyala
        return parsed
      } catch (e) {
        console.error('Geçmiş yükleme hatası:', e)
        return []
      }
    }
  }
  return []
}

// Tüm geçmiş temizleme (geliştirme amaçlı)
const clearAllHistories = () => {
  Object.keys(characterHistories).forEach(char => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(storageKey(char))
    }
  })
  Object.keys(characterHistories).forEach(key => delete characterHistories[key])
}

// Karakter değişiminde sohbeti yükle/değiştir
// URL'den karakter yükle
function loadCharacterFromHash() {
  const hash = window.location.hash.substring(1);
  if (hash && document.querySelector(`#character option[value="${hash}"]`)) {
    characterEl.value = hash;
    // Tema renklerini hemen güncelle
    document.body.setAttribute('data-character', hash);
    return true;
  }
  return false;
}

// Sayfa yüklenirken URL hash kontrolü
window.addEventListener('load', () => {
  if (loadCharacterFromHash()) {
    // Eğer URL'den karakter yüklendiyse event tetikleyelim
    const event = new Event('change');
    characterEl.dispatchEvent(event);
  }
});

// URL hash değiştiğinde karakter güncelle
window.addEventListener('hashchange', () => {
  if (loadCharacterFromHash()) {
    // Eğer URL'den karakter yüklendiyse event tetikleyelim
    const event = new Event('change');
    characterEl.dispatchEvent(event);
  }
});

characterEl.addEventListener('change', () => {
  // Tüm sohbet baloncuklarını temizle
  while (chatEl.children.length > 0) {
    chatEl.removeChild(chatEl.lastChild)
  }
  
  const character = characterEl.value
  
  // URL'yi güncelle
  window.location.hash = character
  
  // LocalStorage'dan bu karakter için geçmiş varsa yükle
  const savedHistory = loadHistory(character)
  if (savedHistory && savedHistory.length > 0) {
    // Geçmiş sohbeti göster
    history = savedHistory
    history.forEach(msg => {
      if (msg.role === 'user' || msg.role === 'assistant') {
        const row = document.createElement('div')
        row.className = `msg ${msg.role}`
        const bubble = document.createElement('div')
        bubble.className = 'bubble'
        bubble.textContent = msg.content
        row.appendChild(bubble)
        chatEl.appendChild(row)
      }
    })
  } else {
    // Yeni sohbet başlat
    history = []
    
    // Seçilen karaktere göre karşılama mesajı göster
    let greeting = ''
    if (character === 'marin') {
      greeting = 'Yaaa~ merhaba canım! Marin burada! 😍 Nasılsın? Bugiin ne yapalım?'
    } else if (character === 'zerotwo') {
      greeting = 'Hmm, beni mi seçtin darling? 🔥 Zero Two emrindeydi...'
    }
    
    addMessage('assistant', greeting)
  }
  
  // Scroll to bottom
  chatEl.scrollTop = chatEl.scrollHeight
  
  // CSS efektleri - karaktere göre tema değiştirme
  document.body.setAttribute('data-character', character)
})

// Yazma animasyonu gösterme
function showTyping() {
  // Varsa öncekini kaldır
  hideTyping()
  
  // Karakter tipine göre özel mesajlar
  let typingText = ''
  const character = characterEl.value
  
  if (character === 'marin') {
    typingText = 'yazıyor...'
  } else if (character === 'zerotwo') {
    typingText = 'düşünüyor...'
  } else {
    typingText = 'yazıyor...'
  }
  
  typingIndicator = document.createElement('div')
  typingIndicator.className = 'typing msg assistant'
  
  const bubble = document.createElement('div')
  bubble.className = 'bubble'
  
  const dots = document.createElement('div')
  dots.className = 'typing-dots'
  dots.innerHTML = '<span></span><span></span><span></span>'
  
  bubble.appendChild(dots)
  typingIndicator.appendChild(bubble)
  chatEl.appendChild(typingIndicator)
  chatEl.scrollTop = chatEl.scrollHeight
}

// Yazma animasyonunu gizleme
function hideTyping() {
  if (typingIndicator && typingIndicator.parentNode) {
    typingIndicator.parentNode.removeChild(typingIndicator)
    typingIndicator = null
  }
}

function addMessage(role, text) {
  // Önce yazma animasyonunu kaldır
  hideTyping()
  
  const row = document.createElement('div')
  row.className = `msg ${role}`
  const bubble = document.createElement('div')
  bubble.className = 'bubble'
  
  // Fiziksel eylemleri (*ile çevrili metinleri*) <em> tag ile çevir
  if (role === 'assistant') {
    // Yıldızlar (*) arasındaki metinleri <em> tag ile değiştir
    const processedText = text.replace(/\*(.*?)\*/g, '<em>$1</em>')
    bubble.innerHTML = processedText
  } else {
    bubble.textContent = text
  }
  
  row.appendChild(bubble)
  chatEl.appendChild(row)
  chatEl.scrollTop = chatEl.scrollHeight
  
  if (role === 'user' || role === 'assistant') {
    history.push({ role, content: text })
    // Sadece başarılı mesajları kaydederiz
    saveHistory(characterEl.value, history)
  }
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
  
  // Yazıyor göstergesi
  showTyping()
  
  // Track retries
  let retries = 0
  const maxRetries = 5 // 3'ten 5'e çıkarıldı - daha fazla deneme
  
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
          const waitTime = Math.pow(2, retries) * 1500 // Exponential backoff: 3s, 6s, 12s, 24s, 48s
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
    hideTyping() // Hata durumunda yazıyor göstergesini kaldır
    addMessage('assistant', `Beklenmeyen hata: ${err.message || 'Bilinmeyen'}`)
  } finally {
    setLoading(false)
  }
})

addMessage('assistant', 'Karakter seç ve mesaj yaz. Tüm karakterler 18+ ve sohbet rızalıdır.')
