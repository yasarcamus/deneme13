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
