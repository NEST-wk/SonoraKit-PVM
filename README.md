# SonoraKit PVM

<div align="center">

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Python](https://img.shields.io/badge/python-3.11+-yellow.svg)
![React](https://img.shields.io/badge/react-19.x-61DAFB.svg)

**Un producto de IA personalizable con soporte multi-proveedor**

</div>

---

## 🚀 Características

### Backend
- **Multi-proveedor de IA**: OpenAI, Anthropic, Google, Mistral, Cohere, Groq, OpenRouter
- **Encriptación de API Keys**: Fernet encryption para máxima seguridad
- **FastAPI**: API RESTful moderna, rápida y con documentación automática
- **Neon PostgreSQL**: Base de datos serverless con SQLAlchemy async
- **Firebase Auth**: Autenticación de usuarios con verificación de tokens
- **Streaming**: Soporte para respuestas en tiempo real de IA

### Frontend
- **React 19** con TypeScript
- **Vite 7**: Build tool ultra-rápido
- **TailwindCSS 4**: Estilos modernos y responsivos
- **React Router 7**: Navegación SPA
- **Firebase**: Autenticación integrada
- **Three.js & OGL**: Efectos visuales 3D

## 📦 Instalación

### Requisitos Previos
- Python 3.11+
- Node.js 18+
- Cuenta de Firebase
- Base de datos Neon PostgreSQL

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
```

### Frontend

```bash
cd frontend
npm install
```

### Configuración

Crear archivo `backend/.env`:

```env
# App
DEBUG=true

# Security
MASTER_KEY=tu_clave_fernet_base64
SECRET_KEY=tu_secret_key

# Database (Neon PostgreSQL)
DATABASE_URL=postgresql+asyncpg://user:pass@host/db

# Firebase
FIREBASE_PROJECT_ID=tu_project_id
FIREBASE_API_KEY=tu_api_key

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

Crear archivo `frontend/.env`:

```env
VITE_API_URL=http://localhost:8001
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
VITE_FIREBASE_PROJECT_ID=tu_project_id
```

### Ejecutar

**Backend:**
```bash
cd backend
uvicorn app.main:app --reload --port 8001
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## 🏗️ Estructura del Proyecto

```
SonoraKit PVM/
├── backend/
│   ├── app/
│   │   ├── api/routes/     # Endpoints (health, auth, chat, ai_configs)
│   │   ├── core/           # Config, logger
│   │   ├── db/             # Database models y conexión
│   │   ├── models/         # Pydantic schemas
│   │   └── services/       # Encryption, AI service
│   ├── scripts/            # Scripts de utilidad
│   ├── Dockerfile
│   ├── fly.dev.toml        # Config Fly.io (dev)
│   ├── fly.prod.toml       # Config Fly.io (prod)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/     # Componentes React (DarkVeil, LiquidEther, LogoLoop)
│   │   ├── contexts/       # Context providers (Auth)
│   │   ├── lib/            # Firebase config
│   │   └── pages/          # Páginas (Landing, Login, Register, Chat, Settings)
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── supabase/
│   ├── migrations/         # SQL migrations
│   └── seeds/              # Datos iniciales
└── README.md
```

## 📄 API Endpoints

### Health
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/v1/health` | Health check |

### Authentication
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/sync` | Sincronizar usuario Firebase → DB |
| `GET` | `/api/v1/auth/me` | Obtener perfil del usuario actual |

### AI Configurations
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/v1/ai-configs/providers` | Lista proveedores de IA |
| `POST` | `/api/v1/ai-configs/` | Crear configuración |
| `GET` | `/api/v1/ai-configs/` | Listar configuraciones |

### Chat
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/v1/chat/completions` | Enviar mensaje y obtener respuesta IA |
| `GET` | `/api/v1/chat/history` | Obtener historial de chats |
| `GET` | `/api/v1/chat/{chat_id}` | Obtener chat específico |
| `DELETE` | `/api/v1/chat/{chat_id}` | Eliminar chat |

## 🛠️ Tech Stack

### Backend
- **FastAPI** 0.109 - Framework web async
- **SQLAlchemy** 2.0 - ORM async con asyncpg
- **Pydantic** 2.5 - Validación de datos
- **Firebase Admin** - Verificación de tokens
- **Cryptography** - Encriptación de API keys

### Frontend
- **React** 19 - UI Library
- **TypeScript** 5.9 - Type safety
- **Vite** 7 - Build tool
- **TailwindCSS** 4 - Styling
- **Three.js** - 3D graphics

### Infrastructure
- **Fly.io** - Deployment backend
- **Neon** - PostgreSQL serverless
- **Firebase** - Authentication

## 🚢 Deployment

### Backend (Fly.io)

```bash
cd backend
fly deploy --config fly.prod.toml
```

### Frontend

```bash
cd frontend
npm run build
# Deploy dist/ a tu hosting preferido
```

## 📝 Licencia

MIT © 2025 SonoraKit PVM
