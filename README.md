# DisasterSim AI — Immersive 3D Disaster Simulation & Employee Safety Training

> **Enterprise-grade 3D disaster simulation and employee safety training platform built with React, Three.js, React Three Fiber, WebXR, Spring Boot, PostgreSQL, and AI-driven performance assessment. Built completely WITHOUT Unity and WITHOUT Unreal Engine to run smoothly on standard laptops with integrated graphics while remaining WebXR-ready for VR headsets.**

---

## 🌟 Executive Overview

**DisasterSim AI** delivers realistic, interactive disaster preparedness drills for enterprise workforces. Rather than passive video modules, employees actively navigate procedural 3D building environments during critical emergencies, make life-or-death decisions in real time, and receive instant, objective score breakdowns with AI-powered coaching reports.

### Key Capabilities
- **Zero Heavy Game Engines**: 100% Web standards (Three.js + React Three Fiber). No Unity WebGL export bloat, no Unreal Engine GPU requirements.
- **Unified Desktop & WebXR VR Architecture**: The exact same 3D simulation engine, hazard algorithms, event recorder, and scoring system run seamlessly on desktop browsers (WASD + mouse look) and in standalone VR headsets (Meta Quest, HTC Vive) via WebXR.
- **Objective Multi-Factor Scoring**: Trainee scores (out of 100) are computed mathematically from recorded physical events across 4 distinct categories:
  - **Safety Behavior (40 pts)**: Proximity to hazards, avoidance of smoke/fire/water.
  - **Decision Making (25 pts)**: Route selection, alarm activation, safe zone arrival.
  - **Response Time (20 pts)**: Reaction latency and total evacuation duration.
  - **Correct Interactions (15 pts)**: Pull stations, fire extinguisher operation, duck-and-cover.
- **Real-Event AI Assessment**: Integrates Google Gemini API to analyze the trainee's actual chronological action timeline without hallucination. Generates actionable feedback, strengths, mistakes, risk levels, and training advice. Includes an automatic deterministic safety assessment fallback if the AI API is offline.
- **Enterprise Role-Based Access**: Dedicated **Employee Mode** (scenario selection, drill runner, personal scorecards) and **Admin Mode** (executive KPI dashboards, Recharts completion analytics, trainee management, and audit logs).

---

## 🏗️ System Architecture

