# Script PowerShell para recriar o usuário do banco de dados
Write-Host "===============================================" -ForegroundColor Green
Write-Host "Recriando usuário do PostgreSQL para MisterFit Pro" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

# Função para encontrar o PostgreSQL
function Find-PostgreSQL {
    $possiblePaths = @(
        "C:\Program Files\PostgreSQL\16\bin",
        "C:\Program Files\PostgreSQL\15\bin",
        "C:\Program Files\PostgreSQL\14\bin",
        "C:\Program Files\PostgreSQL\13\bin",
        "C:\Program Files\PostgreSQL\12\bin"
    )
    
    foreach ($path in $possiblePaths) {
        if (Test-Path "$path\psql.exe") {
            return $path
        }
    }
    return $null
}

Write-Host "`n1. Procurando PostgreSQL instalado..." -ForegroundColor Yellow
$psqlBinPath = Find-PostgreSQL
$env:PGPASSWORD = Read-Host -Prompt "Por favor, digite a senha do superusuário 'postgres' e pressione Enter"

if ($psqlBinPath) {
    Write-Host "PostgreSQL encontrado em: $psqlBinPath" -ForegroundColor Green
} else {
    Write-Host "ERRO: PostgreSQL não encontrado!" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

$psqlPath = "$psqlBinPath\psql.exe"

function Run-Psql-Command {
    param(
        [string]$Command,
        [string]$SuccessMessage,
        [string]$FailureMessage
    )
    & $psqlPath -U postgres -d postgres -c $Command
    if ($LASTEXITCODE -eq 0) {
        Write-Host $SuccessMessage -ForegroundColor Green
    } else {
        Write-Host "$FailureMessage (código de saída: $LASTEXITCODE)" -ForegroundColor Yellow
    }
}

Write-Host "`n2. Removendo usuário 'misterfit_user' (se existir)..." -ForegroundColor Yellow
Run-Psql-Command -Command "DROP USER IF EXISTS misterfit_user;" `
                   -SuccessMessage "Usuário antigo removido." `
                   -FailureMessage "Não foi possível remover o usuário antigo (pode não existir)."

Write-Host "`n3. Criando usuário 'misterfit_user'..." -ForegroundColor Yellow
Run-Psql-Command -Command "CREATE USER misterfit_user WITH PASSWORD 'misterfit123';" `
                   -SuccessMessage "Usuário 'misterfit_user' criado com sucesso!" `
                   -FailureMessage "Falha ao criar usuário."

Write-Host "`n4. Concedendo permissões..." -ForegroundColor Yellow
Run-Psql-Command -Command "GRANT ALL PRIVILEGES ON DATABASE misterfit_pro TO misterfit_user;" `
                   -SuccessMessage "Permissões concedidas com sucesso!" `
                   -FailureMessage "Falha ao conceder permissões."

Write-Host "`n===============================================" -ForegroundColor Green
Write-Host "Correção do usuário do banco de dados concluída!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host "Por favor, reinicie o servidor backend agora." -ForegroundColor Cyan
Read-Host "Pressione Enter para finalizar"

# Limpa a senha da variável de ambiente
Remove-Item Env:PGPASSWORD 