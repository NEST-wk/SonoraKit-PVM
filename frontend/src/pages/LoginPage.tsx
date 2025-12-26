import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HiEye, HiEyeSlash } from 'react-icons/hi2'
import { FaGoogle, FaGithub } from 'react-icons/fa'
import { HiSparkles, HiChatBubbleLeftRight, HiCpuChip } from 'react-icons/hi2'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { signIn, signInWithGoogle, signInWithGithub } = useAuth()
  
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    
    const { error } = await signIn(formData.email, formData.password)
    
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      navigate('/chat')
    }
  }

  const handleGoogleSignIn = async () => {
    setError(null)
    const { error } = await signInWithGoogle()
    if (error) {
      setError(error.message)
    } else {
      navigate('/chat')
    }
  }

  const handleGithubSignIn = async () => {
    setError(null)
    const { error } = await signInWithGithub()
    if (error) {
      setError(error.message)
    } else {
      navigate('/chat')
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#5227FF]/20 rounded-full blur-[180px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[#FF9FFC]/15 rounded-full blur-[180px]" />
      </div>

      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div style={{ marginBottom: '3rem' }}>
            <Link to="/" className="flex items-center gap-3">
              <img 
                src="/sonorakit-logo.svg" 
                alt="SonoraKit" 
                className="h-10 w-10"
              />
              <span className="text-2xl font-bold text-white">SonoraKit</span>
            </Link>
          </div>

          {/* Header */}
          <div style={{ marginBottom: '3rem' }}>
            <h1 className="text-4xl font-bold text-white" style={{ marginBottom: '0.75rem' }}>
              Welcome back
            </h1>
            <p className="text-gray-400 text-lg">
              Sign in to continue with your AI conversations
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '0.75rem', color: '#f87171', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          {/* Social Login */}
          <div style={{ marginBottom: '2rem' }}>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={handleGoogleSignIn}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', color: 'white', cursor: 'pointer' }}
              >
                <FaGoogle className="text-lg" />
                <span>Google</span>
              </button>
              <button 
                onClick={handleGithubSignIn}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', color: 'white', cursor: 'pointer' }}
              >
                <FaGithub className="text-lg" />
                <span>GitHub</span>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div style={{ position: 'relative', marginBottom: '2rem' }}>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.1)' }}></div>
            </div>
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
              <span style={{ padding: '0 1rem', backgroundColor: '#0a0a0f', color: '#6b7280', fontSize: '0.875rem' }}>or continue with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: '1.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#d1d5db', marginBottom: '0.75rem' }}>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
                style={{ width: '100%', padding: '1rem 1.25rem', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', color: 'white', fontSize: '1rem', outline: 'none' }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#d1d5db' }}>
                  Password
                </label>
                <Link to="/forgot-password" style={{ fontSize: '0.875rem', color: '#5227FF' }}>
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                  style={{ width: '100%', padding: '1rem 1.25rem', paddingRight: '3rem', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', color: 'white', fontSize: '1rem', outline: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
                >
                  {showPassword ? <HiEyeSlash className="text-xl" /> : <HiEye className="text-xl" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ marginBottom: '2rem' }}>
              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', padding: '1rem', background: 'linear-gradient(to right, #5227FF, #7b52ff)', color: 'white', fontWeight: 600, fontSize: '1rem', borderRadius: '0.75rem', border: 'none', cursor: 'pointer', opacity: loading ? 0.5 : 1 }}
              >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
              </button>
            </div>
          </form>

          {/* Sign Up Link */}
          <p style={{ textAlign: 'center', color: '#9ca3af' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#5227FF', fontWeight: 500 }}>
              Sign up for free
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Hero */}
      <div style={{ display: 'none', position: 'relative', alignItems: 'center', justifyContent: 'center', padding: '4rem' }} className="lg:!flex lg:w-1/2">
        {/* Decorative border */}
        <div style={{ position: 'absolute', inset: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1.5rem' }} />
        
        <div style={{ position: 'relative', zIndex: 10, maxWidth: '32rem', textAlign: 'center' }}>
          {/* Icon */}
          <div style={{ marginBottom: '3rem' }}>
            <div style={{ width: '6rem', height: '6rem', background: 'linear-gradient(to bottom right, #5227FF, #FF9FFC)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', transform: 'rotate(3deg)', boxShadow: '0 10px 25px rgba(82, 39, 255, 0.25)' }}>
              <HiChatBubbleLeftRight style={{ color: 'white', fontSize: '3rem' }} />
            </div>
          </div>

          {/* Title */}
          <div style={{ marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: 700, color: 'white', marginBottom: '1.5rem' }}>
              Your AI, Your Rules
            </h2>
            
            <p style={{ fontSize: '1.25rem', color: '#9ca3af', lineHeight: 1.7 }}>
              Access all your favorite AI models in one place. 
              Switch between providers seamlessly.
            </p>
          </div>

          {/* Features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ width: '3.5rem', height: '3.5rem', backgroundColor: 'rgba(82, 39, 255, 0.2)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <HiCpuChip style={{ color: '#5227FF', fontSize: '1.5rem' }} />
              </div>
              <div>
                <h3 style={{ color: 'white', fontWeight: 600, fontSize: '1.125rem', marginBottom: '0.25rem' }}>Multi-Provider Support</h3>
                <p style={{ color: '#6b7280' }}>OpenAI, Anthropic, Google, and more</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ width: '3.5rem', height: '3.5rem', backgroundColor: 'rgba(255, 159, 252, 0.2)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <HiSparkles style={{ color: '#FF9FFC', fontSize: '1.5rem' }} />
              </div>
              <div>
                <h3 style={{ color: 'white', fontWeight: 600, fontSize: '1.125rem', marginBottom: '0.25rem' }}>Unified Experience</h3>
                <p style={{ color: '#6b7280' }}>One interface for all your AI needs</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '4rem', marginTop: '3.5rem', paddingTop: '3.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.25rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>10+</div>
              <div style={{ color: '#6b7280' }}>AI Models</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.25rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>∞</div>
              <div style={{ color: '#6b7280' }}>Conversations</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.25rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>100%</div>
              <div style={{ color: '#6b7280' }}>Your Data</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
