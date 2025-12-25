import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HiEye, HiEyeSlash } from 'react-icons/hi2'
import { FaGoogle, FaGithub } from 'react-icons/fa'
import { HiSparkles, HiShieldCheck, HiRocketLaunch } from 'react-icons/hi2'

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement registration logic with Supabase
    console.log('Register:', formData)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#5227FF]/20 rounded-full blur-[180px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[#FF9FFC]/15 rounded-full blur-[180px]" />
      </div>

      {/* Left Side - Form */}
      <div className="relative flex-1 flex items-center justify-center px-8 lg:px-16">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3" style={{ marginBottom: '48px' }}>
            <img src="/sonorakit-logo.svg" alt="SonoraKit" className="w-12 h-12" />
            <span className="text-white font-bold text-2xl">SonoraKit</span>
          </Link>

          {/* Header */}
          <div style={{ marginBottom: '40px' }}>
            <h1 className="text-4xl font-bold text-white" style={{ marginBottom: '16px' }}>
              Create your account
            </h1>
            <p className="text-gray-400 text-lg">
              Join thousands of developers building with AI
            </p>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300" style={{ marginBottom: '8px' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full bg-[#1a1a24] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#5227FF] focus:ring-2 focus:ring-[#5227FF]/20 transition-all"
                  style={{ padding: '14px 18px' }}
                  required
                />
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300" style={{ marginBottom: '8px' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full bg-[#1a1a24] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#5227FF] focus:ring-2 focus:ring-[#5227FF]/20 transition-all"
                  style={{ padding: '14px 18px' }}
                  required
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300" style={{ marginBottom: '8px' }}>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-[#1a1a24] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#5227FF] focus:ring-2 focus:ring-[#5227FF]/20 transition-all"
                    style={{ padding: '14px 18px', paddingRight: '50px' }}
                    required
                    minLength={8}
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

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300" style={{ marginBottom: '8px' }}>
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-[#1a1a24] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#5227FF] focus:ring-2 focus:ring-[#5227FF]/20 transition-all"
                    style={{ padding: '14px 18px', paddingRight: '50px' }}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <HiEyeSlash className="text-xl" /> : <HiEye className="text-xl" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3" style={{ marginTop: '24px' }}>
              <input
                type="checkbox"
                id="terms"
                className="w-5 h-5 rounded-md border-2 border-white/20 bg-[#1a1a24] text-[#5227FF] focus:ring-[#5227FF] focus:ring-offset-0 cursor-pointer accent-[#5227FF] mt-0.5"
                required
              />
              <label htmlFor="terms" className="text-sm text-gray-400 cursor-pointer">
                I agree to the{' '}
                <a href="#" className="text-[#5227FF] hover:text-[#7b52ff] underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-[#5227FF] hover:text-[#7b52ff] underline">Privacy Policy</a>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#5227FF] to-[#7b52ff] text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-[#5227FF]/30 text-lg"
              style={{ marginTop: '28px', padding: '16px' }}
            >
              Create Account
            </button>
          </form>

          {/* Login Link */}
          <p className="text-gray-400" style={{ marginTop: '32px' }}>
            Already have an account?{' '}
            <Link to="/login" className="text-[#5227FF] hover:text-[#7b52ff] font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Social Login & Features */}
      <div className="hidden lg:flex relative flex-1 bg-gradient-to-br from-[#12121a] to-[#0a0a0f] border-l border-white/5">
        <div className="flex flex-col items-center justify-center w-full px-16">
          {/* Quick Sign Up Options */}
          <div className="w-full max-w-sm">
            <h2 className="text-2xl font-bold text-white text-center" style={{ marginBottom: '12px' }}>
              Quick Sign Up
            </h2>
            <p className="text-gray-400 text-center" style={{ marginBottom: '32px' }}>
              Get started in seconds with your existing account
            </p>

            {/* Social Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <button 
                className="flex items-center justify-center gap-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-all w-full"
                style={{ padding: '18px' }}
              >
                <FaGoogle className="text-xl" />
                Continue with Google
              </button>
              <button 
                className="flex items-center justify-center gap-4 bg-[#24292e] text-white font-semibold rounded-xl hover:bg-[#2f363d] transition-all w-full"
                style={{ padding: '18px' }}
              >
                <FaGithub className="text-xl" />
                Continue with GitHub
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4" style={{ marginTop: '48px', marginBottom: '48px' }}>
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-gray-500 text-sm">Why SonoraKit?</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Features List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#5227FF]/20 flex items-center justify-center flex-shrink-0">
                  <HiSparkles className="text-[#5227FF] text-2xl" />
                </div>
                <div>
                  <h3 className="text-white font-semibold" style={{ marginBottom: '4px' }}>7 AI Providers</h3>
                  <p className="text-gray-400 text-sm">OpenAI, Anthropic, Google, and more in one unified API</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#FF9FFC]/20 flex items-center justify-center flex-shrink-0">
                  <HiShieldCheck className="text-[#FF9FFC] text-2xl" />
                </div>
                <div>
                  <h3 className="text-white font-semibold" style={{ marginBottom: '4px' }}>Enterprise Security</h3>
                  <p className="text-gray-400 text-sm">Your API keys encrypted and protected at rest</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#00D4FF]/20 flex items-center justify-center flex-shrink-0">
                  <HiRocketLaunch className="text-[#00D4FF] text-2xl" />
                </div>
                <div>
                  <h3 className="text-white font-semibold" style={{ marginBottom: '4px' }}>Start Free</h3>
                  <p className="text-gray-400 text-sm">No credit card required to get started</p>
                </div>
              </div>
            </div>
          </div>

          {/* Back to Home */}
          <div style={{ marginTop: '64px' }}>
            <Link to="/" className="text-gray-500 hover:text-white text-sm transition-colors">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Social Login (visible on smaller screens) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#12121a] border-t border-white/10 p-6">
        <div className="flex gap-4">
          <button 
            className="flex-1 flex items-center justify-center gap-2 bg-white text-gray-900 font-semibold rounded-xl py-4"
          >
            <FaGoogle />
            Google
          </button>
          <button 
            className="flex-1 flex items-center justify-center gap-2 bg-[#24292e] text-white font-semibold rounded-xl py-4"
          >
            <FaGithub />
            GitHub
          </button>
        </div>
      </div>
    </div>
  )
}
