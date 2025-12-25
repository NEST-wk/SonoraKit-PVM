-- =====================================================
-- SONORAKIT PVM - Row Level Security (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLICIES: profiles
-- =====================================================
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Service role puede todo
CREATE POLICY "Service role full access to profiles"
    ON profiles FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- POLICIES: ai_configs
-- =====================================================
CREATE POLICY "Users can view own ai_configs"
    ON ai_configs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ai_configs"
    ON ai_configs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ai_configs"
    ON ai_configs FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ai_configs"
    ON ai_configs FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to ai_configs"
    ON ai_configs FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- POLICIES: chats
-- =====================================================
CREATE POLICY "Users can view own chats"
    ON chats FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chats"
    ON chats FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chats"
    ON chats FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own chats"
    ON chats FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to chats"
    ON chats FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- POLICIES: messages
-- =====================================================
CREATE POLICY "Users can view messages of own chats"
    ON messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM chats
            WHERE chats.id = messages.chat_id
            AND chats.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages to own chats"
    ON messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM chats
            WHERE chats.id = messages.chat_id
            AND chats.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete messages from own chats"
    ON messages FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM chats
            WHERE chats.id = messages.chat_id
            AND chats.user_id = auth.uid()
        )
    );

CREATE POLICY "Service role full access to messages"
    ON messages FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- POLICIES: audit_logs (solo lectura para usuarios)
-- =====================================================
CREATE POLICY "Users can view own audit_logs"
    ON audit_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to audit_logs"
    ON audit_logs FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- POLICIES: ai_providers_catalog (público de lectura)
-- =====================================================
-- Esta tabla no tiene RLS, es pública para lectura
GRANT SELECT ON ai_providers_catalog TO anon, authenticated;
