HEAD
# 🌸 Nestie AI — Smart Pregnancy Management Platform

<p align="center">
  <img src="https://img.shields.io/badge/Spring%20Boot-3.2-6DB33F?logo=springboot" alt="Spring Boot"/>
  <img src="https://img.shields.io/badge/Angular-17-DD0031?logo=angular" alt="Angular"/>
  <img src="https://img.shields.io/badge/FastAPI-0.110-009688?logo=fastapi" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql" alt="MySQL"/>
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker" alt="Docker"/>
  <img src="https://img.shields.io/badge/AI-OpenAI%20GPT--4-412991?logo=openai" alt="OpenAI"/>
</p>

A **production-ready**, AI-powered pregnancy management platform featuring real-time health tracking, intelligent chatbot assistance, risk prediction, and comprehensive care management for expecting mothers, doctors, and administrators.

---

## 📐 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Nginx Reverse Proxy                   │
│                     (Port 80/443)                        │
└───────┬──────────────────┬──────────────────┬───────────┘
        │                  │                  │
        ▼                  ▼                  ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│   Angular 17  │  │  Spring Boot  │  │   FastAPI AI   │
│   Frontend    │  │ Microservices │  │   Service      │
│  (Port 4200)  │  │ + Gateway     │  │  (Port 8000)  │
│               │  │               │  │                │
│  • Material   │  │  • REST APIs  │  │  • OpenAI GPT  │
│  • Tailwind   │  │  • JWT Auth   │  │  • ML Models   │
│  • Poppins    │  │  • Swagger    │  │  • Scikit-learn│
└───────────────┘  └───────┬───────┘  └────────────────┘
                           │
                    ┌──────▼──────┐
                    │   MySQL 8   │
                    │  (Port 3306)│
                    └─────────────┘
```

## 🗂️ Project Structure

```
Nestie-ai/
├── gateway-service/                  # API Gateway (Spring Boot)
├── auth-service/                     # Auth + JWT service
├── pregnancy-service/                # Pregnancy profile domain
├── appointment-service/              # Appointment domain
├── baby-preview-service/             # Baby preview generation domain
│
├── frontend/                         # Angular 17 Frontend
│   ├── src/app/
│   │   ├── core/                     # Models, services, guards
│   │   ├── pages/                    # All page components
│   │   │   ├── auth/                 # Login, Register
│   │   │   ├── layout/               # Main layout + sidebar
│   │   │   ├── patient-dashboard/
│   │   │   ├── doctor-dashboard/
│   │   │   ├── admin-panel/
│   │   │   ├── pregnancy-profile/
│   │   │   ├── appointments/
│   │   │   ├── symptoms/
│   │   │   ├── nutrition/
│   │   │   ├── medications/
│   │   │   └── baby-growth/
│   │   └── shared/                   # Chatbot bubble
│   ├── angular.json
│   ├── tailwind.config.js
│   └── Dockerfile
│
├── ai-service/                       # FastAPI AI Microservice
│   ├── main.py
│   ├── routers/
│   │   ├── chatbot.py                # GPT-4 pregnancy assistant
│   │   ├── risk_prediction.py        # ML risk scoring
│   │   ├── symptom_analysis.py       # Anomaly detection
│   │   ├── nutrition_ai.py           # Meal suggestions
│   │   └── growth_comparison.py      # WHO growth standards
│   ├── requirements.txt
│   └── Dockerfile
│
├── devops/
│   ├── nginx/nginx.conf              # Reverse proxy config
│   └── ansible/
│       ├── playbook.yml              # Deployment automation
│       └── inventory.ini
│
├── docker-compose.yml
└── README.md
```

## ✨ Features

### 🤰 Patient Features
| Feature | Description |
|---------|-------------|
| **Pregnancy Profile** | Track LMP, due date, trimester, blood type, weight |
| **Appointments** | Book/manage appointments (checkup, ultrasound, lab work) |
| **Symptoms Tracker** | Log symptoms with AI anomaly detection |
| **Nutrition Planner** | Personalized meal plans by trimester |
| **Medication Manager** | Track prescriptions with reminders |
| **Baby Growth** | Growth measurements vs WHO standards |
| **AI Chatbot** | 24/7 GPT-4 pregnancy assistant |
| **Risk Prediction** | ML-based pregnancy risk assessment |

### 🩺 Doctor Features
- Active patients dashboard
- AI-flagged cases prioritization
- Appointment management
- Patient symptom review

### ⚙️ Admin Features
- User management (patients, doctors)
- System analytics dashboard
- AI interaction monitoring

## 🛡️ Security

- **JWT Authentication** with configurable expiration
- **Role-based access control** (PATIENT, DOCTOR, ADMIN)
- **CORS** configured for frontend origin
- **CSRF disabled** (stateless API)
- **Input validation** via Jakarta Bean Validation
- **Global exception handling** with structured error responses
- **Nginx rate limiting** (30 req/s API, 20 req/s AI)

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Java 17+ (for local dev)
- Node.js 20+ (for local dev)
- Python 3.12+ (for local dev)
- MySQL 8.0 (or use Docker)

### Docker Compose (Recommended)

```bash
# Clone and navigate
cd Nestie-ai

