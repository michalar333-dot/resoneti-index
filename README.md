# RESONETI Index

Diagnostický dotazník připravenosti firmy na technologickou změnu (metodika 4R: Readiness, Response, Resistance, Results) s okamžitým AI vyhodnocením přes Gemini, e-mailem s reportem a ukládáním odpovědí do Firebase.

## Jak aplikace funguje

- **Frontend:** React + Vite + Tailwind (složka `src/`)
- **Server:** Express (`server.ts`) – endpoint `POST /api/evaluate` volá Gemini a posílá report e-mailem (SMTP)
- **Databáze:** Firebase Firestore (konfigurace `firebase-applet-config.json`, pravidla `firestore.rules`)
- **Admin přehled odpovědí:** přihlášení přes Google (jen e-maily povolené ve `firestore.rules`)

Bez `GEMINI_API_KEY` aplikace běží v demo režimu (vyhodnocení se spočítá bez AI). Bez SMTP údajů se e-mail jen zaloguje.

## Spuštění na počítači

Potřebujete Node.js 20 nebo novější.

```bash
npm install
cp .env.example .env    # a doplňte GEMINI_API_KEY (případně SMTP)
npm run dev             # http://localhost:3000
```

## Nasazení na web (Render.com, zdarma)

GitHub kód jen ukládá – aplikace potřebuje server (kvůli tajnému Gemini klíči a odesílání e-mailů), proto ji spustíme na Renderu napojeném na tento repozitář:

1. Přihlaste se na https://render.com přes GitHub.
2. **New → Blueprint** → vyberte tento repozitář. Render si načte `render.yaml`.
3. Vyplňte proměnné: `GEMINI_API_KEY` (z https://aistudio.google.com/apikey) a SMTP údaje.
4. Po nasazení dostanete adresu typu `https://resoneti-index.onrender.com`.
5. **Firebase:** v konzoli Firebase (projekt `handy-passkey-n9pl1`) → Authentication → Settings → Authorized domains přidejte novou doménu, jinak nebude fungovat přihlášení do admin přehledu.

Každý další `git push` do větve `main` se na Renderu nasadí automaticky.

> Free plán na Renderu po 15 minutách nečinnosti usíná – první načtení pak trvá cca 30–60 s. Placený plán (od 7 $/měs.) tohle odstraní.

## Proměnné prostředí

| Proměnná | Popis |
|---|---|
| `GEMINI_API_KEY` | Klíč ke Gemini API (povinný pro AI vyhodnocení) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Odesílání reportu e-mailem |
| `PORT` | Port serveru (výchozí 3000, Render nastaví sám) |
