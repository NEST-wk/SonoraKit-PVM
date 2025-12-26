import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { HiArrowLeft, HiKey, HiCheck, HiXMark, HiEye, HiEyeSlash } from 'react-icons/hi2'
import { SiOpenai, SiGoogle } from 'react-icons/si'
import { TbBrandOpenai, TbBolt, TbCloud, TbRouter, TbBrain } from 'react-icons/tb'

const API_URL = import.meta.env.VITE_API_URL || 'https://sonorakit-api-dev.fly.dev'

interface AIConfig {
  id: string
  provider_name: string
  selected_model: string
  is_active: boolean
  has_key: boolean
}

interface Provider {
  id: string
  name: string
  icon: React.ReactNode
  models: { id: string; name: string }[]
  description: string
  color: string
}

const providers: Provider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    icon: <SiOpenai style={{ fontSize: '1.5rem' }} />,
    models: [
      { id: 'gpt-4o', name: 'GPT-4o' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' }
    ],
    description: 'ChatGPT y GPT-4 - Los modelos más populares',
    color: '#10a37f'
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    icon: <TbBrandOpenai style={{ fontSize: '1.5rem' }} />,
    models: [
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet' },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku' },
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' }
    ],
    description: 'Claude - Modelos seguros y útiles',
    color: '#d4a574'
  },
  {
    id: 'google',
    name: 'Google AI',
    icon: <SiGoogle style={{ fontSize: '1.5rem' }} />,
    models: [
      { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' }
    ],
    description: 'Gemini - IA de Google',
    color: '#4285f4'
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    icon: <TbBrain style={{ fontSize: '1.5rem' }} />,
    models: [
      { id: 'mistral-large-latest', name: 'Mistral Large' },
      { id: 'mistral-medium-latest', name: 'Mistral Medium' },
      { id: 'mistral-small-latest', name: 'Mistral Small' },
      { id: 'codestral-latest', name: 'Codestral' }
    ],
    description: 'Mistral - IA europea de alto rendimiento',
    color: '#ff7000'
  },
  {
    id: 'cohere',
    name: 'Cohere',
    icon: <TbCloud style={{ fontSize: '1.5rem' }} />,
    models: [
      { id: 'command-r-plus', name: 'Command R+' },
      { id: 'command-r', name: 'Command R' },
      { id: 'command', name: 'Command' }
    ],
    description: 'Cohere - Especializado en empresas',
    color: '#39594d'
  },
  {
    id: 'groq',
    name: 'Groq',
    icon: <TbBolt style={{ fontSize: '1.5rem' }} />,
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B' },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B' },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B' },
      { id: 'gemma2-9b-it', name: 'Gemma 2 9B' }
    ],
    description: 'Groq - Inferencia ultra rápida',
    color: '#f55036'
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    icon: <TbRouter style={{ fontSize: '1.5rem' }} />,
    models: [
      { id: 'openai/gpt-4o', name: 'GPT-4o (via OpenRouter)' },
      { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet (via OpenRouter)' },
      { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5 (via OpenRouter)' },
      { id: 'meta-llama/llama-3.1-405b-instruct', name: 'Llama 3.1 405B' }
    ],
    description: 'OpenRouter - Acceso a múltiples modelos',
    color: '#6366f1'
  }
]

