# Script para iniciar o ambiente de desenvolvimento MisterFit Pro
Write-Host "🚀 Iniciando MisterFit Pro Development Environment..." -ForegroundColor Green

# Verificar se o Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não encontrado. Por favor, instale o Node.js primeiro." -ForegroundColor Red
    exit 1
}

# Verificar se o PostgreSQL está rodando (opcional)
Write-Host "📊 Verificando PostgreSQL..." -ForegroundColor Yellow
try {
    $pgCheck = Get-Process -Name "postgres" -ErrorAction SilentlyContinue
    if ($pgCheck) {
        Write-Host "✅ PostgreSQL está rodando" -ForegroundColor Green
    } else {
        Write-Host "⚠️  PostgreSQL não está rodando. Certifique-se de que está ativo." -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Não foi possível verificar o PostgreSQL" -ForegroundColor Yellow
}

# Iniciar o backend
Write-Host "🔧 Iniciando backend..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"

# Aguardar um pouco para o backend inicializar
Start-Sleep -Seconds 3

# Iniciar o frontend
Write-Host "🎨 Iniciando frontend..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

Write-Host "✅ Ambiente de desenvolvimento iniciado!" -ForegroundColor Green
Write-Host "📱 Frontend: http://localhost:5174" -ForegroundColor Cyan
Write-Host "🔧 Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "📊 Health Check: http://localhost:5000/api/health" -ForegroundColor Cyan 