```
                    ┌────────────────────────┐
                    │   React 18 + Tailwind  │
                    └───────────┬────────────┘
                                │
                    ┌───────────▼────────────┐
                    │     Three.js / R3F     │
                    └───────────┬────────────┘
                                │
                    ┌───────────▼────────────┐
                    │   Simulation Engine    │
                    │  (Procedural Geometry) │
                    └─────┬─────┬─────┬──────┘
                          │     │     │
                 ┌────────┘     │     └────────┐
                 ▼              ▼              ▼
           🔥 Fire Drill  🌊 Flood Drill  🌎 Earthquake Drill
                 │              │              │
                 └────────┬─────┴─────┬────────┘
                          │           │
                          │   ┌───────▼────────┐
                          │   │  InputManager  │
                          │   │  (Desktop/VR)  │
                          │   └────────────────┘
                          ▼
                  ┌───────────────┐
                  │ EventRecorder │
                  └───────┬───────┘
                          │
                          ▼
                  ┌───────────────┐
                  │ ScoringEngine │ (Safety 40, Decision 25, Response 20, Action 15)
                  └───────┬───────┘
                          │ HTTP REST
                          ▼
            ┌───────────────────────────┐
            │   Spring Boot 3.3.4 API   │
            └──────┬─────────────┬──────┘
                   │             │
                   ▼             ▼
          ┌────────────────┐ ┌────────────────┐
          │   PostgreSQL   │ │  Gemini 1.5 AI │
          │   (Supabase)   │ │  Assessment    │
          └────────────────┘ └────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 18, React Router v6, Tailwind CSS |
| **3D Rendering** | Three.js (r165), React Three Fiber (v8), @react-three/drei (v9) |
| **Virtual Reality** | WebXR Device API, @react-three/xr |
| **Data Visualization** | Recharts, Lucide Icons |
| **Backend Framework** | Spring Boot 3.3.4, Java 17+ (Java 23 supported) |
| **Database & ORM** | PostgreSQL 16 (Supabase cloud & Docker support), Spring Data JPA, Hibernate |
| **Security & Auth** | Spring Security, JJWT (JSON Web Token 0.12.5), BCrypt hashing |
| **AI Integration** | Google Gemini 1.5 Flash REST API + Deterministic Safety Rule Engine Fallback |

---

## 📁 Repository Structure

```
d:/AFrame/
├── backend/
│   ├── src/main/java/com/disastersim/
│   │   ├── ai/                      # Gemini AI REST service & fallback generator
│   │   ├── config/                  # DB DataSource, Security, and Pre-seed Initializer
│   │   ├── controller/              # Auth, Scenario, Training, and Admin REST endpoints
│   │   ├── dto/                     # Request and Response transfer objects
│   │   ├── entity/                  # JPA entities (User, Scenario, Session, Action, Report)
│   │   ├── exception/               # Global exception handlers
│   │   ├── repository/              # Spring Data JPA repositories
│   │   ├── security/                # JWT Token provider, UserDetailsService, Auth filter
│   │   └── service/                 # Business logic, ScoringEngine, TrainingService
│   ├── src/main/resources/
│   │   └── application.yml          # Spring configuration & database bindings
│   └── pom.xml                      # Maven dependencies
├── frontend/
│   ├── src/
│   │   ├── components/              # SimulationHUD, TrainingReportModal
│   │   ├── pages/                   # LandingPage, LoginPage, EmployeeDashboard, AdminDashboard, SimulationPage
│   │   ├── scenes/                  # OfficeEnvironment (procedural 3D), PlayerController, Viewport
│   │   ├── simulations/             # FireHazard, FloodHazard, EarthquakeHazard engines
│   │   ├── simulation-engine/       # InputManager (Desktop/VR), EventRecorder, AssetManager
│   │   ├── services/                # Axios API client with JWT interceptor
│   │   ├── store/                   # AuthContext with 1-click enterprise demo credentials
│   │   ├── index.css                # Dark enterprise theme, glassmorphism, emergency keyframes
│   │   ├── App.jsx                  # React Router root
│   │   └── main.jsx                 # Client entry point
│   ├── server.mjs                   # Fast Node dev server with on-the-fly JSX transpilation & API proxy
│   ├── index.html                   # HTML entry with Tailwind & zero-build ESM import map
│   └── package.json
├── docker-compose.yml               # Local PostgreSQL container configuration
├── .env.example                     # Environment variables template
└── README.md                        # Documentation
```

---

## 🗄️ Database Schema

The database model tracks users, disaster scenarios, drills, and AI reports:

1. **`users`**:
   - `id`: BIGSERIAL PRIMARY KEY
   - `name`: VARCHAR(100) NOT NULL
   - `email`: VARCHAR(100) UNIQUE NOT NULL
   - `password`: VARCHAR(255) NOT NULL (BCrypt encrypted)
   - `role`: VARCHAR(20) NOT NULL (`ROLE_EMPLOYEE`, `ROLE_ADMIN`)
   - `department`: VARCHAR(100)
   - `created_at`: TIMESTAMP

2. **`disaster_scenarios`**:
   - `id`: BIGSERIAL PRIMARY KEY
   - `name`: VARCHAR(100) NOT NULL
   - `type`: VARCHAR(20) NOT NULL (`FIRE`, `FLOOD`, `EARTHQUAKE`)
   - `description`: TEXT
   - `difficulty`: VARCHAR(20) NOT NULL (`EASY`, `MEDIUM`, `HARD`)
   - `duration`: INT (seconds)
   - `active`: BOOLEAN NOT NULL

3. **`training_sessions`**:
   - `id`: BIGSERIAL PRIMARY KEY
   - `employee_id`: BIGINT REFERENCES `users(id)`
   - `scenario_id`: BIGINT REFERENCES `disaster_scenarios(id)`
   - `start_time`: TIMESTAMP NOT NULL
   - `end_time`: TIMESTAMP
   - `score`: INT (0 - 100)
   - `safety_score`: INT (0 - 40)
   - `decision_score`: INT (0 - 25)
   - `response_score`: INT (0 - 20)
   - `interaction_score`: INT (0 - 15)
   - `response_time`: INT (seconds)
   - `completion_status`: VARCHAR(20) (`IN_PROGRESS`, `COMPLETED`, `FAILED`, `ABANDONED`)

4. **`employee_actions`**:
   - `id`: BIGSERIAL PRIMARY KEY
   - `training_session_id`: BIGINT REFERENCES `training_sessions(id)`
   - `action_type`: VARCHAR(50) NOT NULL (`SIMULATION_STARTED`, `ALARM_TRIGGERED`, `EXIT_FOUND`, `FIRE_EXTINGUISHER_PICKED`, `SAFE_ZONE_REACHED`, etc.)
   - `timestamp`: TIMESTAMP NOT NULL
   - `x`, `y`, `z`: DOUBLE PRECISION
   - `correct`: BOOLEAN NOT NULL
   - `description`: VARCHAR(255)

5. **`training_reports`**:
   - `id`: BIGSERIAL PRIMARY KEY
   - `training_session_id`: BIGINT UNIQUE REFERENCES `training_sessions(id)`
   - `score`: INT NOT NULL
   - `summary`: TEXT NOT NULL
   - `strengths`: TEXT (JSON Array)
   - `mistakes`: TEXT (JSON Array)
   - `recommendations`: TEXT (JSON Array)
   - `risk_level`: VARCHAR(20) (`LOW`, `MODERATE`, `HIGH`, `CRITICAL`)
   - `training_advice`: TEXT NOT NULL
   - `generated_at`: TIMESTAMP NOT NULL

---

## 🌐 REST API Endpoints

### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/register` — Register new user account.
- `POST /api/auth/login` — Authenticate and receive signed JWT.
- `GET /api/auth/me` — Return current authenticated profile.

