# SBNTYM

**Real-time AI fraud detection powered by Gen Digital guidelines**

SBNTYM is a Chrome browser extension that uses advanced AI (Google Gemini 2.0 Flash) to analyze web content for scam indicators in real-time. Users can select any portion of a webpage, and SBNTYM will provide an instant risk assessment based on Norton Lock Policy and Gen Digital fraud detection guidelines.

![SBNTYM Banner](https://img.shields.io/badge/SBNTYM-AI%20Fraud%20Detection-blue?style=for-the-badge)
![Version](https://img.shields.io/badge/version-0.1.0-green?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-orange?style=flat-square)

---

## 💭 The Story Behind SBNTYM

This extension was born from a deeply personal experience. My grandmother lost $3,500 to a sophisticated deepfake phone call scam—a painful reminder of how vulnerable our loved ones are to modern cyber threats.

I created SBNTYM as an educational project to better understand cyberattacks and fraud detection mechanisms. The development is based on **Norton Lock Policy** and **Gen Digital fraud detection guidelines**, with special reference to their **2025 Quarterly Report** on emerging scam patterns.

> **Special Thanks**: The name "SBNTYM" and the project's direction were inspired and honored by **Jennifer Johnson** (Restoration Manager at Gen Digital) and her incredible team. Their expertise and dedication to protecting consumers from fraud have been invaluable to this project's development.

This has been a fun and deeply educational journey that taught me not just about technical implementation, but about the real-world impact of cybersecurity. Every line of code is written with the hope that it might help prevent someone else's grandmother from falling victim to these increasingly sophisticated scams.

**SBNTYM** - **S**cam **B**am **N**o **T**hank **Y**ou **M**a'am 🛡️

---

## 🌟 Features

- **🎯 Selective Scanning**: Snip and analyze specific portions of any webpage
- **🤖 AI-Powered Analysis**: Leverages Google Gemini 2.0 Flash for intelligent threat detection
- **📊 Risk Scoring**: Precise risk scores (0-100) with detailed explanations
- **🛡️ Policy-Based Detection**: Aligned with Norton Lock Policy and Gen Digital fraud detection guidelines
- **⚡ Real-time Results**: Instant analysis with loading indicators
- **🎨 Premium Dark UI**: Modern, glassmorphic design with smooth animations
- **📝 Actionable Insights**: Specific recommendations for each detected threat

---

## 🏗️ Architecture

SBNTYM consists of three main components:

### 1. **Backend Server** (`server.js`)
- Express.js server running on `localhost:8787`
- Handles `/scan` endpoint for image analysis
- Integrates with Google Gemini API for AI-powered detection
- Implements Norton Lock Policy and Gen Digital fraud detection logic

### 2. **Chrome Extension**
- **Popup** (`popup.html`, `popup.js`): User interface for initiating scans
- **Background Service Worker** (`background.js`): Coordinates screenshot capture and cropping
- **Content Script** (`content.js`): Handles user selection overlay and results display
- **Styles** (`styles.css`): Premium dark mode UI with glassmorphism

### 3. **AI Detection Engine**
- Google Gemini 2.0 Flash vision model
- Custom prompt engineering for scam detection
- Structured JSON output for deterministic UI rendering

For detailed architecture diagrams, see [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **Chrome Browser** (or Chromium-based browser)
- **Google Gemini API Key** ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/tonnguyen291/Machine-Learning-Project.git
cd Scam
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Set Up Environment Variables

Create a `.env` file or export your API key:

```bash
export GEMINI_API_KEY="your-api-key-here"
# OR
export GOOGLE_API_KEY="your-api-key-here"
```

#### 4. Start the Backend Server

```bash
npm start
```

You should see:
```
SBNTYM backend running on http://localhost:8787
```

#### 5. Load the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Select the `extension` folder from this project
5. The SBNTYM icon should appear in your extensions toolbar

---

## 📖 Usage

### Scanning a Webpage

1. **Navigate** to any webpage you want to analyze
2. **Click** the SBNTYM extension icon in your toolbar
3. **Click** the "New Scan" button in the popup
4. **Select** the area you want to analyze by clicking and dragging
5. **Wait** for the AI analysis (typically 2-5 seconds)
6. **Review** the results overlay with:
   - Risk score (0-100)
   - Verdict (Safe, Suspicious, Dangerous)
   - Risk factors detected
   - Recommended actions

### Understanding Results

#### Risk Scores
- **0-49**: Likely Safe (green theme)
- **50-79**: Suspicious (yellow theme)
- **80-100**: Dangerous (red theme)

#### Detection Criteria
SBNTYM analyzes content for:
- **Visual Deception**: Fake lock icons, OS warning spoofing, browser chrome imitation
- **Heuristic Analysis**: High-entropy strings, mismatched branding, scareware patterns
- **Urgency & Coercion**: Demands for immediate action, fear-based messaging
- **Identity Theft Risk**: Requests for PII in non-secure contexts

---

## 🧪 Testing

### Test the Backend

```bash
node test_server.js
```

This will verify:
- Server connectivity
- API endpoint availability
- Basic health checks

### Manual Testing

1. Visit a known scam website (use caution!)
2. Test the snipping functionality on various page elements
3. Verify the risk scores align with expected threat levels
4. Check that recommendations are actionable and specific

---

## 🛠️ Development

### Project Structure

```
Scam/
├── server.js              # Backend Express server
├── test_server.js         # Server health check script
├── package.json           # Node.js dependencies
├── extension/             # Chrome extension files
│   ├── manifest.json      # Extension configuration
│   ├── popup.html         # Extension popup UI
│   ├── popup.js           # Popup interaction logic
│   ├── background.js      # Service worker (screenshot handling)
│   ├── content.js         # Content script (overlay & results)
│   └── styles.css         # UI styles (injected into pages)
└── README.md              # This file
```

### Key Technologies

- **Backend**: Node.js, Express.js
- **AI**: Google Gemini 2.0 Flash (vision model)
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Extension**: Chrome Extensions Manifest V3

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `GOOGLE_API_KEY` | Alternative to GEMINI_API_KEY | Yes (if GEMINI_API_KEY not set) |

---

## 🔒 Security & Privacy

- **Local Processing**: Screenshots are processed locally and sent only to Google's Gemini API
- **No Data Storage**: SBNTYM does not store or log user data
- **HTTPS Only**: Backend should be served over HTTPS in production
- **API Key Security**: Never commit API keys to version control

---

## 🐛 Troubleshooting

### "Backend not reachable" Error

**Solution**: Ensure the backend server is running:
```bash
npm start
```

### Extension Not Loading

**Solution**: 
1. Check Chrome's extension page for errors
2. Ensure all files are in the `extension/` folder
3. Reload the extension after making changes

### Low-Quality Results

**Solution**:
- Ensure you're selecting a clear, readable portion of the page
- Avoid very small selections (minimum 5x5 pixels)
- Check your internet connection for API calls

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 Author

**Ton Nguyen**

- GitHub: [@tonnguyen291](https://github.com/tonnguyen291)
- Project: [Machine-Learning-Project](https://github.com/tonnguyen291/Machine-Learning-Project)

---

## 🙏 Acknowledgments

- **Google Gemini**: For providing the powerful AI vision model
- **Gen Digital / Norton**: For fraud detection guidelines and policy framework
- **Chrome Extensions Team**: For the robust extension platform

---

## 📚 Additional Resources

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Google Gemini API Docs](https://ai.google.dev/docs)
- [Norton Lock Policy](https://www.nortonlifelock.com/)
- [C4 Architecture Documentation](./ARCHITECTURE.md)

---

**⚠️ Disclaimer**: This tool is provided for educational and recommendation purposes only. It does not constitute legal proof, legal advice, or a definitive determination of fraud. Always exercise caution when browsing unfamiliar websites.
