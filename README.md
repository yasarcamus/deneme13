# TR AI Karakter Chat

- Backend: Express.js
- Frontend: Vanilla JS
- Model: OpenRouter `venice/uncensored:free`

## Kurulum

1. `.env` dosyasını oluşturun:
```
OPENROUTER_API_KEY=your_openrouter_api_key_here
PORT=3000
```

2. Bağımlılıkları yükleyin:
```
npm install
```

3. Geliştirmede başlatın:
```
npm run dev
```

4. Üretimde başlatın:
```
npm start
```

## Güvenlik
- API key yalnızca backend `.env` içinde tutulur.
- `.gitignore` `.env` ve `node_modules` dizinini dışlar.
- Frontend hiçbir gizli bilgi içermez; istekler `/api/chat` proxy üzerinden gider.

## Netlify (Frontend + Functions)

1. Site Settings → Build & deploy → Environment → Add variables:
```
OPENROUTER_API_KEY=sk-or-v1-...    # tam anahtar (tırnaksız)
PUBLIC_SITE_URL=https://<site-adin>.netlify.app
```

2. Deploys → Clear cache and deploy site

3. Doğrula:
- Deploy ayrıntısında Functions: `chat` görünmeli
- `https://<site-adin>.netlify.app` yüklenmeli
- Network → `/api/chat` çağrısı 200 ve `application/json`

### Sorun Giderme
- 401/403: OpenRouter anahtarının yetkilerini (chat completions) ve Allowed Referers listesinde sitenizi kontrol edin
- 500: Netlify env var eksik olabilir
- `Unexpected end of JSON`: Fonksiyon JSON döndürmüyordur → env varları ve fonksiyon loglarını kontrol edin
