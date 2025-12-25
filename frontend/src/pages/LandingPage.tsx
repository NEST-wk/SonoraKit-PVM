import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { SiOpenai, SiGooglegemini } from 'react-icons/si'
import { HiLockClosed, HiRocketLaunch, HiBolt, HiPaintBrush, HiChartBar, HiArrowPath } from 'react-icons/hi2'

// Lazy load heavy WebGL component
const LiquidEther = lazy(() => import('../components/LiquidEther/LiquidEther'))

// Custom AI Provider Icons as React components
const AnthropicIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '1em', height: '1em' }}>
    <path d="M17.604 3.324c.66 0 .996.386 1.206 1.105l3.128 10.11c.063.22.073.397.073.509 0 .597-.44.952-1.058.952-.492 0-.87-.271-1.017-.757l-.723-2.39h-4.632l-.723 2.39c-.147.486-.525.757-1.017.757-.618 0-1.058-.355-1.058-.952 0-.112.01-.289.073-.509l3.128-10.11c.21-.719.546-1.105 1.206-1.105zm-.014 2.416l-1.74 5.765h3.494l-1.74-5.765zM8.5 3c.83 0 1.5.67 1.5 1.5v15c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5v-15c0-.83.67-1.5 1.5-1.5z"/>
  </svg>
)

const MistralIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '1em', height: '1em' }}>
    <path d="M3 3h4v4H3V3zm7 0h4v4h-4V3zm7 0h4v4h-4V3zM3 10h4v4H3v-4zm14 0h4v4h-4v-4zM3 17h4v4H3v-4zm7 0h4v4h-4v-4zm7 0h4v4h-4v-4zm-7-7h4v4h-4v-4z"/>
  </svg>
)

const CohereIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '1em', height: '1em' }}>
    <circle cx="12" cy="12" r="10"/>
  </svg>
)

const GroqIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '1em', height: '1em' }}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm4 0h-2v-6h2v6zm0-8H9V7h6v2z"/>
  </svg>
)

const OpenRouterIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '1em', height: '1em' }}>
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
  </svg>
)

