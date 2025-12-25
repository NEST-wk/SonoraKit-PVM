-- =====================================================
-- SONORAKIT PVM - Schema Inicial
-- =====================================================

-- Extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLA: profiles (configuración de usuario)
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    avatar_url TEXT,
    
    -- Configuración de UI (JSONB flexible)
    ui_config JSONB DEFAULT '{
        "theme": "dark",
        "language": "es",
        "primary_color": "#6366f1",
        "background_type": "gradient",
        "background_value": "from-slate-900 to-slate-800"
    }'::jsonb,
    
    -- Configuración de componentes
    components_config JSONB DEFAULT '{
        "chat_bubble_style": "modern",
        "input_style": "floating",
        "show_timestamps": true,
        "show_avatars": true,
        "animations_enabled": true
    }'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLA: ai_providers_catalog (catálogo de proveedores)
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_providers_catalog (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    base_url TEXT,
    is_active BOOLEAN DEFAULT true,
    
    -- Modelos disponibles (JSONB array)
    models JSONB DEFAULT '[]'::jsonb,
    
    -- Config por defecto
    default_params JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLA: ai_configs (configuraciones de usuario por proveedor)
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider_name TEXT NOT NULL REFERENCES ai_providers_catalog(name),
    
    -- API key cifrada
    encrypted_key TEXT NOT NULL,
    
    -- Modelo seleccionado
    selected_model TEXT NOT NULL,
    
    -- Parámetros personalizados
    custom_params JSONB DEFAULT '{}'::jsonb,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Un usuario solo puede tener una config por proveedor
    UNIQUE(user_id, provider_name)
);

-- =====================================================
-- TABLA: chats (conversaciones)
-- =====================================================
CREATE TABLE IF NOT EXISTS chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'Nueva conversación',
    
    -- Proveedor y modelo usado
    provider_name TEXT REFERENCES ai_providers_catalog(name),
    model_id TEXT,
    
    -- Metadata
    message_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLA: messages (mensajes de chat)
-- =====================================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    
    -- Metadata del mensaje
    tokens_used INTEGER,
    model_id TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLA: audit_logs (auditoría de seguridad)
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id TEXT,
    
    details JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_ai_configs_user_id ON ai_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_configs_provider ON ai_configs(provider_name);
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id);
CREATE INDEX IF NOT EXISTS idx_chats_updated ON chats(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- =====================================================
-- TRIGGERS: auto-update updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_profiles_updated
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_ai_configs_updated
    BEFORE UPDATE ON ai_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_chats_updated
    BEFORE UPDATE ON chats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- TRIGGER: crear perfil automáticamente
-- =====================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, display_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