### 📋 Scenarios (`/api/scenarios`)
- `GET /api/scenarios` — List all active disaster scenarios (Public).
- `GET /api/scenarios/{id}` — Retrieve scenario details.
- `POST /api/admin/scenarios` — Create new scenario (Admin only).
- `PUT /api/admin/scenarios/{id}` — Update existing scenario (Admin only).
- `DELETE /api/admin/scenarios/{id}` — Soft-delete/deactivate scenario (Admin only).

### 🏃 Training Drills (`/api/training` & `/api/employees`)
- `POST /api/training/start` — Initialize a new training drill session.
- `POST /api/training/{id}/action` — Record real-time action event (`ALARM_TRIGGERED`, etc.).
- `POST /api/training/{id}/complete` — Finish drill, calculate score, trigger AI assessment.
- `GET /api/training/{id}` — Retrieve session telemetry.
- `GET /api/training/{id}/report` — Retrieve comprehensive training report with AI summary.
- `GET /api/employees/{id}/training-history` — Fetch employee session history.
- `GET /api/employees/{id}/performance` — Calculate aggregate employee metrics.

### 📊 Admin Analytics (`/api/admin`)
- `GET /api/admin/dashboard` — Executive KPI summary (Total drills, average scores, pass rates).
- `GET /api/admin/analytics` — Recharts-ready time series, scenario distributions, and risk trends.
- `GET /api/admin/employees` — Comprehensive workforce safety performance roster.
- `GET /api/admin/training-sessions` — Filterable audit log of all completed drills.

---

## 🎮 Controls & Simulation Interaction

