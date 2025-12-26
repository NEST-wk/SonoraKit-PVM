import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { HiPaperAirplane, HiPlus, HiCog6Tooth, HiArrowRightOnRectangle, HiSparkles, HiChatBubbleLeftRight } from 'react-icons/hi2'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function ChatPage() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState('openai')
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const providers = [
    { id: 'openai', name: 'OpenAI', models: ['gpt-4o', 'gpt-4o-mini'] },
    { id: 'anthropic', name: 'Anthropic', models: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'] },
    { id: 'google', name: 'Google', models: ['gemini-2.0-flash-exp', 'gemini-1.5-pro'] },
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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

    // Simular respuesta (por ahora)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `¡Hola! Soy un asistente de IA. Por ahora estoy en modo demo, pero pronto podré conectarme a ${selectedProvider} usando el modelo ${selectedModel}. 

Para habilitarme completamente, necesitas:
1. Ir a Configuración ⚙️
2. Agregar tu API key de ${selectedProvider}
3. ¡Listo para chatear!`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
      setLoading(false)
    }, 1000)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const currentProviderModels = providers.find(p => p.id === selectedProvider)?.models || []

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Sidebar */}
      <div className="w-64 bg-[#0f0f15] border-r border-white/5 flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <img src="/sonorakit-logo.svg" alt="SonoraKit" className="h-8 w-8" />
            <span className="text-lg font-bold text-white">SonoraKit</span>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button 
            onClick={() => setMessages([])}
            className="w-full flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-[#5227FF] to-[#7b52ff] text-white rounded-xl hover:opacity-90 transition-all cursor-pointer"
          >
            <HiPlus className="text-lg" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <p className="text-xs text-gray-500 uppercase px-2 mb-2">History</p>
          {messages.length === 0 ? (
            <p className="text-gray-600 text-sm px-2">No conversations yet</p>
          ) : (
            <div className="px-2 py-2 bg-white/5 rounded-lg text-gray-400 text-sm truncate">
              <HiChatBubbleLeftRight className="inline mr-2" />
              Current Chat
            </div>
          )}
        </div>

        {/* User Section */}
        <div className="p-3 border-t border-white/5">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#5227FF] to-[#FF9FFC] rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {user?.displayName || 'User'}
              </p>
              <p className="text-gray-500 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => navigate('/settings')}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all cursor-pointer"
            >
              <HiCog6Tooth />
              <span className="text-sm">Settings</span>
            </button>
            <button 
              onClick={handleSignOut}
              className="px-3 py-2 bg-white/5 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400 transition-all cursor-pointer"
            >
              <HiArrowRightOnRectangle />
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-14 border-b border-white/5 flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <select 
              value={selectedProvider}
              onChange={(e) => {
                setSelectedProvider(e.target.value)
                const newModels = providers.find(p => p.id === e.target.value)?.models || []
                setSelectedModel(newModels[0] || '')
              }}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#5227FF] cursor-pointer"
            >
              {providers.map(p => (
                <option key={p.id} value={p.id} className="bg-[#0f0f15]">{p.name}</option>
              ))}
            </select>
            <select 
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#5227FF] cursor-pointer"
            >
              {currentProviderModels.map(m => (
                <option key={m} value={m} className="bg-[#0f0f15]">{m}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <HiSparkles className="text-[#5227FF]" />
            <span>Demo Mode</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#5227FF] to-[#FF9FFC] rounded-2xl flex items-center justify-center mb-6">
                <HiSparkles className="text-white text-3xl" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome to SonoraKit</h2>
              <p className="text-gray-400 max-w-md mb-8">
                Start a conversation with any AI model. Configure your API keys in settings to unlock full functionality.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
                {['Write a poem about coding', 'Explain quantum computing', 'Help me debug my code'].map((prompt, i) => (
                  <button 
                    key={i}
                    onClick={() => setInput(prompt)}
                    className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-300 text-sm text-left transition-all cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto py-6 px-4 space-y-6">
              {messages.map(message => (
                <div 
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                      message.role === 'user' 
                        ? 'bg-gradient-to-r from-[#5227FF] to-[#7b52ff] text-white' 
                        : 'bg-white/5 text-gray-200 border border-white/10'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/5">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="w-full px-4 py-4 pr-14 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#5227FF] focus:ring-1 focus:ring-[#5227FF] transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-[#5227FF] to-[#7b52ff] rounded-lg text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <HiPaperAirplane className="text-xl" />
              </button>
            </div>
            <p className="text-center text-gray-600 text-xs mt-2">
              SonoraKit can make mistakes. Consider checking important information.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
