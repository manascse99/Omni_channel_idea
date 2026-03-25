# OmniBank AI — Frontend

## Overview

OmniBank AI is an enterprise-grade, AI-powered omnichannel communication platform designed for the banking, loans, and fintech ecosystem. The frontend application provides a unified dashboard where agents can manage conversations from multiple channels such as WhatsApp, Email, and Web Chat, powered by real-time updates and AI-driven insights.

This repository contains the frontend implementation built using modern web technologies with a focus on scalability, performance, and maintainability.

---

## Core Features

### 1. Unified Conversation Management

* Centralized interface for handling messages across multiple channels
* Real-time conversation updates using WebSockets
* Context-aware chat interface with full conversation history

### 2. AI-Assisted Communication

* AI-generated response suggestions
* Accept and edit workflow for agent control
* Intent detection and sentiment analysis integration

### 3. Real-Time Monitoring

* Live conversation tracking via Socket.io
* Wallboard-style monitoring interface
* Dynamic updates without page refresh

### 4. Analytics and Insights

* Channel-wise conversation distribution
* Intent breakdown and sentiment trends
* KPI-driven decision support

### 5. Team and Assignment Management

* Agent availability tracking
* Smart routing based on intent
* Conversation assignment workflows

### 6. Customer Profile System

* Cross-channel interaction history
* Sentiment scoring
* Context-aware support for agents

---

## Tech Stack

| Category         | Technology         |
| ---------------- | ------------------ |
| Build Tool       | Vite               |
| Framework        | React (Functional) |
| Styling          | Tailwind CSS       |
| Routing          | React Router DOM   |
| State Management | Zustand            |
| HTTP Client      | Axios              |
| Real-time        | Socket.io Client   |
| Charts           | Recharts           |
| Icons            | Lucide React       |
| Code Quality     | ESLint + Prettier  |

---

## Project Structure

```
omnibank-ai-frontend/
├── public/
│   ├── favicon.ico
│   ├── logo.png
│   └── fonts/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   └── shared/
│   ├── pages/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── conversations/
│   │   ├── analytics/
│   │   ├── teams/
│   │   └── monitor/
│   ├── hooks/
│   ├── store/
│   ├── services/
│   ├── utils/
│   ├── router/
│   ├── styles/
│   ├── App.jsx
│   └── main.jsx
├── .env
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## Architecture Overview

The frontend follows a modular and scalable architecture:

* **UI Layer**: Reusable components with zero business logic
* **State Layer**: Managed via Zustand for global state
* **Service Layer**: API interactions handled through centralized services
* **Socket Layer**: Real-time updates via Socket.io
* **Routing Layer**: Protected and modular routes using React Router

---

## Data Flow

```
Backend APIs / Webhooks
        ↓
Service Layer (Axios)
        ↓
Zustand Store
        ↓
React Components
        ↓
UI Rendering

Socket.io Events
        ↓
Real-time Updates
        ↓
State Synchronization
        ↓
UI Refresh
```

---

## Environment Variables

Create a `.env` file in the root directory:

```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_WHATSAPP_PHONE_ID=your_phone_id
```

---

## Installation and Setup

### 1. Clone the repository

```
git clone <repository-url>
cd omnibank-ai-frontend
```

### 2. Install dependencies

```
npm install
```

### 3. Start development server

```
npm run dev
```

### 4. Build for production

```
npm run build
```

---

## Key Screens

* Login / OTP Authentication
* Main Dashboard (Command Center)
* Conversations Management
* Analytics & Insights
* Teams & Assignment
* Live AI Monitor
* Customer Profile Sidebar

---

## API Integration

All API calls are handled via the `services/` layer.

### Example Endpoints:

* `/api/auth/send-otp`
* `/api/auth/verify-otp`
* `/api/conversations`
* `/api/dashboard/stats`
* `/api/analytics/overview`
* `/api/teams`
* `/api/monitor/live`

---

## Real-Time Integration

Socket.io is used for:

* New message updates
* Conversation status changes
* Live monitor updates

### Example Events:

* `new_message`
* `conversation_updated`
* `monitor_update`

---

## Coding Standards

### General Rules

* Functional components only (no class components)
* No direct API calls inside components
* All logic handled via hooks and services
* Tailwind CSS only (no inline styles or raw hex values)

### Component Guidelines

* UI components must remain stateless
* Business logic handled in hooks
* Pages should be thin and modular

### Naming Conventions

* Components: PascalCase (e.g., `ChatBubble.jsx`)
* Hooks: camelCase with `use` prefix
* Services: camelCase with `Service` suffix
* Stores: camelCase with `Store` suffix

---

## Development Workflow

* `main` → Production-ready code
* `dev` → Active development branch
* `feature/*` → Feature-specific branches

### Commit Format

```
feat: add conversation panel
fix: resolve socket sync issue
chore: update dependencies
```

---

## Performance Considerations

* Lazy loading with `React.lazy()` and `Suspense`
* Optimized state updates using Zustand
* Minimal re-renders via component separation
* Efficient real-time updates via Socket.io

---

## Future Enhancements

* Advanced AI automation workflows
* Role-based access control
* Multi-language support
* Notification system improvements
* Enhanced analytics visualizations

---

## Conclusion

This frontend is designed to support a production-grade AI-powered communication platform. It emphasizes scalability, modularity, and real-time performance, aligning with enterprise-level application standards.

---
