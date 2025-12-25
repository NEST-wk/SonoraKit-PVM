# SonoraKit PVM

Un producto de IA personalizable con soporte multi-proveedor.

## 🚀 Características

- **Multi-proveedor de IA**: OpenAI, Anthropic, Google, Mistral, Cohere, Groq, OpenRouter
- **Encriptación de API Keys**: Fernet encryption para seguridad
- **Backend FastAPI**: API RESTful moderna y rápida
- **Supabase**: Base de datos PostgreSQL con Row Level Security

## 📦 Instalación

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### Configuración

Crear archivo `backend/.env`:

```env
MASTER_KEY=tu_clave_fernet_base64
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_KEY=tu_service_key
DEBUG=true
```

### Ejecutar

```bash
cd backend
uvicorn app.main:app --reload --port 8001
```

## 🏗️ Estructura

```
SonoraKit PVM/
├── backend/
│   ├── app/
│   │   ├── api/routes/     # Endpoints
│   │   ├── core/           # Config, logger
│   │   ├── db/             # Supabase client
│   │   ├── models/         # Pydantic schemas
│   │   └── services/       # Encryption, AI
│   └── requirements.txt
├── supabase/
│   ├── migrations/         # SQL migrations
│   └── seeds/              # Initial data
└── README.md
```

## 📄 API Endpoints

- `GET /api/v1/health` - Health check
- `GET /api/v1/ai-configs/providers` - Lista proveedores de IA
- `POST /api/v1/ai-configs/` - Crear configuración
- `GET /api/v1/ai-configs/` - Listar configuraciones

## 📝 Licencia

MIT
