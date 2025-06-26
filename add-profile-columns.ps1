# Script para adicionar colunas de perfil à tabela users
# Execute este script para resolver o erro "Could not find the 'city' column"

Write-Host "Adicionando colunas de perfil à tabela users..." -ForegroundColor Green

# Ler as variáveis de ambiente do arquivo config.env
$envContent = Get-Content "backend/config.env" -ErrorAction SilentlyContinue
if ($envContent) {
    $envContent | ForEach-Object {
        if ($_ -match "^([^=]+)=(.*)$") {
            $name = $matches[1]
            $value = $matches[2]
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
}

# Verificar se as variáveis estão definidas
$dbHost = $env:DB_HOST
$dbPort = $env:DB_PORT
$dbName = $env:DB_NAME
$dbUser = $env:DB_USER
$dbPassword = $env:DB_PASSWORD

if (-not $dbHost -or -not $dbName -or -not $dbUser) {
    Write-Host "Erro: Variáveis de ambiente do banco não encontradas!" -ForegroundColor Red
    Write-Host "Certifique-se de que o arquivo backend/config.env existe e contém:" -ForegroundColor Yellow
    Write-Host "DB_HOST=localhost" -ForegroundColor Yellow
    Write-Host "DB_PORT=5432" -ForegroundColor Yellow
    Write-Host "DB_NAME=misterfit_pro" -ForegroundColor Yellow
    Write-Host "DB_USER=postgres" -ForegroundColor Yellow
    Write-Host "DB_PASSWORD=sua_senha" -ForegroundColor Yellow
    exit 1
}

# Construir a string de conexão
$connectionString = "host=$dbHost port=$dbPort dbname=$dbName user=$dbUser"

if ($dbPassword) {
    $connectionString += " password=$dbPassword"
}

Write-Host "Conectando ao banco de dados..." -ForegroundColor Yellow

# Executar o script SQL
try {
    $sqlContent = Get-Content "backend/database/add_profile_columns.sql" -Raw
    $sqlContent | psql $connectionString
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Colunas de perfil adicionadas com sucesso!" -ForegroundColor Green
        Write-Host "Agora você pode usar o sistema normalmente." -ForegroundColor Green
    } else {
        Write-Host "❌ Erro ao executar o script SQL" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Erro ao executar o script: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`nPróximos passos:" -ForegroundColor Cyan
Write-Host "1. Reinicie o backend (Ctrl+C e depois npm start)" -ForegroundColor White
Write-Host "2. Teste o sistema novamente" -ForegroundColor White 