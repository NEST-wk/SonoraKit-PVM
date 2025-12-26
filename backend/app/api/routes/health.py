"""
Endpoints de health check y inicialización.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.db.database import get_db

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("")
async def health_check():
    """Health check básico."""
    return {"status": "healthy"}


@router.post("/init-providers")
async def init_providers(db: AsyncSession = Depends(get_db)):
    """Inicializa los proveedores de IA en la base de datos."""

    providers_sql = """
    INSERT INTO ai_providers_catalog (id, name, display_name, base_url, models, default_params, is_active) VALUES
    (gen_random_uuid(), 'openai', 'OpenAI', 'https://api.openai.com/v1', 
     '[{"id": "gpt-4o", "name": "GPT-4o"}, {"id": "gpt-4o-mini", "name": "GPT-4o Mini"}, {"id": "gpt-4-turbo", "name": "GPT-4 Turbo"}, {"id": "gpt-3.5-turbo", "name": "GPT-3.5 Turbo"}]'::jsonb, 
     '{"temperature": 0.7}'::jsonb, true),
    (gen_random_uuid(), 'anthropic', 'Anthropic', 'https://api.anthropic.com/v1', 
     '[{"id": "claude-3-5-sonnet-20241022", "name": "Claude 3.5 Sonnet"}, {"id": "claude-3-5-haiku-20241022", "name": "Claude 3.5 Haiku"}, {"id": "claude-3-opus-20240229", "name": "Claude 3 Opus"}]'::jsonb, 
     '{"temperature": 0.7}'::jsonb, true),
    (gen_random_uuid(), 'google', 'Google AI', 'https://generativelanguage.googleapis.com/v1beta', 
     '[{"id": "gemini-2.0-flash-exp", "name": "Gemini 2.0 Flash"}, {"id": "gemini-1.5-pro", "name": "Gemini 1.5 Pro"}, {"id": "gemini-1.5-flash", "name": "Gemini 1.5 Flash"}]'::jsonb, 
     '{"temperature": 0.7}'::jsonb, true),
    (gen_random_uuid(), 'mistral', 'Mistral AI', 'https://api.mistral.ai/v1', 
     '[{"id": "mistral-large-latest", "name": "Mistral Large"}, {"id": "mistral-medium-latest", "name": "Mistral Medium"}, {"id": "mistral-small-latest", "name": "Mistral Small"}, {"id": "codestral-latest", "name": "Codestral"}]'::jsonb, 
     '{"temperature": 0.7}'::jsonb, true),
    (gen_random_uuid(), 'cohere', 'Cohere', 'https://api.cohere.ai/v2', 
     '[{"id": "command-r-plus", "name": "Command R+"}, {"id": "command-r", "name": "Command R"}, {"id": "command", "name": "Command"}]'::jsonb, 
     '{"temperature": 0.7}'::jsonb, true),
    (gen_random_uuid(), 'groq', 'Groq', 'https://api.groq.com/openai/v1', 
     '[{"id": "llama-3.3-70b-versatile", "name": "Llama 3.3 70B"}, {"id": "llama-3.1-8b-instant", "name": "Llama 3.1 8B"}, {"id": "mixtral-8x7b-32768", "name": "Mixtral 8x7B"}, {"id": "gemma2-9b-it", "name": "Gemma 2 9B"}]'::jsonb, 
     '{"temperature": 0.7}'::jsonb, true),
    (gen_random_uuid(), 'openrouter', 'OpenRouter', 'https://openrouter.ai/api/v1', 
     '[{"id": "openai/gpt-4o", "name": "GPT-4o (via OpenRouter)"}, {"id": "anthropic/claude-3.5-sonnet", "name": "Claude 3.5 Sonnet (via OpenRouter)"}, {"id": "google/gemini-pro-1.5", "name": "Gemini Pro 1.5 (via OpenRouter)"}, {"id": "meta-llama/llama-3.1-405b-instruct", "name": "Llama 3.1 405B"}]'::jsonb, 
     '{"temperature": 0.7}'::jsonb, true)
    ON CONFLICT (name) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        base_url = EXCLUDED.base_url,
        models = EXCLUDED.models,
        default_params = EXCLUDED.default_params,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();
    """

    await db.execute(text(providers_sql))
    await db.commit()

    return {"status": "ok", "message": "Providers initialized successfully"}
