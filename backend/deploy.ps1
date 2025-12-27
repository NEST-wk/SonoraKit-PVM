# Script de deploy para producción - Backend
# Ejecutar desde la carpeta backend

param(
    [switch]$FirstTime,
    [switch]$SecretsOnly
)

$APP_NAME = "sonorakit-api"

Write-Host "🚀 SonoraKit PVM - Backend Deploy Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Verificar que Fly CLI está instalado
if (!(Get-Command fly -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Fly CLI no está instalado. Instálalo con:" -ForegroundColor Red
    Write-Host "   powershell -Command 'iwr https://fly.io/install.ps1 -useb | iex'" -ForegroundColor Yellow
    exit 1
}

# Verificar login
$authStatus = fly auth whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ No estás logueado en Fly.io. Ejecuta: fly auth login" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Logueado como: $authStatus" -ForegroundColor Green

if ($FirstTime) {
    Write-Host ""
    Write-Host "📦 Creando app por primera vez..." -ForegroundColor Yellow
    fly launch --config fly.prod.toml --name $APP_NAME --no-deploy
    
    Write-Host ""
    Write-Host "⚠️  Ahora configura los secrets con:" -ForegroundColor Yellow
    Write-Host "   .\deploy.ps1 -SecretsOnly" -ForegroundColor White
    exit 0
}

if ($SecretsOnly) {
    Write-Host ""
    Write-Host "🔐 Configuración de Secrets" -ForegroundColor Yellow
    Write-Host "Ingresa los valores para cada secret:" -ForegroundColor White
    
    $masterKey = Read-Host "MASTER_KEY (Fernet key)"
    $secretKey = Read-Host "SECRET_KEY"
    $databaseUrl = Read-Host "DATABASE_URL (Neon PostgreSQL)"
    $firebaseProjectId = Read-Host "FIREBASE_PROJECT_ID"
    $firebaseApiKey = Read-Host "FIREBASE_API_KEY"
    
    Write-Host ""
    Write-Host "Configurando secrets..." -ForegroundColor Yellow
    
    if ($masterKey) { fly secrets set MASTER_KEY="$masterKey" --app $APP_NAME }
    if ($secretKey) { fly secrets set SECRET_KEY="$secretKey" --app $APP_NAME }
    if ($databaseUrl) { fly secrets set DATABASE_URL="$databaseUrl" --app $APP_NAME }
    if ($firebaseProjectId) { fly secrets set FIREBASE_PROJECT_ID="$firebaseProjectId" --app $APP_NAME }
    if ($firebaseApiKey) { fly secrets set FIREBASE_API_KEY="$firebaseApiKey" --app $APP_NAME }
    
    Write-Host ""
    Write-Host "✅ Secrets configurados:" -ForegroundColor Green
    fly secrets list --app $APP_NAME
    exit 0
}

# Deploy normal
Write-Host ""
Write-Host "🚀 Desplegando a producción..." -ForegroundColor Yellow
fly deploy --config fly.prod.toml

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Deploy exitoso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 URL: https://$APP_NAME.fly.dev" -ForegroundColor Cyan
    Write-Host "📊 Dashboard: https://fly.io/apps/$APP_NAME" -ForegroundColor Cyan
    Write-Host "🏥 Health: https://$APP_NAME.fly.dev/api/v1/health" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Comandos útiles:" -ForegroundColor Yellow
    Write-Host "  fly logs --app $APP_NAME        # Ver logs" -ForegroundColor White
    Write-Host "  fly status --app $APP_NAME      # Ver estado" -ForegroundColor White
    Write-Host "  fly ssh console --app $APP_NAME # SSH" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Error en el deploy. Revisa los logs:" -ForegroundColor Red
    Write-Host "   fly logs --app $APP_NAME" -ForegroundColor Yellow
}
