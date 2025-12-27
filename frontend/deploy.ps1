# Script de deploy para producción - Frontend
# Ejecutar desde la carpeta frontend

param(
    [switch]$Preview,
    [switch]$Setup
)

Write-Host "🚀 SonoraKit PVM - Frontend Deploy Script" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

# Verificar que Vercel CLI está instalado
if (!(Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Vercel CLI no está instalado. Instálalo con:" -ForegroundColor Red
    Write-Host "   npm install -g vercel" -ForegroundColor Yellow
    exit 1
}

# Verificar login
Write-Host ""
Write-Host "Verificando autenticación con Vercel..." -ForegroundColor Yellow
$whoami = vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ No estás logueado en Vercel. Ejecuta: vercel login" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Logueado como: $whoami" -ForegroundColor Green

if ($Setup) {
    Write-Host ""
    Write-Host "📦 Configurando proyecto..." -ForegroundColor Yellow
    vercel
    
    Write-Host ""
    Write-Host "⚠️  Ahora configura las variables de entorno en el dashboard de Vercel" -ForegroundColor Yellow
    Write-Host "   o usa: vercel env add VITE_API_URL production" -ForegroundColor White
    exit 0
}

# Build local primero para verificar errores
Write-Host ""
Write-Host "🔨 Verificando build local..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Error en el build. Corrige los errores antes de desplegar." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build local exitoso" -ForegroundColor Green

if ($Preview) {
    Write-Host ""
    Write-Host "👀 Desplegando preview..." -ForegroundColor Yellow
    vercel
    
    Write-Host ""
    Write-Host "✅ Preview deploy completado!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "🚀 Desplegando a producción..." -ForegroundColor Yellow
    vercel --prod
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Deploy a producción exitoso!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Comandos útiles:" -ForegroundColor Yellow
        Write-Host "  vercel ls                    # Listar deployments" -ForegroundColor White
        Write-Host "  vercel logs                  # Ver logs" -ForegroundColor White
        Write-Host "  vercel env ls                # Ver variables de entorno" -ForegroundColor White
        Write-Host "  vercel domains ls            # Ver dominios" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "❌ Error en el deploy." -ForegroundColor Red
    }
}
