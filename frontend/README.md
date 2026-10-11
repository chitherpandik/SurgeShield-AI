# SurgeShield AI — Frontend Dashboard

A modern, high-performance banking fraud intelligence dashboard built with React 19, Vite, and Chart.js. Communicates in real-time with the FastAPI backend and MySQL persistent storage.

---

## 🛡️ Features

- **Executive Monitoring Dashboard**: Real-time KPI stat cards (`Total Transactions`, `Current Surge`, `Fraud Detected`, `Amount at Risk`).
- **Transaction Volume Timeline**: Chronological line chart showing monetary volume against composite risk score.
- **Surge Intelligence Panel**: Tracks current velocity vs. hourly baseline rates, distinguishing **Genuine Surges** (promotions, flash sales) from **Suspicious Surges**.
- **Fraud Classification Donut**: Live distribution of Legitimate vs. Fraudulent transactions.
- **Risk & Decision Distribution**: Bar chart breakdown of risk tiers (`LOW`, `MEDIUM`, `HIGH`) and automated actions (`APPROVE`, `VERIFY`, `BLOCK`).
- **Explainable Risk Factors**: Transparent factor decomposition answering *"Why was this transaction flagged?"* without fabricating meanings for anonymized PCA features.
- **Attack Pattern Analysis**: Multi-dimensional radar vector visualizing ML probability, surge velocity, temporal anomalies, and PCA deviations.
- **Live Transaction Simulator & Analyzer**: Interactive test bench with quick-load presets (*Normal Retail*, *High-Risk Fraud Attack*, *Flash Sale Surge*, *Off-Peak Midnight*) executing `POST /analyze` with real-time MySQL persistence.
- **Persistent Transactions Audit Log**: Paginated, filterable, and searchable log from MySQL with click-through deep-dive inspection.
- **System Health Diagnostics**: Real-time probe of FastAPI ASGI service, MySQL connectivity, and roundtrip latency.

---

## 🚀 Getting Started

### 1. Environment Configuration

Create `.env` inside the `frontend/` directory (or copy from `.env.example`):

```env
VITE_API_BASE_URL=http://127.0.0.1:8001
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

The frontend will start at `http://localhost:5173`.

### 4. Build for Production

```bash
npm run build
```

---

## 📡 API Contract Integrations

| Frontend Component | Backend Endpoint | HTTP Method |
|---|---|---|
| System Health Monitor | `/health` | `GET` |
| Top Stats & KPIs | `/dashboard` | `GET` |
| Surge Intelligence Panel | `/surge` | `GET` |
| Risk & Decision Funnels | `/risk-summary` | `GET` |
| Transactions Audit Table | `/transactions` | `GET` |
| Transaction Deep-Dive | `/transactions/{id}` | `GET` |
| Live Analyzer Engine | `/analyze` | `POST` |
| Raw Model Inference | `/predict` | `POST` |
