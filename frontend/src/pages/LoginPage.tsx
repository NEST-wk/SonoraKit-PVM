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
          <Link to="/" className="flex items-center gap-3 mb-10">
            <img 
              src="/sonorakit-logo.svg" 
              alt="SonoraKit" 
              className="h-10 w-10"
            />
            <span className="text-2xl font-bold text-white">SonoraKit</span>
          </Link>

          {/* Header */}
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back
          </h1>
          <p className="text-gray-400 mb-8">
            Sign in to continue with your AI conversations
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button 
              onClick={handleGoogleSignIn}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all cursor-pointer"
            >
              <FaGoogle className="text-lg" />
              <span>Google</span>
            </button>
            <button 
              onClick={handleGithubSignIn}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all cursor-pointer"
            >
              <FaGithub className="text-lg" />
              <span>GitHub</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-[#0a0a0f] text-gray-500 text-sm">or continue with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#5227FF] focus:ring-1 focus:ring-[#5227FF] transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <Link to="/forgot-password" className="text-sm text-[#5227FF] hover:text-[#7b52ff] transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#5227FF] focus:ring-1 focus:ring-[#5227FF] transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <HiEyeSlash className="text-xl" /> : <HiEye className="text-xl" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#5227FF] to-[#7b52ff] text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
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
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-gray-400 mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#5227FF] hover:text-[#7b52ff] font-medium transition-colors">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Hero */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
        {/* Decorative border */}
        <div className="absolute inset-4 border border-white/5 rounded-3xl" />
        
        <div className="relative z-10 max-w-lg text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-gradient-to-br from-[#5227FF] to-[#FF9FFC] rounded-2xl flex items-center justify-center mx-auto mb-8 rotate-3 shadow-lg shadow-[#5227FF]/25">
            <HiChatBubbleLeftRight className="text-white text-4xl" />
          </div>

          <h2 className="text-4xl font-bold text-white mb-6">
            Your AI, Your Rules
          </h2>
          
          <p className="text-xl text-gray-400 mb-10 leading-relaxed">
            Access all your favorite AI models in one place. 
            Switch between providers seamlessly.
          </p>

          {/* Features */}
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="w-10 h-10 bg-[#5227FF]/20 rounded-lg flex items-center justify-center shrink-0">
                <HiCpuChip className="text-[#5227FF] text-xl" />
              </div>
              <div>
                <h3 className="text-white font-medium">Multi-Provider Support</h3>
                <p className="text-gray-500 text-sm">OpenAI, Anthropic, Google, and more</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="w-10 h-10 bg-[#FF9FFC]/20 rounded-lg flex items-center justify-center shrink-0">
                <HiSparkles className="text-[#FF9FFC] text-xl" />
              </div>
              <div>
                <h3 className="text-white font-medium">Unified Experience</h3>
                <p className="text-gray-500 text-sm">One interface for all your AI needs</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-12 mt-10 pt-10 border-t border-white/10">
            <div>
              <div className="text-3xl font-bold text-white">10+</div>
              <div className="text-gray-500 text-sm">AI Models</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">∞</div>
              <div className="text-gray-500 text-sm">Conversations</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">100%</div>
              <div className="text-gray-500 text-sm">Your Data</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
