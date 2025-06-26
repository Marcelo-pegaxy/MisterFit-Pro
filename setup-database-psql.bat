@echo off
echo ========================================
echo Configurando PostgreSQL para MisterFit Pro
echo ========================================

echo.
echo 1. Procurando PostgreSQL instalado...

set PSQL_PATH=

REM Verificar locais comuns do PostgreSQL
if exist "C:\Program Files\PostgreSQL\16\bin\psql.exe" (
    set PSQL_PATH="C:\Program Files\PostgreSQL\16\bin\psql.exe"
    echo PostgreSQL 16 encontrado!
) else if exist "C:\Program Files\PostgreSQL\15\bin\psql.exe" (
    set PSQL_PATH="C:\Program Files\PostgreSQL\15\bin\psql.exe"
    echo PostgreSQL 15 encontrado!
) else if exist "C:\Program Files\PostgreSQL\14\bin\psql.exe" (
    set PSQL_PATH="C:\Program Files\PostgreSQL\14\bin\psql.exe"
    echo PostgreSQL 14 encontrado!
) else if exist "C:\Program Files\PostgreSQL\13\bin\psql.exe" (
    set PSQL_PATH="C:\Program Files\PostgreSQL\13\bin\psql.exe"
    echo PostgreSQL 13 encontrado!
) else if exist "C:\Program Files\PostgreSQL\12\bin\psql.exe" (
    set PSQL_PATH="C:\Program Files\PostgreSQL\12\bin\psql.exe"
    echo PostgreSQL 12 encontrado!
) else (
    echo ERRO: PostgreSQL nao encontrado nos locais padrao.
    echo Por favor, instale o PostgreSQL ou adicione ao PATH.
    pause
    exit /b 1
)

echo.
echo 2. Criando banco de dados 'misterfit_pro'...
%PSQL_PATH% -U postgres -c "CREATE DATABASE misterfit_pro;" 2>nul
if %errorlevel% equ 0 (
    echo Banco de dados criado com sucesso!
) else (
    echo Banco de dados ja existe ou erro na criacao.
)

echo.
echo 3. Criando usuario 'misterfit_user'...
%PSQL_PATH% -U postgres -c "CREATE USER misterfit_user WITH PASSWORD 'misterfit123';" 2>nul
if %errorlevel% equ 0 (
    echo Usuario criado com sucesso!
) else (
    echo Usuario ja existe ou erro na criacao.
)

echo.
echo 4. Concedendo permissoes ao usuario...
%PSQL_PATH% -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE misterfit_pro TO misterfit_user;" 2>nul
%PSQL_PATH% -U postgres -c "ALTER USER misterfit_user CREATEDB;" 2>nul
echo Permissoes concedidas!

echo.
echo 5. Executando schema do banco de dados...
%PSQL_PATH% -U misterfit_user -d misterfit_pro -f backend/database/schema.sql
if %errorlevel% equ 0 (
    echo Schema executado com sucesso!
) else (
    echo Erro ao executar schema. Verifique as credenciais.
)

echo.
echo 6. Criando arquivo de configuracao local...
(
echo # Configuracoes do Servidor
echo PORT=5000
echo NODE_ENV=development
echo.
echo # PostgreSQL Credentials
echo DB_HOST=localhost
echo DB_PORT=5432
echo DB_NAME=misterfit_pro
echo DB_USER=misterfit_user
echo DB_PASSWORD=misterfit123
echo.
echo # Supabase Credentials (opcional - para usar Supabase em vez de PostgreSQL local)
echo SUPABASE_URL=https://seu-projeto.supabase.co
echo SUPABASE_ANON_KEY=sua-chave-publica
echo SUPABASE_SERVICE_KEY=sua-chave-privada
) > backend/config.env

echo Arquivo de configuracao criado!

echo.
echo ========================================
echo Configuracao concluida!
echo ========================================
echo.
echo Credenciais do banco:
echo - Host: localhost
echo - Porta: 5432
echo - Database: misterfit_pro
echo - Usuario: misterfit_user
echo - Senha: misterfit123
echo.
echo Para iniciar o servidor backend:
echo cd backend
echo npm install
echo npm run dev
echo.
pause 