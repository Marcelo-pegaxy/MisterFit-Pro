# Script de Deploy do Backend MisterFit Pro
Write-Host "🚀 Iniciando deploy do backend MisterFit Pro..." -ForegroundColor Green

# Verificar se o Git está configurado
Write-Host "📋 Verificando configuração do Git..." -ForegroundColor Yellow
git status

# Adicionar todas as mudanças
Write-Host "📦 Adicionando arquivos ao Git..." -ForegroundColor Yellow
git add .

# Fazer commit
Write-Host "💾 Fazendo commit das mudanças..." -ForegroundColor Yellow
$commitMessage = Read-Host "Digite a mensagem do commit (ou pressione Enter para usar padrão)"
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "feat: prepare backend for production deployment"
}

git commit -m $commitMessage

# Fazer push para o GitHub
Write-Host "📤 Fazendo push para o GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host "✅ Deploy concluído!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Acesse https://railway.app" -ForegroundColor White
Write-Host "2. Conecte seu repositório GitHub" -ForegroundColor White
Write-Host "3. Configure as variáveis de ambiente:" -ForegroundColor White
Write-Host "   - SUPABASE_URL" -ForegroundColor Gray
Write-Host "   - SUPABASE_ANON_KEY" -ForegroundColor Gray
Write-Host "   - SUPABASE_SERVICE_KEY" -ForegroundColor Gray
Write-Host "   - JWT_SECRET" -ForegroundColor Gray
Write-Host "   - GEMINI_API_KEY" -ForegroundColor Gray
Write-Host "   - NODE_ENV=production" -ForegroundColor Gray
Write-Host "4. Deploy automático será iniciado" -ForegroundColor White
Write-Host ""
Write-Host "🔗 URL do backend será fornecida pelo Railway" -ForegroundColor Cyan 