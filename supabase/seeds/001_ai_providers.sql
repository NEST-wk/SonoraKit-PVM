-- =====================================================
-- SONORAKIT PVM - Seed de Proveedores de IA
-- =====================================================

INSERT INTO ai_providers_catalog (name, display_name, base_url, models, default_params) VALUES

-- OpenAI
('openai', 'OpenAI', 'https://api.openai.com/v1', '[
    {"id": "gpt-4o", "name": "GPT-4o", "context_window": 128000, "supports_vision": true},
    {"id": "gpt-4o-mini", "name": "GPT-4o Mini", "context_window": 128000, "supports_vision": true},
    {"id": "gpt-4-turbo", "name": "GPT-4 Turbo", "context_window": 128000, "supports_vision": true},
    {"id": "gpt-4", "name": "GPT-4", "context_window": 8192, "supports_vision": false},
    {"id": "gpt-3.5-turbo", "name": "GPT-3.5 Turbo", "context_window": 16385, "supports_vision": false},
    {"id": "o1-preview", "name": "O1 Preview", "context_window": 128000, "supports_vision": false},
    {"id": "o1-mini", "name": "O1 Mini", "context_window": 128000, "supports_vision": false}
]'::jsonb, '{"temperature": 0.7, "max_tokens": 4096}'::jsonb),

-- Anthropic
('anthropic', 'Anthropic', 'https://api.anthropic.com/v1', '[
    {"id": "claude-3-5-sonnet-20241022", "name": "Claude 3.5 Sonnet", "context_window": 200000, "supports_vision": true},
    {"id": "claude-3-5-haiku-20241022", "name": "Claude 3.5 Haiku", "context_window": 200000, "supports_vision": true},
    {"id": "claude-3-opus-20240229", "name": "Claude 3 Opus", "context_window": 200000, "supports_vision": true},
    {"id": "claude-3-sonnet-20240229", "name": "Claude 3 Sonnet", "context_window": 200000, "supports_vision": true},
    {"id": "claude-3-haiku-20240307", "name": "Claude 3 Haiku", "context_window": 200000, "supports_vision": true}
]'::jsonb, '{"temperature": 0.7, "max_tokens": 4096}'::jsonb),

-- Google
('google', 'Google AI', 'https://generativelanguage.googleapis.com/v1beta', '[
    {"id": "gemini-2.0-flash-exp", "name": "Gemini 2.0 Flash", "context_window": 1000000, "supports_vision": true},
    {"id": "gemini-1.5-pro", "name": "Gemini 1.5 Pro", "context_window": 2000000, "supports_vision": true},
    {"id": "gemini-1.5-flash", "name": "Gemini 1.5 Flash", "context_window": 1000000, "supports_vision": true},
    {"id": "gemini-1.5-flash-8b", "name": "Gemini 1.5 Flash 8B", "context_window": 1000000, "supports_vision": true},
    {"id": "gemini-1.0-pro", "name": "Gemini 1.0 Pro", "context_window": 32000, "supports_vision": false}
]'::jsonb, '{"temperature": 0.7, "max_tokens": 4096}'::jsonb),

-- Mistral
('mistral', 'Mistral AI', 'https://api.mistral.ai/v1', '[
    {"id": "mistral-large-latest", "name": "Mistral Large", "context_window": 128000, "supports_vision": false},
    {"id": "mistral-medium-latest", "name": "Mistral Medium", "context_window": 32000, "supports_vision": false},
    {"id": "mistral-small-latest", "name": "Mistral Small", "context_window": 32000, "supports_vision": false},
    {"id": "open-mixtral-8x22b", "name": "Mixtral 8x22B", "context_window": 64000, "supports_vision": false},
    {"id": "open-mixtral-8x7b", "name": "Mixtral 8x7B", "context_window": 32000, "supports_vision": false},
    {"id": "open-mistral-7b", "name": "Mistral 7B", "context_window": 32000, "supports_vision": false},
    {"id": "codestral-latest", "name": "Codestral", "context_window": 32000, "supports_vision": false},
    {"id": "pixtral-12b-2409", "name": "Pixtral 12B", "context_window": 128000, "supports_vision": true}
]'::jsonb, '{"temperature": 0.7, "max_tokens": 4096}'::jsonb),

-- Cohere
('cohere', 'Cohere', 'https://api.cohere.ai/v1', '[
    {"id": "command-r-plus", "name": "Command R+", "context_window": 128000, "supports_vision": false},
    {"id": "command-r", "name": "Command R", "context_window": 128000, "supports_vision": false},
    {"id": "command", "name": "Command", "context_window": 4096, "supports_vision": false},
    {"id": "command-light", "name": "Command Light", "context_window": 4096, "supports_vision": false}
]'::jsonb, '{"temperature": 0.7, "max_tokens": 4096}'::jsonb),

-- Groq
('groq', 'Groq', 'https://api.groq.com/openai/v1', '[
    {"id": "llama-3.3-70b-versatile", "name": "Llama 3.3 70B", "context_window": 128000, "supports_vision": false},
    {"id": "llama-3.1-70b-versatile", "name": "Llama 3.1 70B", "context_window": 128000, "supports_vision": false},
    {"id": "llama-3.1-8b-instant", "name": "Llama 3.1 8B", "context_window": 128000, "supports_vision": false},
    {"id": "llama3-70b-8192", "name": "Llama 3 70B", "context_window": 8192, "supports_vision": false},
    {"id": "llama3-8b-8192", "name": "Llama 3 8B", "context_window": 8192, "supports_vision": false},
    {"id": "mixtral-8x7b-32768", "name": "Mixtral 8x7B", "context_window": 32768, "supports_vision": false},
    {"id": "gemma2-9b-it", "name": "Gemma 2 9B", "context_window": 8192, "supports_vision": false}
]'::jsonb, '{"temperature": 0.7, "max_tokens": 4096}'::jsonb),

-- OpenRouter
('openrouter', 'OpenRouter', 'https://openrouter.ai/api/v1', '[
    {"id": "openai/gpt-4o", "name": "GPT-4o (via OpenRouter)", "context_window": 128000, "supports_vision": true},
    {"id": "anthropic/claude-3.5-sonnet", "name": "Claude 3.5 Sonnet (via OpenRouter)", "context_window": 200000, "supports_vision": true},
    {"id": "google/gemini-pro-1.5", "name": "Gemini 1.5 Pro (via OpenRouter)", "context_window": 2000000, "supports_vision": true},
    {"id": "meta-llama/llama-3.1-405b-instruct", "name": "Llama 3.1 405B", "context_window": 128000, "supports_vision": false},
    {"id": "mistralai/mistral-large", "name": "Mistral Large (via OpenRouter)", "context_window": 128000, "supports_vision": false},
    {"id": "deepseek/deepseek-chat", "name": "DeepSeek Chat", "context_window": 64000, "supports_vision": false},
    {"id": "qwen/qwen-2.5-72b-instruct", "name": "Qwen 2.5 72B", "context_window": 128000, "supports_vision": false}
]'::jsonb, '{"temperature": 0.7, "max_tokens": 4096}'::jsonb)

ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    base_url = EXCLUDED.base_url,
    models = EXCLUDED.models,
    default_params = EXCLUDED.default_params,
    updated_at = NOW();
