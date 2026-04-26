# 🇮🇳 India Election Guide · Matdata Sahayak

An AI-powered chatbot that helps Indian citizens understand the election process — voter registration, EVMs, VVPAT, polling booths, vote counting, and government formation — all powered by ECI knowledge and the Claude AI API.

![India Election Guide Screenshot](https://via.placeholder.com/800x400/FF6B35/FFFFFF?text=India+Election+Guide)

---

## ✨ Features

- 🗳️ **ECI Knowledge Base** — Pre-loaded with accurate electoral facts from ECI guidelines
- 🌐 **Multi-language** — Responds in Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati, Punjabi, or English
- 🤖 **Claude AI** — Powered by Anthropic's Claude Sonnet
- ♿ **Accessible** — ARIA roles, keyboard navigation, screen-reader friendly
- 📱 **Responsive** — Works on mobile, tablet, and desktop
- 🎨 **Tricolor theme** — Inspired by the Indian national flag

---

## 🚀 Quick Start (Local Development)

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/india-election-guide.git
cd india-election-guide
```

### 2. Add your API key (dev only)

Open `src/config.js` and set your Anthropic API key:

```js
const ANTHROPIC_API_KEY = "sk-ant-..."; // ← your key here
```

> ⚠️ **Never commit your API key.** See the Production Setup section below.

### 3. Serve locally

Any static server works. Examples:

```bash
# Using Python
python3 -m http.server 3000

# Using Node.js npx
npx serve .

# Using VS Code Live Server extension
# Right-click index.html → Open with Live Server
```

Open `http://localhost:3000` in your browser.

---

## 🏗️ Project Structure

```
india-election-guide/
├── index.html          # Main HTML shell
├── src/
│   ├── config.js       # API key, model config, ECI system prompt
│   ├── app.js          # Chat logic, API calls, markdown renderer
│   └── style.css       # All styles (tricolor theme, responsive layout)
├── .gitignore
├── README.md
└── package.json        # Optional: for deployment scripts
```

---

## 🔒 Production Setup (Secure API Key)

**Never expose your Anthropic API key client-side in production.**

Use a lightweight backend proxy instead:

### Option A: Cloudflare Workers (free tier)

```js
// worker.js
export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "https://yourdomain.com",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "POST",
        },
      });
    }

    const body = await request.json();
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY, // set in Worker env variables
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://yourdomain.com",
      },
    });
  },
};
```

Then update `app.js`:
```js
const endpoint = "https://your-worker.YOUR_SUBDOMAIN.workers.dev";
```

### Option B: Express.js proxy

```bash
npm install express cors
```

```js
// server.js
const express = require("express");
const cors    = require("cors");

const app = express();
app.use(cors({ origin: "https://yourdomain.com" }));
app.use(express.json());

app.post("/api/chat", async (req, res) => {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type":      "application/json",
      "x-api-key":         process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(req.body),
  });
  const data = await response.json();
  res.json(data);
});

app.listen(3001);
```

---

## 🌍 Deployment Options

### Vercel / Netlify (Static)
```bash
# Vercel
npx vercel

# Netlify
npx netlify deploy --prod
```

### GitHub Pages
1. Go to **Settings → Pages**
2. Source: `main` branch, `/ (root)`
3. Your app will be live at `https://YOUR_USERNAME.github.io/india-election-guide`

> Note: For GitHub Pages, you must use a backend proxy for the API key.

---

## 🛠️ Customization

### Add more topic chips
In `index.html`, add a button inside `.quick-topics`:
```html
<button class="topic-chip" onclick="sendChip(this)">NRI Voting</button>
```

### Update the knowledge base
Edit the `SYSTEM_PROMPT` constant in `src/config.js` — add more ECI facts, update policies, or add new FAQs.

### Change the model
In `src/config.js`:
```js
const MODEL = "claude-opus-4-20250514"; // use Opus for more complex answers
```

---

## 🧩 Tech Stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | Vanilla HTML, CSS, JavaScript |
| AI        | Anthropic Claude API (claude-sonnet-4-20250514) |
| Fonts     | DM Sans, Tiro Devanagari Hindi (Google Fonts) |
| Hosting   | Any static host (GitHub Pages, Vercel, Netlify) |

No build tools, no frameworks, no dependencies — pure vanilla web.

---

## 📋 ECI Knowledge Coverage

| Topic | Covered |
|-------|---------|
| Voter Registration (Forms 6, 7, 8) | ✅ |
| EPIC / Voter ID | ✅ |
| Alternate IDs on polling day | ✅ |
| EVM (Electronic Voting Machine) | ✅ |
| VVPAT | ✅ |
| Polling day procedures | ✅ |
| Polling booth location | ✅ |
| Vote counting process | ✅ |
| Government formation | ✅ |
| Model Code of Conduct | ✅ |
| NOTA | ✅ |
| Postal ballot | ✅ |
| NRI voting | ✅ |
| C-Vigil app | ✅ |
| Grievance portals | ✅ |

---

## 📞 Official ECI Resources

- **Voter Helpline:** 1950 (toll-free)
- **Website:** [voters.eci.gov.in](https://voters.eci.gov.in)
- **C-Vigil App:** Report MCC violations in real-time
- **Suvidha Portal:** [suvidha.eci.gov.in](https://suvidha.eci.gov.in)

---

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.

This project is for citizen education purposes only. It is not affiliated with or endorsed by the Election Commission of India. Always verify important information at [eci.gov.in](https://eci.gov.in).

---

## 🤝 Contributing

Pull requests welcome! To contribute:

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/add-postal-ballot-faq`
3. Commit changes: `git commit -m 'Add postal ballot FAQ coverage'`
4. Push and open a PR

Please keep all election information accurate and sourced from official ECI materials.
