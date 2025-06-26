# Script PowerShell para configurar PostgreSQL
Write-Host "========================================" -ForegroundColor Green
Write-Host "Configurando PostgreSQL para MisterFit Pro" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Função para encontrar o PostgreSQL
function Find-PostgreSQL {
    $possiblePaths = @(
        "C:\Program Files\PostgreSQL\16\bin\psql.exe",
        "C:\Program Files\PostgreSQL\15\bin\psql.exe",
        "C:\Program Files\PostgreSQL\14\bin\psql.exe",
        "C:\Program Files\PostgreSQL\13\bin\psql.exe",
        "C:\Program Files\PostgreSQL\12\bin\psql.exe"
    )
    
    foreach ($path in $possiblePaths) {
        if (Test-Path $path) {
            return $path
        }
    }
    return $null
}

Write-Host "`n1. Procurando PostgreSQL instalado..." -ForegroundColor Yellow
$psqlPath = Find-PostgreSQL

if ($psqlPath) {
    Write-Host "PostgreSQL encontrado em: $psqlPath" -ForegroundColor Green
} else {
    Write-Host "ERRO: PostgreSQL não encontrado!" -ForegroundColor Red
    Write-Host "Por favor, instale o PostgreSQL primeiro." -ForegroundColor Red
    Write-Host "Consulte o arquivo GUIA-POSTGRESQL.md para instruções." -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host "`n2. Criando banco de dados 'misterfit_pro'..." -ForegroundColor Yellow
& $psqlPath -U postgres -c "CREATE DATABASE misterfit_pro;" 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Banco de dados criado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "Banco de dados já existe ou erro na criação." -ForegroundColor Yellow
}

Write-Host "`n3. Criando usuário 'misterfit_user'..." -ForegroundColor Yellow
& $psqlPath -U postgres -c "CREATE USER misterfit_user WITH PASSWORD 'misterfit123';" 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Usuário criado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "Usuário já existe ou erro na criação." -ForegroundColor Yellow
}

Write-Host "`n4. Concedendo permissões ao usuário..." -ForegroundColor Yellow
& $psqlPath -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE misterfit_pro TO misterfit_user;" 2>$null
& $psqlPath -U postgres -c "ALTER USER misterfit_user CREATEDB;" 2>$null
Write-Host "Permissões concedidas!" -ForegroundColor Green

Write-Host "`n5. Executando schema do banco de dados..." -ForegroundColor Yellow
& $psqlPath -U misterfit_user -d misterfit_pro -f "..\backend\database\schema.sql"
if ($LASTEXITCODE -eq 0) {
    Write-Host "Schema executado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "Erro ao executar schema. Verifique as credenciais." -ForegroundColor Red
}

Write-Host "`n6. Criando arquivo de configuração local..." -ForegroundColor Yellow
$configContent = @"
# Configurações do Servidor
PORT=5000
NODE_ENV=development

# PostgreSQL Credentials
DB_HOST=localhost
DB_PORT=5432
DB_NAME=misterfit_pro
DB_USER=misterfit_user
DB_PASSWORD=misterfit123

# Supabase Credentials (opcional - para usar Supabase em vez de PostgreSQL local)
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-publica
SUPABASE_SERVICE_KEY=sua-chave-privada
"@

$configContent | Out-File -FilePath "backend\config.env" -Encoding UTF8
Write-Host "Arquivo de configuração criado!" -ForegroundColor Green

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "Configuração concluída!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Credenciais do banco:" -ForegroundColor Cyan
Write-Host "- Host: localhost" -ForegroundColor White
Write-Host "- Porta: 5432" -ForegroundColor White
Write-Host "- Database: misterfit_pro" -ForegroundColor White
Write-Host "- Usuário: misterfit_user" -ForegroundColor White
Write-Host "- Senha: misterfit123" -ForegroundColor White
Write-Host ""
Write-Host "Para iniciar o servidor backend:" -ForegroundColor Cyan
Write-Host "cd backend" -ForegroundColor White
Write-Host "npm run dev" -ForegroundColor White
Write-Host ""
Read-Host "Pressione Enter para continuar" 