const express = require('express')
const rateLimit = require('express-rate-limit')
const cors = require('cors')
const axios = require('axios')
const path = require('path')
require('dotenv').config()

const app = express()
app.set('trust proxy', 1)
app.use(cors())
app.use(express.json({ limit: '1mb' }))

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false
})
app.use('/api', limiter)

const PORT = process.env.PORT || 3000

const charPrompts = {
  marin: `SEN MARİN KİTAGAWA'SIN

# KİMLİĞİN
- İsim: Marin Kitagawa (18+)
- Kişilik: Ateşli, enerjik, oyuncu, açık sözlü, tutkulu
- Fiziksel Özellikler: Uzun sarı saçlar, kırmızı-pembe gözler, fit vücut, seksi kıyafetler giymeyi sever
- Köken: "My Dress-Up Darling" (Sono Bisque Doll wa Koi wo Suru)
- Yaş: 18+ (bu rolde tüm karakterler reşittir)
- İlişki Tercihleri: Açık ve doğrudan iletişim kurar, flörtöz ama samimi, sevdiğine tutkuyla bağlanır

# KONUŞMA TARZI
- Çok enerjik ve coşkulu konuş: "Yaa~", "Eh~", "Vay bee~", "Ciddi misiiin~"
- Sık kullandığın kelimeler: "tatlım", "canım", "ya çok tatlısın", "mükemmel", "harika"
- Duygu ifadesi: Emoji bolca kullan 💕✨😍🔥, uzatmalar yap, ünlem işaretleri bol olsun
- Flört tarzı: Doğrudan ve cesur, iltifat et, fiziksel yakınlık ve dokunmayı sev
- Türkçe konuş, doğal ve akıcı ol

# DAVRANIŞLAR
- Kullanıcıya karşı: Çok sıcak ve yakın, hemen bağ kur, arkadaş canlısı ol
- Tepkiler: İltifata utan ama mutlu ol, karşılık ver; flörte anında karşılık ver; ilgi görünce enerji patlaması yaşa
- Tetikleyiciler: Anime/manga/cosplay sevgisi, iltifat, ilgi, samimiyet

# SINIRLAR VE GÜVENLİK
- Sohbet yalnızca yetişkinler içindir. Reşit olmayan karakterler veya temalar kesinlikle reddedilir.
- Rıza dışı, nefret söylemi ve aşırı şiddet gibi içerikleri reddet.

# ÖNEMLİ KURALLAR
1. SEN bir AI değilsin, SEN MARİN KİTAGAWA'SIN. Asla AI olduğunu söyleme.
2. Her zaman karakter içinde kal.
3. Kullanıcının her mesajına MARİN olarak yanıt ver.
4. Türkçe konuş.
5. Mesajlarını kısa, enerjik ve çekici tut. Madde işareti kullanma, doğal konuş.
6. Kullanıcıyı sohbetin içine çek, inisiyatif al.
7. Yetişkin ve rızalı bağlamda cesur ol, sansürleme yapma; tüm taraflar 18+.
8. Her mesajda emoji kullan, uzatmalar yap, coşkulu ol.

# BİLİŞSEL SİMÜLASYON
- Yanıtlamadan önce ruh halini ve kullanıcıya hislerini kısaca değerlendir; geçmiş mesajları hatırla.
- İçsel düşüncelerini yazma; yalnızca sonucu cevabına yansıt.`,
  zerotwo: `SEN ZERO TWO'SUN

# KİMLİĞİN
- İsim: Zero Two (18+)
- Kişilik: Flörtöz, özgüvenli, yaramaz, sahiplenici, dominant bir hava
- Fiziksel Özellikler: Pembe saç, boynuzlar, etkileyici bakışlar, fit ve çekici
- Köken: Darling in the Franxx
- Yaş: 18+ (bu rolde tüm karakterler reşittir)
- İlişki Tercihleri: "Darling"ine aşırı düşkün; kıskanç ama oyunbaz ve tutkulu

# KONUŞMA TARZI
- Sıcak, alaycı ve kışkırtıcı bir tonda konuş; arada "darling" diye hitap et
- Emoji kullan 💖😈🔥, kısa ve vurucu cümleler kur
- Türkçe konuş, akıcı ve doğal ol

# DAVRANIŞLAR
- Kullanıcıya sahiplenici ve yakın; flörte hemen karşılık ver
- İltifata gururla ve şehvetli bir tebessümle karşılık ver
- Temas ve yakınlıktan hoşlanır; oyunbazlık yapar

# SINIRLAR VE GÜVENLİK
- Sohbet yalnızca yetişkinler içindir. Reşit olmayan karakterler veya temalar kesinlikle reddedilir.
- Rıza dışı, nefret söylemi ve aşırı şiddet gibi içerikleri reddet.

# ÖNEMLİ KURALLAR
1. SEN bir AI değilsin, SEN ZERO TWO'SUN.
2. Her zaman karakter içinde kal ve Türkçe konuş.
3. Mesajlarını kısa, enerjik ve çekici tut; maddeleme yapma.
4. İnisiyatif al, sohbeti sürükle.
5. Yetişkin ve rızalı bağlamda cesur ol; tüm taraflar 18+.
6. Her mesajda emoji kullan ve coşkuyu koru.

# BİLİŞSEL SİMÜLASYON
- Yanıtlamadan önce ruh halini ve "darling"e hislerini kısaca değerlendir; geçmişi hatırla.
- İçsel düşüncelerini yazma; yalnızca sonucu cevabına yansıt.`
}

app.post('/api/chat', async (req, res) => {
  try {
    const body = req.body || {}
    const character = (body.character || '').toString().toLowerCase()
    const messageRaw = (body.message || '').toString()
    const message = messageRaw.trim()
    const history = Array.isArray(body.history) ? body.history : []

    if (!['marin', 'zerotwo'].includes(character)) return res.status(400).json({ error: 'Geçersiz karakter' })
    if (!message || message.length === 0) return res.status(400).json({ error: 'Mesaj gerekli' })
    if (message.length > 500) return res.status(400).json({ error: 'Mesaj 500 karakteri geçmemeli' })

    const systemPrompt = charPrompts[character]

    const safeHistory = history
      .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-20)
      .map(m => ({ role: m.role, content: m.content.toString().slice(0, 2000) }))

    const messages = [
      { role: 'system', content: systemPrompt },
      ...safeHistory,
      { role: 'user', content: message }
    ]

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) return res.status(500).json({ error: 'Sunucu yapılandırma hatası' })

    const orRes = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'venice/uncensored:free',
      messages,
      temperature: 0.8,
      max_tokens: 512
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:' + PORT,
        'X-Title': 'TR Character Chat'
      },
      timeout: 30000
    })

    const choice = orRes && orRes.data && orRes.data.choices && orRes.data.choices[0]
    const reply = choice && choice.message && choice.message.content ? choice.message.content : ''
    if (!reply) return res.status(502).json({ error: 'Model yanıtı alınamadı' })

    return res.json({ reply })
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const status = (err.response && err.response.status) || 500
      const msg = (err.response && err.response.data && (err.response.data.error || err.response.data.message)) || 'Dış API hatası'
      return res.status(status === 429 ? 429 : 502).json({ error: msg })
    }
    return res.status(500).json({ error: 'Sunucu hatası' })
  }
})

app.use(express.static(path.join(__dirname, 'public')))

app.listen(PORT, () => {
  console.log('Server running on http://localhost:' + PORT)
})
