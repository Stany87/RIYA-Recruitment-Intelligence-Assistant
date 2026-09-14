<h1 align="center">
  ⚙️ Clockwork ATS
</h1>

<p align="center">
  <strong>AI-Powered Applicant Tracking System for Recruitment Agencies</strong>
</p>

<p align="center">
  Intelligent candidate screening · Automated CV scoring · End-to-end recruitment workflows<br/>
  Powered by <strong>RIYA</strong> — Recruitment Intelligence & Your Assistant
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB Atlas" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/AI-Relevance_AI-FF6B35?style=for-the-badge" alt="Relevance AI" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Auth-JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white" alt="JWT" />
  <img src="https://img.shields.io/badge/Data-TanStack_Query-FF4154?style=flat-square" alt="TanStack Query" />
  <img src="https://img.shields.io/badge/Styling-Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Routing-React_Router-CA4245?style=flat-square&logo=reactrouter&logoColor=white" alt="React Router" />
  <img src="https://img.shields.io/badge/License-Private-red?style=flat-square" alt="License" />
</p>

---

## 🧠 What is Clockwork ATS?

**Clockwork ATS** is a modern, full-stack applicant tracking system purpose-built for recruitment agencies. It wraps around [**RIYA**](https://relevanceai.com) (Recruitment Intelligence & Your Assistant) — an AI agent that automatically screens candidates, scores CVs, and orchestrates the entire recruitment lifecycle.

> *"Stop sorting resumes. Start closing placements."*

### Why Clockwork?

| Traditional ATS | Clockwork ATS |
|:---|:---|
| Manual resume screening | 🤖 AI-powered candidate scoring via RIYA |
| Static keyword matching | 🧠 Contextual intelligence & semantic analysis |
| Siloed workflows | 🔄 End-to-end pipeline automation |
| Generic dashboards | 📊 Recruitment-specific analytics & insights |

---

## ✨ Feature Highlights

<table>
  <tr>
    <td width="50%">

### 🤖 AI-Powered Screening
- Automated candidate scoring & ranking
- Contextual CV analysis via Relevance AI
- Intelligent shortlisting recommendations
- Embedded RIYA agent chat interface

</td>
<td width="50%">

### 📋 Pipeline Management
- Visual candidate pipeline tracking
- Stage-based workflow progression
- Bulk actions & batch processing
- Real-time status updates

</td>
  </tr>
  <tr>
    <td>

### 🔐 Authentication & Security
- JWT-based authentication (7-day sessions)
- Secure password hashing
- Role-based access control
- Protected API endpoints with middleware

</td>
<td>

### 📊 Analytics & Insights
- Recruitment funnel visualization
- Time-to-hire metrics
- Source performance tracking
- Agency-wide dashboard statistics

</td>
  </tr>
  <tr>
    <td>

### 👥 Client & Job Management
- Multi-client agency support
- Job posting creation & management
- Candidate-to-job matching
- Interview scheduling workflows

</td>
<td>

### 🎨 Modern Interface
- Clean, responsive dashboard UI
- React component architecture
- Tailwind CSS design system
- TanStack Query for data fetching

</td>
  </tr>
</table>

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLOCKWORK ATS                           │
├──────────────────────────┬──────────────────────────────────┤
│                          │                                  │
│   ┌──────────────────┐   │   ┌──────────────────────────┐   │
│   │   React Client   │   │   │    Express API Server    │   │
│   │                  │   │   │                          │   │
│   │  • Components    │   │   │  • Routes & Controllers  │   │
│   │  • Pages         │◄──┼──►│  • Middleware (Auth/JWT) │   │
│   │  • Contexts      │   │   │  • Services Layer        │   │
│   │  • Hooks         │   │   │  • Mongoose Models       │   │
│   │  • Layouts       │   │   │  • Config & Utils        │   │
│   └──────────────────┘   │   └────────────┬─────────────┘   │
│                          │                │                  │
│   Vite · Tailwind CSS    │                │                  │
│   TanStack Query         │                │                  │
│   React Router           │   ┌────────────▼─────────────┐   │
│                          │   │    MongoDB Atlas          │   │
│                          │   │    (Document Store)       │   │
│                          │   └──────────────────────────┘   │
│                          │                                  │
│                          │   ┌──────────────────────────┐   │
│                          │   │    Relevance AI (RIYA)    │   │
│                          │   │    AI Agent Integration   │   │
│                          │   └──────────────────────────┘   │
└──────────────────────────┴──────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend — `client/`

| Layer | Technology |
|:---|:---|
| **UI Library** | [React 18](https://react.dev) |
| **Build Tool** | [Vite](https://vitejs.dev) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com) |
| **Data Fetching** | [TanStack Query (React Query)](https://tanstack.com/query) |
| **Routing** | [React Router](https://reactrouter.com) |
| **AI Integration** | [Relevance AI (RIYA)](https://relevanceai.com) — Embedded agent |

### Backend — `server/`

| Layer | Technology |
|:---|:---|
| **Runtime** | [Node.js](https://nodejs.org) |
| **Framework** | [Express.js](https://expressjs.com) |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/atlas) |
| **ODM** | [Mongoose](https://mongoosejs.com) |
| **Authentication** | JWT (JSON Web Tokens) |
| **Architecture** | MVC — Models / Routes / Services / Middleware |

---

## 📁 Project Structure

```
clockwork-ats/
├── client/                        # React + Vite Frontend
│   ├── public/                    # Static assets
│   ├── src/
│   │   ├── components/            # Reusable UI components
│   │   ├── contexts/              # React context providers
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── layouts/               # Page layout wrappers
│   │   ├── lib/                   # Utilities & helpers
│   │   ├── pages/                 # Route page components
│   │   ├── App.jsx                # Root app component
│   │   ├── index.css              # Global styles
│   │   └── main.jsx               # Entry point
│   ├── .env.example
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/                        # Node.js + Express Backend
│   ├── src/
│   │   ├── config/                # Database & app configuration
│   │   ├── middleware/            # Auth guards, error handling
│   │   ├── models/                # Mongoose schemas & models
│   │   ├── routes/                # Express route definitions
│   │   ├── services/              # Business logic layer
│   │   ├── utils/                 # Helper functions
│   │   └── index.js               # Server entry point
│   ├── .env.example
│   ├── Procfile                   # Heroku deployment config
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and **npm**
- **MongoDB Atlas** account with a cluster — [Create one free](https://www.mongodb.com/atlas)

---

### 1. Clone the Repository

```bash
git clone https://github.com/Stany87/RIYA-Recruitment-Intelligence-Assistant.git
cd RIYA-Recruitment-Intelligence-Assistant
```

---

### 2. Set Up the Server

```bash
cd server
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# ─── Server Configuration ───────────────────────
PORT=5000

# ─── MongoDB Atlas ───────────────────────────────
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/clockwork-ats

# ─── JWT Authentication ─────────────────────────
JWT_SECRET=your-random-secret-key
JWT_EXPIRES_IN=7d

# ─── CORS ────────────────────────────────────────
CLIENT_URL=http://localhost:5173
```

Install and run:

```bash
npm install
npm run dev
```

> Server starts at **http://localhost:5000**

---

### 3. Set Up the Client

```bash
cd client
cp .env.example .env
```

Configure client environment:

```env
# ─── API Connection ─────────────────────────────
VITE_API_URL=http://localhost:5000/api/v1

# ─── RIYA Agent ──────────────────────────────────
VITE_RIYA_EMBED_URL=<your-riya-embed-url>
```

Install and run:

```bash
npm install
npm run dev
```

> Client starts at **http://localhost:5173**

---

## 🔌 Ecosystem

Clockwork ATS is part of a larger platform ecosystem:

| Repository | Description |
|:---|:---|
| **[RIYA-Recruitment-Intelligence-Assistant](https://github.com/Stany87/RIYA-Recruitment-Intelligence-Assistant)** | Core ATS — AI screening, pipeline management |
| **[CWA-server](https://github.com/Stany87/CWA-server)** | Express API Server — backend services |
| **[CWA-crm](https://github.com/Stany87/CWA-crm)** | CRM Module — client relationship management |
| **[CWA-website](https://github.com/Stany87/CWA-website)** | Marketing Website — public-facing site |

---

## 📄 License

Private — All rights reserved.

---

<p align="center">
  Built with ❤️ and AI
</p>

<p align="center">
  <sub>Designed & developed by <a href="https://github.com/Stany87">@Stany87</a></sub>
</p>
