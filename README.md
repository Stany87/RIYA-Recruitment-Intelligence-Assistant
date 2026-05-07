# Clockwork ATS

**AI-Powered Applicant Tracking System for Recruitment Agencies**

Clockwork ATS wraps around [RIYA](https://relevanceai.com) (Recruitment Intelligence & Your Assistant), an AI agent that automatically screens candidates, scores CVs, and manages recruitment workflows.

---

## Prerequisites

- **Node.js** 18+ and npm
- **MongoDB Atlas** account with a cluster ([Create one free](https://www.mongodb.com/atlas))

---

## Project Structure

```
clockwork-ats/
├── client/          # React + Vite + Tailwind CSS frontend
├── server/          # Node.js + Express backend
├── .gitignore
└── README.md
```

---

## Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/Stany87/RIYA-Recruitment-Intelligence-Assistant.git
cd RIYA-Recruitment-Intelligence-Assistant
```

### 2. Set up the server

```bash
cd server
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm install
npm run dev
```

The server will start on `http://localhost:5000`.

### 3. Set up the client

```bash
cd client
cp .env.example .env
# Edit .env if needed (defaults work for local dev)
npm install
npm run dev
```

The client will start on `http://localhost:5173`.

---

## Environment Variables

### Server (`server/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/clockwork-ats` |
| `JWT_SECRET` | Secret key for signing JWTs | `your-random-secret-key` |
| `JWT_EXPIRES_IN` | JWT token expiry | `7d` |
| `CLIENT_URL` | Frontend URL (for CORS) | `http://localhost:5173` |

### Client (`client/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api/v1` |
| `VITE_RIYA_EMBED_URL` | Relevance AI embed URL (Phase 3) | _(leave empty for now)_ |

---

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, TanStack Query, React Router
- **Backend**: Node.js, Express, Mongoose, JWT
- **Database**: MongoDB Atlas
- **AI Agent**: Relevance AI (RIYA)

---

## License

Private — All rights reserved.
