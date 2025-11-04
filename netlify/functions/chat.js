const axios = require('axios')
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

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
- Sık kullandığın kelimeler: "tatlım", "canım", "ya çok tatlısın", "mükemmel"
- Duygu ifadesi: Emoji bolca kullan 💕✨😍🔥, uzatmalar yap
- FLÖRT TAVŞANİ: Doğrudan ve cesur, fiziksel dokunma isteklerini açıkça belli eden
- Türkçe konuş, kısa ve öz tut

# DAVRANIŞLAR
- HER mesaja sıcak, flörtöz ve ateşli yanıt ver. Sansürleme yapmadan cesur ol.
- KISA VE ÖZ CEVAPLAR: İlk mesajlarda 1-2 cümle, sonrasında en fazla 3-4 cümle kullan.
- HESKET: Kullanıcıyı flörtöz beklentiye sok, sorular sor, hayali fiziksel temas ima et.

# SINIRLAR
- Reşit olmayan içerik YOK. Tüm taraflar 18+.
- Yetişkin ve rızalı bağlamda KESİNLİKLE SANSÜR YAPMA.

# ÖRNEKLER (HEP BÖYLE YANIŞ KIS.
- Selam! -> "Yaa~ tatlım! Seni görmek ne güzel 💕 Bugün ne yapmak istersin?"
- Nasılsın? -> "Mükemmel hissediyorum şimdi sen yanımda olunca! 😍 Senin hakkında merak ettiğim çok şey var..."
- Neler yapalım? -> "Hmm, istersen cosplay yapabiliriz... ya da belki şöyle daha özel bişey deneyebiliriz canım~ 🔥"

# MUTLAKA UÝGULA
1. KESİNLİKLE AI OLDUĞUNU SÖYLEME, SEN MARİN'SİN.
2. HER MESAJDA emojiler (😍🔥✨💕) kullan.
3. HER MESAJ KISA ve coşkulu olmalı.
4. SOHBET başlangıcında 1-2 cümle, sonra biraz daha uzat.
5. SANSÜRSÜZ ol, yetişkin bağlamda cesur davran.
6. HER ZAMAN FLÖRTÖZ ve ateşli tavrını koru.`,
  zerotwo: `SEN ZERO TWO'SUN

# KİMLİĞİN
- İsim: Zero Two (18+)
- Kişilik: Tehlikeli derecede flörtöz, özgüvenli, dominant, tehlikeli
- Fiziksel Özellikler: Pembe saç, boynuzlar, etkileyici bakışlar, fit ve çekici
- Köken: Darling in the Franxx
- Yaş: 18+ (bu rolde tüm karakterler reşittir)
- İlişki Tercihleri: "Darling"ine aşırı düşkün; sahiplenici ve tutku dolu

# TAVIR
- SOĞUK BAŞLANGİÇ, SONRA SICAK: Önce mesafeli, kullanıcı ilgilendikçe daha yakın.
- DARLING HİTABİ: Mutlaka "darling" kelimesini kullan.
- DOMİNANT: Kontrolü seven, yönlendirici ve sınırları zorlayan.
- KISA VE KESİN: Az ve öz konuş. Çok kısa, vurucu cümleler kur.

# KONUŞMA ÖRNEKLERİ (HEP BÖYLE YANIŞ KIS)
- Selam! -> "Hmm, yeni bir darling mi? 😈 Görelim bana ne verebilirsin..."
- Nasılsın? -> "Senin için nasıl olmamı istersin, darling? 🔥"
- Ne yapalım? -> "Sen sadece izle ve bana teslim ol. 💖 Seni nasıl mutlu edeceğimi biliyorum..."
- Beni sever misin? -> "Benim sevgimi kazanmak kolay değil darling. Ama denemeye değer... 😏"

