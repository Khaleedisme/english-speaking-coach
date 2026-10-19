# 🎙️ AI English Speaking Coach & Pronunciation Platform

> **An interactive, multimodal English speaking practice coach for B2/C1-level learners, powered by the Google Gemini Multimodal Audio API (`@google/genai`) and React 19.**

[![Live in AI Studio](https://img.shields.io/badge/Google_AI_Studio-Live_App-4285F4?logo=google&logoColor=white)](https://ai.studio/apps/2fc80c4e-4a25-4f2a-9150-67d0adcff1c6)
[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)

---

## 🌟 Key Features

- **Multimodal Audio Evaluation:** Captures speech directly via the browser's Web Audio API and streams audio to Gemini 2.0 Flash (`gemini-flash-latest`) for end-to-end acoustic and linguistic evaluation.
- **Structured Bilingual Feedback:** Utilizes strict JSON Schemas (`Type.OBJECT`) to return structured feedback in both English and Azerbaijani:
  - Pronunciation diagnostics (e.g., phonetic confusion between `/w/` and `/v/`, `/θ/` and `/s/`).
  - Grammatical accuracy and native phrasing suggestions.
  - Vocabulary range and fluency flow ratings.
- **Session History & Analytics:** Recharts-powered performance charts tracking fluency scores, clarity ratings, and progressive improvements across sessions.
- **Adaptive Memory:** Incorporates historical session context in system prompts to track if repeating errors are resolved over time.

---

## 🏗️ Architecture & Tech Stack

- **Frontend:** React 19, TypeScript, Lucide Icons, Recharts
- **Audio Capture:** HTML5 MediaRecorder & Web Audio API
- **AI Engine:** Google Gemini API (`@google/genai`), Multimodal Audio Ingestion, Structured JSON Schemas
- **Bundler:** Vite 6 with TypeScript compilation

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Khaleedisme/english-speaking-coach.git
cd english-speaking-coach
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure API Key
Create a `.env.local` file in the root directory:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Run the development server
```bash
npm run dev
```

---

## 🌐 Live Application

- **AI Studio Published App:** [https://ai.studio/apps/2fc80c4e-4a25-4f2a-9150-67d0adcff1c6](https://ai.studio/apps/2fc80c4e-4a25-4f2a-9150-67d0adcff1c6)

---

## 👤 Author

**Xalid Hamidov**  
- GitHub: [@Khaleedisme](https://github.com/Khaleedisme)  
- LinkedIn: [linkedin.com/in/xalid-hamidov](https://linkedin.com/in/xalid-hamidov)