# Set your OpenAI API key
export OPENAI_API_KEY=your-key-here

# Build and start all services
docker-compose up --build -d

# Access the app
# Frontend:  http://localhost
# API:       http://localhost/api
# AI Docs:   http://localhost/docs
# Swagger:   http://localhost/swagger-ui.html
```

### Local Development

**Microservices (example):**
```bash
cd gateway-service && ./mvnw spring-boot:run
cd ../auth-service && ./mvnw spring-boot:run
cd ../pregnancy-service && ./mvnw spring-boot:run
cd ../appointment-service && ./mvnw spring-boot:run
cd ../baby-preview-service && ./mvnw spring-boot:run
# Gateway runs on http://localhost:9090 (local), or :8080 in Docker Compose
```

**Frontend:**
```bash
cd frontend
npm install
ng serve
# Runs on http://localhost:4200
```

**AI Service:**
```bash
cd ai-service
pip install -r requirements.txt
cp .env.example .env  # Add your OpenAI key
uvicorn main:app --reload --port 8000
# Docs at http://localhost:8000/docs
```

## 📡 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login & get JWT |

### CRUD Modules (all require JWT)
| Module | Base Path | Operations |
|--------|-----------|------------|
| Users | `/api/users` | GET, PUT, DELETE |
| Pregnancy | `/api/pregnancy-profiles` | CRUD + pagination |
| Appointments | `/api/appointments` | CRUD + status update |
| Symptoms | `/api/symptoms` | CRUD + AI flagging |
| Nutrition | `/api/nutrition-plans` | CRUD + AI suggestions |
| Medications | `/api/medications` | CRUD + toggle active |
| Baby Growth | `/api/baby-growth` | CRUD + WHO comparison |

### AI Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/chat` | Chat with AI assistant |
| POST | `/api/ai/risk/predict` | Risk prediction |
| POST | `/api/ai/symptoms/analyze` | Symptom analysis |
| POST | `/api/ai/nutrition/suggest` | Nutrition suggestions |
| POST | `/api/ai/growth/compare` | Growth comparison |

## 🧑‍💻 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Patient | emily@nestie.ai | password123 |
| Patient | jessica@nestie.ai | password123 |
| Doctor | sarah.doctor@nestie.ai | password123 |
| Doctor | michael.doctor@nestie.ai | password123 |
| Admin | admin@nestie.ai | admin123 |

## 🎨 Design System

- **Font:** Poppins (Google Fonts)
- **Palette:** Soft girly aesthetic
  - Pink: `#f8bbd0` / Rose: `#e91e63`
  - Lavender: `#e1bee7` / Purple: `#9c27b0`
  - Peach: `#ffccbc` / Cream: `#fce4ec`
- **Cards:** 20px border-radius with pastel shadows
- **Components:** Angular Material + TailwindCSS

## 📦 Deployment (Ansible)

```bash
cd devops/ansible
ansible-vault create group_vars/all/vault.yml  # Add secrets
ansible-playbook -i inventory.ini playbook.yml --ask-vault-pass
```

## 📄 License

MIT License — Built with 💕 by the Nestie AI Team

# Nestie-1.0
nestie1.0
 2710ffd0bfa9f2048409bb1a4ca5333160551124
