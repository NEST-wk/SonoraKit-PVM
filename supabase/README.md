# Supabase - SonoraKit PVM

## Estructura de Migraciones

```
supabase/
├── migrations/
│   ├── 001_initial_schema.sql   # Tablas base
│   ├── 002_rls_policies.sql     # Row Level Security
│   └── 003_storage_buckets.sql  # Storage para archivos
└── seeds/
    └── 001_ai_providers.sql     # 7 proveedores de IA
```

## Aplicar Migraciones

### En Supabase Dashboard:
1. Ve a SQL Editor
2. Ejecuta cada archivo en orden:
   - `001_initial_schema.sql`
   - `002_rls_policies.sql`
   - `003_storage_buckets.sql`
   - `seeds/001_ai_providers.sql`

### Con Supabase CLI:
```bash
supabase db push
supabase db seed
```

## Tablas

| Tabla | Descripción |
|-------|-------------|
| `profiles` | Config de usuario (UI, tema, idioma) |
| `ai_providers_catalog` | Catálogo de proveedores de IA |
| `ai_configs` | API keys cifradas por usuario |
| `chats` | Conversaciones |
| `messages` | Mensajes de chat |
| `audit_logs` | Logs de seguridad |

## Proveedores Incluidos

1. **OpenAI** - GPT-4o, GPT-4, GPT-3.5, O1
2. **Anthropic** - Claude 3.5, Claude 3
3. **Google** - Gemini 2.0, 1.5 Pro/Flash
4. **Mistral** - Large, Medium, Small, Codestral
5. **Cohere** - Command R+, Command R
6. **Groq** - Llama 3.3, Mixtral, Gemma
7. **OpenRouter** - Multi-provider gateway

## Storage Buckets

- `user-backgrounds` - Fondos personalizados (privado, 5MB max)
- `avatars` - Avatares de usuario (público, 2MB max)