export default function SettingsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [configs, setConfigs] = useState<AIConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({})
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [selectedModels, setSelectedModels] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    loadConfigs()
  }, [user])

  const loadConfigs = async () => {
    if (!user) return
    try {
      const token = await user.getIdToken()
      const response = await fetch(`${API_URL}/api/v1/ai-configs/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setConfigs(data)
        
        // Pre-fill selected models
        const models: Record<string, string> = {}
        data.forEach((c: AIConfig) => {
          models[c.provider_name] = c.selected_model
        })
        setSelectedModels(models)
      }
    } catch (err) {
      console.error('Error loading configs:', err)
    } finally {
      setLoading(false)
    }
  }

  const saveApiKey = async (providerId: string) => {
    if (!user || !apiKeys[providerId]) return
    
    setSaving(providerId)
    setMessage(null)
    
    try {
      const token = await user.getIdToken()
      const existingConfig = configs.find(c => c.provider_name === providerId)
      
      const url = existingConfig 
        ? `${API_URL}/api/v1/ai-configs/${providerId}`
        : `${API_URL}/api/v1/ai-configs/`
      
      const method = existingConfig ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          provider_name: providerId,
          api_key: apiKeys[providerId],
          selected_model: selectedModels[providerId] || providers.find(p => p.id === providerId)?.models[0]?.id
        })
      })
      
      if (response.ok) {
        const providerName = providers.find(p => p.id === providerId)?.name || providerId
        setMessage({ type: 'success', text: `API key de ${providerName} guardada correctamente` })
        setApiKeys(prev => ({ ...prev, [providerId]: '' }))
        await loadConfigs()
      } else {
        const error = await response.json()
        throw new Error(error.detail || 'Error al guardar')
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error al guardar API key' })
    } finally {
      setSaving(null)
    }
  }

  const deleteConfig = async (providerId: string) => {
    if (!user) return
    
    try {
      const token = await user.getIdToken()
      const response = await fetch(`${API_URL}/api/v1/ai-configs/${providerId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.ok) {
        const providerName = providers.find(p => p.id === providerId)?.name || providerId
        setMessage({ type: 'success', text: `API key de ${providerName} eliminada` })
        await loadConfigs()
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al eliminar API key' })
    }
  }

  const getConfigForProvider = (providerId: string) => {
    return configs.find(c => c.provider_name === providerId)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0f', color: 'white' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '1rem 2rem' }}>
        <div style={{ maxWidth: '64rem', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => navigate('/chat')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '0.875rem' }}
          >
            <HiArrowLeft />
            <span>Volver al Chat</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '64rem', margin: '0 auto', padding: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Configuración</h1>
          <p style={{ color: '#9ca3af' }}>Configura tus API keys de los proveedores de IA para empezar a chatear</p>
        </div>

        {/* Message */}
        {message && (
          <div style={{ 
            padding: '1rem', 
            marginBottom: '1.5rem', 
            borderRadius: '0.75rem',
            backgroundColor: message.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${message.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            color: message.type === 'success' ? '#22c55e' : '#ef4444',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {message.type === 'success' ? <HiCheck /> : <HiXMark />}
            {message.text}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
            Cargando configuración...
          </div>
        ) : (
          /* Provider Grid */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {providers.map(provider => {
              const config = getConfigForProvider(provider.id)
              const hasKey = config?.has_key
              
              return (
                <div
                  key={provider.id}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    borderRadius: '1rem',
                    border: hasKey ? `1px solid ${provider.color}40` : '1px solid rgba(255,255,255,0.1)',
                    padding: '1.5rem',
                    transition: 'all 0.2s'
                  }}
                >
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{ color: provider.color }}>{provider.icon}</div>
                    <div>
                      <h3 style={{ fontWeight: 600, fontSize: '1.125rem' }}>{provider.name}</h3>
                      <p style={{ color: '#6b7280', fontSize: '0.75rem' }}>{provider.description}</p>
                    </div>
                    {hasKey && (
                      <div style={{ marginLeft: 'auto', backgroundColor: `${provider.color}20`, color: provider.color, padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <HiCheck style={{ fontSize: '0.75rem' }} />
                        Activo
                      </div>
                    )}
                  </div>

                  {/* Model Selector */}
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.5rem' }}>
                      Modelo
                    </label>
                    <select
                      value={selectedModels[provider.id] || provider.models[0]?.id}
                      onChange={(e) => setSelectedModels(prev => ({ ...prev, [provider.id]: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '0.625rem 0.75rem',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '0.5rem',
                        color: 'white',
                        fontSize: '0.875rem',
                        cursor: 'pointer'
                      }}
                    >
                      {provider.models.map(model => (
                        <option key={model.id} value={model.id} style={{ backgroundColor: '#1a1a2e' }}>
                          {model.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* API Key Input */}
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.5rem' }}>
                      <HiKey style={{ display: 'inline', marginRight: '0.25rem' }} />
                      API Key {hasKey && '(ya configurada)'}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showKeys[provider.id] ? 'text' : 'password'}
                        placeholder={hasKey ? '••••••••••••••••' : 'Ingresa tu API key'}
                        value={apiKeys[provider.id] || ''}
                        onChange={(e) => setApiKeys(prev => ({ ...prev, [provider.id]: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '0.625rem 2.5rem 0.625rem 0.75rem',
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '0.5rem',
                          color: 'white',
                          fontSize: '0.875rem',
                          boxSizing: 'border-box'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowKeys(prev => ({ ...prev, [provider.id]: !prev[provider.id] }))}
                        style={{
                          position: 'absolute',
                          right: '0.75rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: '#6b7280',
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        {showKeys[provider.id] ? <HiEyeSlash /> : <HiEye />}
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => saveApiKey(provider.id)}
                      disabled={saving === provider.id || !apiKeys[provider.id]}
                      style={{
                        flex: 1,
                        padding: '0.625rem',
                        backgroundColor: provider.color,
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontWeight: 500,
                        fontSize: '0.875rem',
                        cursor: saving === provider.id || !apiKeys[provider.id] ? 'not-allowed' : 'pointer',
                        opacity: saving === provider.id || !apiKeys[provider.id] ? 0.5 : 1,
                        transition: 'opacity 0.2s'
                      }}
                    >
                      {saving === provider.id ? 'Guardando...' : hasKey ? 'Actualizar' : 'Guardar'}
                    </button>
                    {hasKey && (
                      <button
                        onClick={() => deleteConfig(provider.id)}
                        style={{
                          padding: '0.625rem 1rem',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          color: '#ef4444',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '0.5rem',
                          fontWeight: 500,
                          fontSize: '0.875rem',
                          cursor: 'pointer'
                        }}
                      >
                        <HiXMark />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Info */}
        <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: '0.75rem', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#818cf8' }}>💡 ¿Cómo obtener API keys?</h3>
          <ul style={{ color: '#9ca3af', fontSize: '0.875rem', lineHeight: 1.6, paddingLeft: '1.25rem', margin: 0 }}>
            <li><strong>OpenAI:</strong> <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener" style={{ color: '#818cf8' }}>platform.openai.com/api-keys</a></li>
            <li><strong>Anthropic:</strong> <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener" style={{ color: '#818cf8' }}>console.anthropic.com/settings/keys</a></li>
            <li><strong>Google AI:</strong> <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener" style={{ color: '#818cf8' }}>aistudio.google.com/app/apikey</a></li>
            <li><strong>Mistral:</strong> <a href="https://console.mistral.ai/api-keys" target="_blank" rel="noopener" style={{ color: '#818cf8' }}>console.mistral.ai/api-keys</a></li>
            <li><strong>Cohere:</strong> <a href="https://dashboard.cohere.com/api-keys" target="_blank" rel="noopener" style={{ color: '#818cf8' }}>dashboard.cohere.com/api-keys</a></li>
            <li><strong>Groq:</strong> <a href="https://console.groq.com/keys" target="_blank" rel="noopener" style={{ color: '#818cf8' }}>console.groq.com/keys</a></li>
            <li><strong>OpenRouter:</strong> <a href="https://openrouter.ai/keys" target="_blank" rel="noopener" style={{ color: '#818cf8' }}>openrouter.ai/keys</a></li>
          </ul>
        </div>
      </div>
    </div>
  )
}