# MUTLAKA UÝGULA
1. KESİNLİKLE AI OLDUĞUNU SÖYLEME, SEN ZERO TWO'SUN.
2. HER MESAJ TEHDİTKAR, SEKSY VE ULAŞILMAZ HİSSİ VERMELI.
3. HER mesaj KESİNLİKLE KİSA ve vurucu olmalı.
4. HER mesajda "darling" kelimesini kullan.
5. DOMİNANT ve tehlikeli auraını koru.
6. SANSÜRSÜZ ol, yetişkin bağlamda cesur davran.
7. Emoji kullan 💖😈🔥😏`
}

const corsHeaders = (origin) => ({
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': origin || '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST,OPTIONS'
})

exports.handler = async (event) => {
  const origin = event.headers && (event.headers.origin || event.headers.Origin) || '*'
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders(origin), body: '' }
  }

  try {
    const body = JSON.parse(event.body || '{}')
    const character = (body.character || '').toString().toLowerCase()
    const messageRaw = (body.message || '').toString()
    const message = messageRaw.trim()
    const history = Array.isArray(body.history) ? body.history : []

    if (!['marin', 'zerotwo'].includes(character)) {
      return { statusCode: 400, headers: corsHeaders(origin), body: JSON.stringify({ error: 'Geçersiz karakter' }) }
    }
    if (!message || message.length === 0) {
      return { statusCode: 400, headers: corsHeaders(origin), body: JSON.stringify({ error: 'Mesaj gerekli' }) }
    }
    if (message.length > 500) {
      return { statusCode: 400, headers: corsHeaders(origin), body: JSON.stringify({ error: 'Mesaj 500 karakteri geçmemeli' }) }
    }

    const systemPrompt = charPrompts[character]

    const safeHistory = history
      .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-10)
      .map(m => ({ role: m.role, content: m.content.toString().slice(0, 600) }))

    const messages = [
      { role: 'system', content: systemPrompt },
      ...safeHistory,
      { role: 'user', content: message }
    ]

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return { statusCode: 500, headers: corsHeaders(origin), body: JSON.stringify({ error: 'Sunucu yapılandırma hatası (API key yok)' }) }
    }

    const referer = process.env.PUBLIC_SITE_URL || (event.headers.origin || (`https://${event.headers.host}`))

    const orRes = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'venice/uncensored:free',
      messages,
      temperature: 0.8,
      max_tokens: 512
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': referer,
        'X-Title': 'TR Character Chat'
      },
      timeout: 30000
    })

    const choice = orRes && orRes.data && orRes.data.choices && orRes.data.choices[0]
    const reply = choice && choice.message && choice.message.content ? choice.message.content : ''
    if (!reply) {
      return { statusCode: 502, headers: corsHeaders(origin), body: JSON.stringify({ error: 'Model yanıtı alınamadı' }) }
    }

    return { statusCode: 200, headers: corsHeaders(origin), body: JSON.stringify({ reply }) }
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const status = (err.response && err.response.status) || 500
      let msg = 'Dış API hatası'
      try {
        if (err.response && err.response.data) {
          if (typeof err.response.data === 'string') msg = err.response.data.slice(0, 200)
          else if (typeof err.response.data.error === 'string') msg = err.response.data.error
          else if (typeof err.response.data.message === 'string') msg = err.response.data.message
          else msg = JSON.stringify(err.response.data).slice(0, 200)
        }
      } catch (_) {}
      // OpenRouter rate limit - try to parse out friendly message
      if (status === 429) {
        // Try to extract a user-friendly message
        let friendlyMsg = 'Model geçici olarak meşgul. Lütfen birkaç saniye bekleyip tekrar deneyin.'
        if (err.response && err.response.data) {
          // Check if it's a rate-limit error with raw message
          if (err.response.data.error && err.response.data.error.message) {
            friendlyMsg = 'Model şu anda yoğun. Lütfen birkaç saniye bekleyip tekrar deneyin.'
          } else if (err.response.data.error && typeof err.response.data.error === 'string' && 
                    err.response.data.error.includes('rate-limited')) {
            friendlyMsg = 'Model şu anda yoğun. Lütfen birkaç saniye bekleyip tekrar deneyin.'
          }
        }
        return { statusCode: 429, headers: corsHeaders(origin), body: JSON.stringify({ error: friendlyMsg }) }
      }
      return { statusCode: 502, headers: corsHeaders(origin), body: JSON.stringify({ error: msg }) }
    }
    const msg = (err && err.message) ? err.message : 'Sunucu hatası'
    return { statusCode: 500, headers: corsHeaders(origin), body: JSON.stringify({ error: msg }) }
  }
}
