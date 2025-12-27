# 🚀 Guía de Despliegue - SonoraKit PVM

## Índice
- [Backend - Fly.io](#backend---flyio)
- [Frontend - Vercel](#frontend---vercel)
- [Variables de Entorno](#variables-de-entorno)

---

## Backend - Fly.io

### 1. Prerrequisitos

```bash
# Instalar Fly CLI
# Windows (PowerShell como admin)
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"

# O con Scoop
scoop install flyctl

# Verificar instalación
fly version

# Login en Fly.io
fly auth login
```

### 2. Primera vez - Crear la app

```bash
cd backend

# Crear app de producción
fly launch --config fly.prod.toml --name sonorakit-api --no-deploy

# Verificar que se creó
fly apps list
```

### 3. Configurar Secrets (Variables de Entorno Sensibles)

```bash
# ⚠️ IMPORTANTE: Configura estos secrets ANTES de desplegar

# Master Key para encriptación de API keys
fly secrets set MASTER_KEY="tu_fernet_key_base64" --app sonorakit-api

# Secret Key para JWT
fly secrets set SECRET_KEY="tu_secret_key_seguro" --app sonorakit-api

# Database URL de Neon
fly secrets set DATABASE_URL="postgresql+asyncpg://user:password@host/database?sslmode=require" --app sonorakit-api

# Firebase
fly secrets set FIREBASE_PROJECT_ID="tu_project_id" --app sonorakit-api
fly secrets set FIREBASE_API_KEY="tu_firebase_api_key" --app sonorakit-api

# Verificar secrets configurados
fly secrets list --app sonorakit-api
```

### 4. Desplegar

```bash
cd backend

# Deploy a producción
fly deploy --config fly.prod.toml

# Ver logs en tiempo real
fly logs --app sonorakit-api

# Ver estado de la app
fly status --app sonorakit-api
```

### 5. Comandos Útiles

```bash
# SSH a la máquina
fly ssh console --app sonorakit-api

# Reiniciar app
fly apps restart sonorakit-api

# Escalar (más memoria/CPU)
fly scale memory 1024 --app sonorakit-api
fly scale count 2 --app sonorakit-api  # 2 instancias

# Ver métricas
fly dashboard --app sonorakit-api

# Destruir app (cuidado!)
fly apps destroy sonorakit-api
```

### 6. URL de Producción

Una vez desplegado, tu API estará disponible en:
```
https://sonorakit-api.fly.dev
```

---

## Frontend - Vercel

### Opción A: Deploy desde CLI

#### 1. Instalar Vercel CLI

```bash
npm install -g vercel
```

#### 2. Login

```bash
vercel login
```

#### 3. Configurar Proyecto

```bash
cd frontend

# Primera vez - configurar proyecto
vercel

# Responder las preguntas:
# - Set up and deploy? Yes
# - Which scope? Tu cuenta
# - Link to existing project? No (o Yes si ya existe)
# - Project name? sonorakit
# - Directory? ./
# - Override settings? No
```

#### 4. Configurar Variables de Entorno en Vercel

```bash
# Desde CLI
vercel env add VITE_API_URL production
# Valor: https://sonorakit-api.fly.dev

vercel env add VITE_FIREBASE_API_KEY production
vercel env add VITE_FIREBASE_AUTH_DOMAIN production
vercel env add VITE_FIREBASE_PROJECT_ID production
vercel env add VITE_FIREBASE_STORAGE_BUCKET production
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID production
vercel env add VITE_FIREBASE_APP_ID production
```

#### 5. Deploy a Producción

```bash
cd frontend

# Build y deploy
vercel --prod
```

### Opción B: Deploy desde GitHub (Recomendado)

1. **Conectar repositorio en Vercel Dashboard**
   - Ve a [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Importa tu repositorio de GitHub
   - Selecciona la carpeta `frontend` como root

2. **Configurar Build Settings**
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

3. **Agregar Variables de Entorno**
   - En Project Settings > Environment Variables
   - Añade todas las variables VITE_*

4. **Dominios Personalizados**
   - En Project Settings > Domains
   - Añade tu dominio personalizado

---

## Variables de Entorno

### Backend (.env para local / Secrets en Fly.io)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DEBUG` | Modo debug | `false` |
| `MASTER_KEY` | Fernet key para encriptar API keys | `base64_key...` |
| `SECRET_KEY` | Secret para tokens | `random_string` |
| `DATABASE_URL` | URL de Neon PostgreSQL | `postgresql+asyncpg://...` |
| `FIREBASE_PROJECT_ID` | ID del proyecto Firebase | `sonorakit-xxxxx` |
| `FIREBASE_API_KEY` | API Key de Firebase | `AIza...` |
| `ALLOWED_ORIGINS` | CORS origins permitidos | `https://sonorakit.vercel.app` |

### Frontend (.env para local / Environment Variables en Vercel)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_API_URL` | URL del backend | `https://sonorakit-api.fly.dev` |
| `VITE_FIREBASE_API_KEY` | Firebase API Key | `AIza...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | `sonorakit.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID | `sonorakit-xxxxx` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage | `sonorakit.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Sender ID | `123456789` |
| `VITE_FIREBASE_APP_ID` | Firebase App ID | `1:123:web:abc` |

---

## Generar MASTER_KEY (Fernet)

```python
from cryptography.fernet import Fernet
key = Fernet.generate_key()
print(key.decode())
```

O desde terminal:
```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

---

## Checklist de Despliegue

### Backend
- [ ] Fly CLI instalado y logueado
- [ ] App creada en Fly.io
- [ ] MASTER_KEY generado y configurado
- [ ] DATABASE_URL de Neon configurado
- [ ] Firebase credentials configurados
- [ ] ALLOWED_ORIGINS actualizado con URL del frontend
- [ ] Deploy exitoso
- [ ] Health check funcionando: `https://sonorakit-api.fly.dev/api/v1/health`

### Frontend
- [ ] Vercel CLI instalado (o GitHub conectado)
- [ ] Proyecto configurado
- [ ] Variables de entorno VITE_* configuradas
- [ ] VITE_API_URL apuntando al backend de producción
- [ ] Deploy exitoso
- [ ] Login/Auth funcionando

### Post-Deploy
- [ ] Probar flujo completo de autenticación
- [ ] Probar chat con IA
- [ ] Verificar CORS funcionando
- [ ] Configurar dominio personalizado (opcional)
- [ ] Configurar alertas/monitoreo (opcional)

---

## Troubleshooting

### Error: CORS
```
Verificar que ALLOWED_ORIGINS en fly.prod.toml incluya la URL de Vercel
```

### Error: Database connection
```bash
# Verificar que DATABASE_URL tiene ?sslmode=require al final
fly secrets set DATABASE_URL="...?sslmode=require" --app sonorakit-api
```

### Error: Firebase token invalid
```
Verificar que FIREBASE_API_KEY es el correcto (Web API Key, no Server Key)
```

### Ver logs de errores
```bash
fly logs --app sonorakit-api
```