const aiProviderLogos = [
  { node: <SiOpenai />, title: "OpenAI", href: "https://openai.com" },
  { node: <AnthropicIcon />, title: "Anthropic", href: "https://anthropic.com" },
  { node: <SiGooglegemini />, title: "Google Gemini", href: "https://deepmind.google/technologies/gemini/" },
  { node: <MistralIcon />, title: "Mistral AI", href: "https://mistral.ai" },
  { node: <CohereIcon />, title: "Cohere", href: "https://cohere.com" },
  { node: <GroqIcon />, title: "Groq", href: "https://groq.com" },
  { node: <OpenRouterIcon />, title: "OpenRouter", href: "https://openrouter.ai" },
]

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#0a0a0f] overflow-x-hidden">
      {/* Background Effect - Optimized */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Suspense fallback={<div className="w-full h-full bg-[#0a0a0f]" />}>
          <LiquidEther
            colors={['#5227FF', '#FF9FFC', '#B19EEF']}
            mouseForce={15}
            cursorSize={100}
            isViscous={false}
            viscous={20}
            iterationsViscous={16}
            iterationsPoisson={16}
            resolution={0.25}
            isBounce={false}
            autoDemo={true}
            autoSpeed={0.4}
            autoIntensity={2.0}
            takeoverDuration={0.3}
            autoResumeDelay={3000}
            autoRampDuration={0.8}
            style={{ width: '100%', height: '100%' }}
            className="opacity-70"
          />
        </Suspense>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Navigation - Only blur here */}
        <nav className="flex items-center justify-between px-6 py-5 md:px-12 lg:px-20 bg-[#0a0a0f]/70 backdrop-blur-[8px]">
          <div className="flex items-center gap-3">
            <img src="/sonorakit-logo.svg" alt="SonoraKit" className="w-10 h-10" />
            <span className="text-white font-semibold text-xl">SonoraKit</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-300 hover:text-white">Features</a>
            <a href="#providers" className="text-gray-300 hover:text-white">Providers</a>
            <a href="#pricing" className="text-gray-300 hover:text-white">Pricing</a>
            <a href="#docs" className="text-gray-300 hover:text-white">Docs</a>
          </div>

          <div className="flex items-center gap-4" style={{ marginRight: '0.5rem' }}>
            <Link to="/login" className="hidden md:block text-gray-300 hover:text-white px-4 py-2">
              Sign In
            </Link>
            <Link to="/register" style={{ padding: '0.75rem 1.5rem' }} className="rounded-xl bg-gradient-to-r from-[#5227FF] to-[#7b52ff] text-white font-medium hover:opacity-90 shadow-lg shadow-[#5227FF]/25">
              Get Started
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center min-h-[90vh] px-6 text-center pt-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0a0a0f]/80 border border-white/10 mb-8">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            <span className="text-sm text-gray-300">7 AI Providers · Unlimited Possibilities</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white max-w-5xl leading-[1.1] mb-8">
            Your AI, Your Way.
            <span className="block mt-2 bg-gradient-to-r from-[#5227FF] via-[#FF9FFC] to-[#B19EEF] bg-clip-text text-transparent">
              Fully Customizable.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-12 leading-relaxed">
            Connect to OpenAI, Anthropic, Google, Mistral, Cohere, Groq, and OpenRouter. 
            One platform, infinite possibilities. Secure, fast, and beautifully designed.
          </p>

          <div className="h-32 md:h-15"></div>

          <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
            <Link to="/register" className="group relative rounded-2xl bg-white text-[#0a0a0f] font-bold text-lg md:text-xl hover:bg-gray-100 transition-all hover:scale-105 shadow-2xl shadow-white/20 overflow-hidden" style={{ padding: '1.25rem 3rem', letterSpacing: '0.025em' }}>
              <span className="relative z-10">Start Building Free</span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#5227FF]/10 to-[#FF9FFC]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <a href="https://github.com/NEST-wk/SonoraKit-PVM" target="_blank" rel="noopener noreferrer" className="group relative rounded-2xl bg-black text-white font-bold text-lg md:text-xl hover:bg-gray-900 transition-all hover:scale-105 shadow-2xl shadow-black/40 overflow-hidden border border-white/10" style={{ padding: '1.25rem 3rem', letterSpacing: '0.025em' }}>
              <span className="relative z-10">View Documentation</span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#5227FF]/10 to-[#FF9FFC]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>

          <div className="h-32 md:h-20"></div>

          {/* Provider Logos - Infinite Marquee */}
          <div className="w-full max-w-5xl mx-auto overflow-hidden relative py-4 marquee-container">
            <div className="marquee-track">
              {/* Logos duplicated 4x for seamless infinite loop */}
              {[...aiProviderLogos, ...aiProviderLogos, ...aiProviderLogos, ...aiProviderLogos].map((provider, index) => (
                <div key={index} className="marquee-item">
                  <a
                    href={provider.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-gray-400 hover:text-white transition-colors text-4xl inline-block"
                    title={provider.title}
                  >
                    {provider.node}
                  </a>
                </div>
              ))}
            </div>
            {/* Fade edges */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#0a0a0f] to-transparent pointer-events-none z-10" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#0a0a0f] to-transparent pointer-events-none z-10" />
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 px-6 md:px-12 lg:px-20">
          <div className="flex flex-col items-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 text-center">
              Everything You Need
            </h2>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl text-center">
              A complete platform for building AI-powered applications with enterprise-grade security.
            </p>
          </div>

          <div className="h-32 md:h-48"></div>

          <div className="w-full flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
              {[
                {
                  icon: <HiLockClosed className="text-4xl text-[#5227FF]" />,
                  title: 'Secure API Keys',
                  description: 'Military-grade Fernet encryption keeps your API keys safe and secure.'
                },
                {
                  icon: <HiRocketLaunch className="text-4xl text-[#FF9FFC]" />,
                  title: 'Multi-Provider',
                  description: 'Switch between 7 AI providers seamlessly with a unified API.'
                },
                {
                  icon: <HiBolt className="text-4xl text-yellow-400" />,
                  title: 'Blazing Fast',
                  description: 'Built with FastAPI and optimized for low-latency responses.'
                },
                {
                  icon: <HiPaintBrush className="text-4xl text-[#B19EEF]" />,
                  title: 'Customizable UI',
                  description: 'Personalize colors, backgrounds, and avatars to match your brand.'
                },
                {
                  icon: <HiChartBar className="text-4xl text-green-400" />,
                  title: 'Usage Analytics',
                  description: 'Track token usage, costs, and performance across all providers.'
                },
                {
                  icon: <HiArrowPath className="text-4xl text-cyan-400" />,
                  title: 'Real-time Sync',
                  description: 'Powered by Supabase for instant data synchronization.'
                }
              ].map((feature, i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-[#0a0a0f]/80 border border-white/10 hover:bg-[#0a0a0f]/60 transition-colors"
                  style={{ padding: '2.5rem' }}
                >
                  <div style={{ marginBottom: '1.5rem' }}>{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-white" style={{ marginBottom: '1rem' }}>{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Spacer */}
        <div className="h-32 md:h-48"></div>

        {/* CTA Section */}
        <section className="py-20 px-6 md:px-12 lg:px-20">
          <div className="flex justify-center">
            <div className="w-full max-w-4xl rounded-3xl bg-gradient-to-br from-[#5227FF]/30 to-[#FF9FFC]/20 border border-white/10" style={{ padding: '6rem 4rem' }}>
              <div className="flex flex-col items-center text-center" style={{ gap: '3rem' }}>
                <h2 className="text-3xl md:text-5xl font-bold text-white">
                  Ready to Get Started?
                </h2>
                <p className="text-gray-400 text-lg md:text-xl">
                  Join thousands of developers building the future with SonoraKit PVM.
                </p>
                <Link
                  to="/register"
                  className="group relative rounded-2xl bg-white text-[#0a0a0f] font-bold text-lg md:text-xl hover:bg-gray-100 transition-all hover:scale-105 shadow-2xl shadow-white/20 overflow-hidden"
                  style={{ padding: '1.25rem 3rem', letterSpacing: '0.025em' }}
                >
                  <span className="relative z-10">Create Free Account</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#5227FF]/10 to-[#FF9FFC]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="h-32 md:h-48"></div>

        {/* Footer */}
        <footer className="py-12 px-6 border-t border-white/10 bg-[#0a0a0f]/90">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src="/sonorakit-logo.svg" alt="SonoraKit" className="w-8 h-8" />
              <span className="text-white font-semibold">SonoraKit PVM</span>
            </div>

            <div className="flex items-center gap-6 text-gray-400 text-sm">
              <a href="#" className="hover:text-white">Privacy</a>
              <a href="#" className="hover:text-white">Terms</a>
              <a href="#" className="hover:text-white">GitHub</a>
            </div>

            <p className="text-gray-500 text-sm">
              © 2025 SonoraKit. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
