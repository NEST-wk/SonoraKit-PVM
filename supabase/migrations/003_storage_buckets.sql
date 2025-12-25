-- =====================================================
-- SONORAKIT PVM - Storage Buckets
-- =====================================================

-- Bucket para fondos personalizados (privado)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('user-backgrounds', 'user-backgrounds', false, 5242880)
ON CONFLICT (id) DO NOTHING;

-- Bucket para avatares (público)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('avatars', 'avatars', true, 2097152)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- POLICIES: user-backgrounds
-- =====================================================
CREATE POLICY "Users can upload own backgrounds"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'user-backgrounds'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view own backgrounds"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'user-backgrounds'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own backgrounds"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'user-backgrounds'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- =====================================================
-- POLICIES: avatars (público)
-- =====================================================
CREATE POLICY "Users can upload own avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'avatars'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Anyone can view avatars"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

CREATE POLICY "Users can update own avatar"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'avatars'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own avatar"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'avatars'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );
