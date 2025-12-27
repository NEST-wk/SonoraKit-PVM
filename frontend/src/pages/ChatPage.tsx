import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { HiPaperAirplane, HiPlus, HiCog6Tooth, HiArrowRightOnRectangle, HiSparkles, HiChatBubbleLeftRight, HiTrash } from 'react-icons/hi2'
import DarkVeil from '../components/DarkVeil'

const API_URL = import.meta.env.VITE_API_URL || 'https://sonorakit-api-dev.fly.dev'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatHistory {
  id: string
  title: string
  provider_name: string
  model_id: string
  message_count: number
  updated_at: string
}

export default function ChatPage() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState('groq')
  const [selectedModel, setSelectedModel] = useState('llama-3.3-70b-versatile')
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([])
  const [, setError] = useState<string | null>(null)
  const [configuredProviders, setConfiguredProviders] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const providers = [
    { id: 'openai', name: 'OpenAI', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
    { id: 'anthropic', name: 'Anthropic', models: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'] },
    { id: 'google', name: 'Google', models: ['gemini-2.0-flash-exp', 'gemini-1.5-pro', 'gemini-1.5-flash'] },
    { id: 'mistral', name: 'Mistral', models: ['mistral-large-latest', 'mistral-medium-latest', 'mistral-small-latest', 'codestral-latest'] },
    { id: 'cohere', name: 'Cohere', models: ['command-r-plus', 'command-r', 'command'] },
    { id: 'groq', name: 'Groq', models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'gemma2-9b-it'] },
    { id: 'openrouter', name: 'OpenRouter', models: ['openai/gpt-4o', 'anthropic/claude-3.5-sonnet', 'google/gemini-pro-1.5', 'meta-llama/llama-3.1-405b-instruct'] },
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Cargar proveedores configurados del usuario
  useEffect(() => {
    const loadUserConfigs = async () => {
      if (!user) return
      try {
        const token = await user.getIdToken()
        const response = await fetch(`${API_URL}/api/v1/ai-configs/`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (response.ok) {
          const configs = await response.json()
          const configuredList = configs.filter((c: any) => c.has_api_key).map((c: any) => c.provider_name)
          // setConfiguredProviders se usa para actualizar estado interno
          void configuredProviders // suprimir warning de eslint
          setConfiguredProviders(configuredList)
          
          // Seleccionar el primer proveedor configurado
          if (configuredList.length > 0 && !configuredList.includes(selectedProvider)) {
            const firstProvider = configuredList[0]
            setSelectedProvider(firstProvider)
            const providerData = providers.find(p => p.id === firstProvider)
            if (providerData && providerData.models.length > 0) {
              setSelectedModel(providerData.models[0])
            }
          }
        }
      } catch (err) {
        console.error('Error loading user configs:', err)
      }
    }
    loadUserConfigs()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Cargar historial de chats
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!user) return
      try {
        const token = await user.getIdToken()
        const response = await fetch(`${API_URL}/api/v1/chat/history`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (response.ok) {
          const data = await response.json()
          setChatHistory(data)
        }
      } catch (err) {
        console.error('Error loading chat history:', err)
      }
    }
    loadChatHistory()
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const token = await user?.getIdToken()
      
      // Preparar mensajes para la API
      const allMessages = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content
      }))

      const response = await fetch(`${API_URL}/api/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          provider: selectedProvider,
          model: selectedModel,
          messages: allMessages,
          chat_id: currentChatId,
          stream: false
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Error al enviar mensaje')
      }

      const data = await response.json()
      
      // Actualizar chat_id si es nuevo
      if (!currentChatId && data.chat_id) {
        setCurrentChatId(data.chat_id)
      }

      const assistantMessage: Message = {
        id: data.message_id || (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, assistantMessage])
      
      // Recargar historial
      const historyResponse = await fetch(`${API_URL}/api/v1/chat/history`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (historyResponse.ok) {
        setChatHistory(await historyResponse.json())
      }

    } catch (err: any) {
      console.error('Chat error:', err)
      setError(err.message || 'Error al conectar con la IA')
      
      // Mostrar mensaje de error como respuesta
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ ${err.message || 'Error al conectar con la IA'}\n\nSi no has configurado tu API key, ve a Settings ⚙️ para agregarla.`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const loadChat = async (chatId: string) => {
    if (!user) return
    try {
      const token = await user.getIdToken()
      const response = await fetch(`${API_URL}/api/v1/chat/${chatId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setCurrentChatId(chatId)
        setSelectedProvider(data.chat.provider_name || 'openai')
        setSelectedModel(data.chat.model_id || 'gpt-4o-mini')
        setMessages(data.messages.map((m: any) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: new Date(m.created_at)
        })))
      }
    } catch (err) {
      console.error('Error loading chat:', err)
    }
  }

  const deleteChat = async (chatId: string) => {
    if (!user) return
    try {
      const token = await user.getIdToken()
      await fetch(`${API_URL}/api/v1/chat/${chatId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      setChatHistory(prev => prev.filter(c => c.id !== chatId))
      if (currentChatId === chatId) {
        startNewChat()
      }
    } catch (err) {
      console.error('Error deleting chat:', err)
    }
  }

  const startNewChat = () => {
    setMessages([])
    setCurrentChatId(null)
    setError(null)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const currentProviderModels = providers.find(p => p.id === selectedProvider)?.models || []

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0f', display: 'flex' }}>
      {/* Sidebar */}
      <div style={{ width: '16rem', backgroundColor: '#0f0f15', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
        {/* Logo */}
        <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img src="/sonorakit-logo.svg" alt="SonoraKit" style={{ height: '2rem', width: '2rem' }} />
            <span style={{ fontSize: '1.125rem', fontWeight: 700, color: 'white' }}>SonoraKit</span>
          </div>
        </div>

        {/* New Chat Button */}
        <div style={{ padding: '0.75rem' }}>
          <button 
            onClick={startNewChat}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'linear-gradient(to right, #5227FF, #7b52ff)', color: 'white', borderRadius: '0.75rem', border: 'none', cursor: 'pointer' }}
          >
            <HiPlus style={{ fontSize: '1.125rem' }} />
            <span>New Chat</span>
          </button>
        </div>

        {/* Chat History */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', padding: '0 0.5rem', marginBottom: '0.5rem' }}>History</p>
          {chatHistory.length === 0 ? (
            <p style={{ color: '#4b5563', fontSize: '0.875rem', padding: '0 0.5rem' }}>No conversations yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {chatHistory.map(chat => (
                <div 
                  key={chat.id}
                  onClick={() => loadChat(chat.id)}
                  style={{ 
                    padding: '0.5rem', 
                    backgroundColor: currentChatId === chat.id ? 'rgba(82, 39, 255, 0.2)' : 'rgba(255,255,255,0.05)', 
                    borderRadius: '0.5rem', 
                    color: currentChatId === chat.id ? 'white' : '#9ca3af', 
                    fontSize: '0.875rem', 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden', flex: 1 }}>
                    <HiChatBubbleLeftRight style={{ flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chat.title}</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }}
                    style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '0.25rem', display: 'flex' }}
                  >
                    <HiTrash style={{ fontSize: '0.875rem' }} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Section */}
        <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', padding: '0 0.5rem' }}>
            <div style={{ width: '2rem', height: '2rem', background: 'linear-gradient(to bottom right, #5227FF, #FF9FFC)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.875rem', fontWeight: 700 }}>
              {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || '?'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: 'white', fontSize: '0.875rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.displayName || 'User'}
              </p>
              <p style={{ color: '#6b7280', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => navigate('/settings')}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem', color: '#9ca3af', border: 'none', cursor: 'pointer' }}
            >
              <HiCog6Tooth />
              <span style={{ fontSize: '0.875rem' }}>Settings</span>
            </button>
            <button 
              onClick={handleSignOut}
              style={{ padding: '0.5rem 0.75rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem', color: '#9ca3af', border: 'none', cursor: 'pointer' }}
            >
              <HiArrowRightOnRectangle />
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ height: '3.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <select 
              value={selectedProvider}
              onChange={(e) => {
                setSelectedProvider(e.target.value)
                const newModels = providers.find(p => p.id === e.target.value)?.models || []
                setSelectedModel(newModels[0] || '')
              }}
              style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', padding: '0.375rem 0.75rem', color: 'white', fontSize: '0.875rem', outline: 'none', cursor: 'pointer' }}
            >
              {providers.map(p => (
                <option key={p.id} value={p.id} style={{ backgroundColor: '#0f0f15' }}>{p.name}</option>
              ))}
            </select>
            <select 
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', padding: '0.375rem 0.75rem', color: 'white', fontSize: '0.875rem', outline: 'none', cursor: 'pointer' }}
            >
              {currentProviderModels.map(m => (
                <option key={m} value={m} style={{ backgroundColor: '#0f0f15' }}>{m}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
            <HiSparkles style={{ color: '#5227FF' }} />
            <span>Demo Mode</span>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
          {/* DarkVeil Background */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.4 }}>
            <DarkVeil speed={0.3} />
          </div>
          
          {messages.length === 0 ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '1rem', position: 'relative', zIndex: 1 }}>
              <div style={{ width: '4rem', height: '4rem', background: 'linear-gradient(to bottom right, #5227FF, #FF9FFC)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <HiSparkles style={{ color: 'white', fontSize: '1.875rem' }} />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>Welcome to SonoraKit</h2>
              <p style={{ color: '#9ca3af', maxWidth: '28rem', marginBottom: '2rem' }}>
                Start a conversation with any AI model. Configure your API keys in settings to unlock full functionality.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', maxWidth: '42rem' }}>
                {['Write a poem about coding', 'Explain quantum computing', 'Help me debug my code'].map((prompt, i) => (
                  <button 
                    key={i}
                    onClick={() => setInput(prompt)}
                    style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', color: '#d1d5db', fontSize: '0.875rem', textAlign: 'left', cursor: 'pointer', backdropFilter: 'blur(10px)' }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '1.5rem 1rem', position: 'relative', zIndex: 1 }}>
              {messages.map(message => (
                <div 
                  key={message.id}
                  style={{ display: 'flex', justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: '1.5rem' }}
                >
                  <div 
                    style={{ 
                      maxWidth: '80%', 
                      padding: '0.75rem 1rem', 
                      borderRadius: '1rem', 
                      ...(message.role === 'user' 
                        ? { background: 'linear-gradient(to right, #5227FF, #7b52ff)', color: 'white' } 
                        : { backgroundColor: 'rgba(255,255,255,0.05)', color: '#e5e7eb', border: '1px solid rgba(255,255,255,0.1)' }
                      )
                    }}
                  >
                    <p style={{ whiteSpace: 'pre-wrap' }}>{message.content}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem 1rem', borderRadius: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <div className="animate-bounce" style={{ width: '0.5rem', height: '0.5rem', backgroundColor: '#9ca3af', borderRadius: '50%', animationDelay: '0ms' }} />
                      <div className="animate-bounce" style={{ width: '0.5rem', height: '0.5rem', backgroundColor: '#9ca3af', borderRadius: '50%', animationDelay: '150ms' }} />
                      <div className="animate-bounce" style={{ width: '0.5rem', height: '0.5rem', backgroundColor: '#9ca3af', borderRadius: '50%', animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <form onSubmit={handleSubmit} style={{ maxWidth: '48rem', margin: '0 auto' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                style={{ width: '100%', padding: '1rem', paddingRight: '3.5rem', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', color: 'white', fontSize: '1rem', outline: 'none' }}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', padding: '0.5rem', background: 'linear-gradient(to right, #5227FF, #7b52ff)', borderRadius: '0.5rem', color: 'white', border: 'none', cursor: 'pointer', opacity: (!input.trim() || loading) ? 0.5 : 1 }}
              >
                <HiPaperAirplane style={{ fontSize: '1.25rem' }} />
              </button>
            </div>
            <p style={{ textAlign: 'center', color: '#4b5563', fontSize: '0.75rem', marginTop: '0.5rem' }}>
              SonoraKit can make mistakes. Consider checking important information.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
