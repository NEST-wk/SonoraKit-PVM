import { LiquidEther } from '../components/LiquidEther'

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#0a0a0f] overflow-x-hidden">
      {/* Background Effect */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <LiquidEther
          colors={['#5227FF', '#FF9FFC', '#B19EEF']}
          mouseForce={25}
          cursorSize={120}
          isViscous={false}
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.6}
          autoIntensity={2.5}
          takeoverDuration={0.25}
          autoResumeDelay={2000}
          autoRampDuration={0.6}
          style={{ width: '100%', height: '100%' }}
          className="opacity-80"
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="flex items-center justify-between px-6 py-5 md:px-12 lg:px-20 backdrop-blur-sm bg-[#0a0a0f]/30">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5227FF] to-[#FF9FFC] flex items-center justify-center shadow-lg shadow-[#5227FF]/30">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-white font-semibold text-xl">SonoraKit</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
            <a href="#providers" className="text-gray-300 hover:text-white transition-colors">Providers</a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
            <a href="#docs" className="text-gray-300 hover:text-white transition-colors">Docs</a>
          </div>

          <div className="flex items-center gap-4">
            <button className="hidden md:block text-gray-300 hover:text-white transition-colors">
              Sign In
            </button>
            <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#5227FF] to-[#7b52ff] text-white font-medium hover:opacity-90 transition-opacity shadow-lg shadow-[#5227FF]/25">
              Get Started
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center min-h-[90vh] px-6 text-center pt-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
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

          <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
            <button className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#5227FF] to-[#7b52ff] text-white font-semibold text-lg hover:opacity-90 transition-all hover:scale-105 shadow-xl shadow-[#5227FF]/30">
              Start Building Free
            </button>
            <button className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-lg hover:bg-white/10 transition-all backdrop-blur-sm">
              View Documentation
            </button>
          </div>

          {/* Provider Logos */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {['OpenAI', 'Anthropic', 'Google', 'Mistral', 'Cohere', 'Groq', 'OpenRouter'].map((provider) => (
              <div key={provider} className="text-gray-400 text-sm font-medium px-4 py-2 rounded-lg bg-white/5 border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors cursor-default">
                {provider}
              </div>
            ))}
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

          <div className="w-full flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
              {[
                {
                  icon: '🔐',
                  title: 'Secure API Keys',
                  description: 'Military-grade Fernet encryption keeps your API keys safe and secure.'
                },
                {
                  icon: '🚀',
                  title: 'Multi-Provider',
                  description: 'Switch between 7 AI providers seamlessly with a unified API.'
                },
                {
                  icon: '⚡',
                  title: 'Blazing Fast',
                  description: 'Built with FastAPI and optimized for low-latency responses.'
                },
                {
                  icon: '🎨',
                  title: 'Customizable UI',
                  description: 'Personalize colors, backgrounds, and avatars to match your brand.'
                },
                {
                  icon: '📊',
                  title: 'Usage Analytics',
                  description: 'Track token usage, costs, and performance across all providers.'
                },
                {
                  icon: '🔄',
                  title: 'Real-time Sync',
                  description: 'Powered by Supabase for instant data synchronization.'
                }
              ].map((feature, i) => (
                <div
                  key={i}
                  className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all hover:scale-[1.02] backdrop-blur-sm"
                >
                  <div className="text-4xl mb-5">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <div className="mb-2"></div>
        {/* CTA Section */}
        <section className="py-24 px-6 md:px-12 lg:px-20">
          <div className="flex justify-center">
            <div className="w-full max-w-4xl p-12 md:p-16 rounded-3xl bg-gradient-to-br from-[#5227FF]/20 to-[#FF9FFC]/20 border border-white/10 backdrop-blur-sm text-center">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-gray-400 text-lg md:text-xl mb-10 max-w-xl mx-auto">
                Join thousands of developers building the future with SonoraKit PVM.
              </p>
              <button className="px-10 py-5 rounded-xl bg-white text-[#0a0a0f] font-semibold text-lg hover:opacity-90 transition-all hover:scale-105 shadow-xl">
                Create Free Account
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 border-t border-white/10 backdrop-blur-sm bg-[#0a0a0f]/50">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5227FF] to-[#FF9FFC] flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-white font-semibold">SonoraKit PVM</span>
            </div>
            
            <div className="flex items-center gap-6 text-gray-400 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">GitHub</a>
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