### Desktop 3D Mode
- **`W`, `A`, `S`, `D`**: First-person translational movement.
- **Mouse**: Camera look (click canvas to engage PointerLock).
- **`E`**: Interact with nearby equipment:
  - Emergency pull station alarm (triggers visual strobes, records `ALARM_TRIGGERED`).
  - Fire extinguisher (picks up equipment, records `FIRE_EXTINGUISHER_PICKED`).
  - Drop, Cover & Hold (executes earthquake safety crouch).
- **`ESC`**: Pause simulation / release pointer lock.

### WebXR VR Mode
- Click the **"Enter VR"** button on the simulation HUD.
- The unified `InputManager.js` shifts from `DesktopInput` to `VRInput`:
  - Headset positional/rotational tracking.
  - VR controller thumbsticks for smooth motion or teleportation.
  - Trigger / Grip buttons for object interaction.
- If WebXR is unsupported on the current device, a clear alert modal appears without crashing.

---

## ⚡ Quick Start & Running Locally

### Prerequisites
- **Java 17+** (Java 17, 21, or 23 installed)
- **Node.js 18+**
- **PostgreSQL** (Local Docker OR Cloud Supabase instance)

### 1. Database Setup
Configure your database in `backend/src/main/resources/application.yml` or via environment variables:
```bash
# Using Supabase PostgreSQL:
DATABASE_URL=jdbc:postgresql://db.uuuselarzyggovjbytwj.supabase.co:5432/postgres?sslmode=require
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=YourPasswordHere

# Or local Docker:
docker compose up -d postgres
```

### 2. Run Backend
```powershell
cd d:\AFrame\backend
.\mvnw.cmd spring-boot:run
```
The backend initializes database tables and seeds demo accounts at `http://localhost:8080`.

### 3. Run Frontend
```powershell
cd d:\AFrame\frontend
node server.mjs
```
The frontend server starts on `http://localhost:5173/` and proxies `/api` calls directly to the Spring Boot backend.

---

## 🔑 Demo Credentials

| Role | Email | Password | Access |
|---|---|---|---|
| **Employee (Trainee)** | `sarah.chen@enterprise.com` | `Employee123!` | Scenario drills, scorecards, personal training reports |
| **Admin (Safety Director)** | `admin@disastersim.ai` | `Admin123!` | Executive dashboard, workforce analytics, scenario manager |

*(Quick 1-Click login buttons are available directly on the login screen for instant demo access).*

---

## 🤖 AI Assessment Configuration

DisasterSim AI uses Google Gemini to generate contextual training reports based on actual recorded events:

1. Obtain an API Key from [Google AI Studio](https://aistudio.google.com/).
2. Set the environment variable:
   ```powershell
   $env:GEMINI_API_KEY="AIzaSyYourActualKeyHere"
   ```
3. If no key is configured or the cloud API is unreachable, the system activates the built-in **Deterministic Safety Engine**, computing detailed strengths, mistakes, recommendations, risk levels, and advice directly from your mathematical scores.

---

## 📜 Production Verification Checklist

- [x] Spring Boot 3.3.4 backend running on port `8080`.
- [x] Connected to PostgreSQL with resilient schema migrations and seed data.
- [x] Procedural Three.js low-poly 3D office environment (Rooms, corridors, doors, stairs, desks, alarm, extinguisher, exits, safe zone).
- [x] Office Fire Evacuation drill with dynamic flames, smoke volume, and heat danger zones.
- [x] Office Flood Emergency drill with rising water plane and elevated refuge.
- [x] Office Earthquake drill with camera tremors, falling ceiling tiles, and drop/cover/hold.
- [x] 4-Category mathematical scoring engine (100-point rubric).
- [x] AI safety assessment service with structured JSON output and deterministic fallback.
- [x] Post-simulation Training Report modal with score gauge, category cards, AI recommendations, and event timeline.
- [x] Trainee Dashboard and Executive Admin Dashboard with Recharts analytics.
- [x] Unified WebXR-ready `InputManager` supporting Desktop and VR headsets.
